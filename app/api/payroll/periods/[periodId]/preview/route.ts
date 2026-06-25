import { Prisma } from "@prisma/client";

import { requireApiContext } from "@/lib/api/context";
import { ApiError, created, fail } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

function hoursBetween(clockIn: Date, clockOut: Date | null) {
  if (!clockOut) return 0;
  return Math.max((clockOut.getTime() - clockIn.getTime()) / 3_600_000, 0);
}

function decimal(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0).toDecimalPlaces(2);
}

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  try {
    const context = await requireApiContext({ moduleId: "payroll" });
    const { periodId } = await params;

    const items = await prisma.$transaction(async (tx) => {
      const period = await tx.payrollPeriod.findFirst({
        where: {
          id: periodId,
          tenantId: context.tenantId,
        },
      });

      if (!period) {
        throw new ApiError("Payroll period was not found in this tenant.", 404, "PAYROLL_PERIOD_NOT_FOUND");
      }

      if (period.status !== "DRAFT") {
        throw new ApiError("Only draft payroll periods can be previewed.", 409, "PAYROLL_PERIOD_LOCKED");
      }

      const employees = await tx.employee.findMany({
        where: {
          tenantId: context.tenantId,
          status: "ACTIVE",
          ...(context.branchId ? { branchId: context.branchId } : {}),
        },
        include: {
          contracts: {
            where: {
              startDate: { lte: period.endDate },
              OR: [{ endDate: null }, { endDate: { gte: period.startDate } }],
            },
            orderBy: { startDate: "desc" },
            take: 1,
          },
          timeClocks: {
            where: {
              clockIn: { gte: period.startDate, lte: period.endDate },
              clockOut: { not: null },
            },
          },
          specialists: {
            include: {
              settlements: {
                where: {
                  periodStart: { gte: period.startDate },
                  periodEnd: { lte: period.endDate },
                  status: { in: ["DRAFT", "APPROVED"] },
                },
              },
            },
          },
        },
      });

      const payrollItems = [];

      for (const employee of employees) {
        const contract = employee.contracts[0];
        const workedHours = employee.timeClocks.reduce(
          (sum, clock) => sum + hoursBetween(clock.clockIn, clock.clockOut),
          0,
        );
        const baseAmount = contract?.salary
          ? decimal(contract.salary)
          : decimal(contract?.hourlyRate).mul(workedHours).toDecimalPlaces(2);
        const commissionAmount = decimal(
          employee.specialists.reduce(
            (sum, specialist) =>
              sum.plus(
                specialist.settlements.reduce(
                  (settlementSum, settlement) => settlementSum.plus(settlement.netPayout),
                  new Prisma.Decimal(0),
                ),
              ),
            new Prisma.Decimal(0),
          ),
        );
        const overtimeAmount = new Prisma.Decimal(0);
        const deductions = new Prisma.Decimal(0);
        const netAmount = baseAmount.plus(overtimeAmount).plus(commissionAmount).minus(deductions).toDecimalPlaces(2);

        payrollItems.push(
          await tx.payrollItem.upsert({
            where: {
              tenantId_payrollPeriodId_employeeId: {
                tenantId: context.tenantId,
                payrollPeriodId: period.id,
                employeeId: employee.id,
              },
            },
            create: {
              tenantId: context.tenantId,
              payrollPeriodId: period.id,
              employeeId: employee.id,
              baseAmount,
              overtimeAmount,
              commissionAmount,
              deductions,
              netAmount,
            },
            update: {
              baseAmount,
              overtimeAmount,
              commissionAmount,
              deductions,
              netAmount,
            },
          }),
        );
      }

      return payrollItems;
    });

    return created({ items, total: items.length });
  } catch (error) {
    return fail(error);
  }
}
