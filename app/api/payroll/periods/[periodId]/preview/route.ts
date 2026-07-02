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

function settlementPayrollAmount(settlement: {
  netPayout: Prisma.Decimal;
  commissionAmount: Prisma.Decimal;
  grossAmount: Prisma.Decimal;
}) {
  const netPayout = decimal(settlement.netPayout);
  if (!netPayout.isZero()) return netPayout;

  const commissionAmount = decimal(settlement.commissionAmount);
  if (!commissionAmount.isZero()) return commissionAmount;

  return decimal(settlement.grossAmount);
}

function calculateNetAmount(input: {
  baseAmount: Prisma.Decimal;
  overtimeAmount: Prisma.Decimal;
  commissionAmount: Prisma.Decimal;
  deductions: Prisma.Decimal;
}) {
  return input.baseAmount
    .plus(input.overtimeAmount)
    .plus(input.commissionAmount)
    .minus(input.deductions)
    .toDecimalPlaces(2);
}

function specialistPayrollCommissionAmount(specialist: {
  settlements: Array<{
    netPayout: Prisma.Decimal;
    commissionAmount: Prisma.Decimal;
    grossAmount: Prisma.Decimal;
  }>;
  commissions: Array<{
    netAmount: Prisma.Decimal;
  }>;
}) {
  const settlementAmount = specialist.settlements.reduce(
    (sum, settlement) => sum.plus(settlementPayrollAmount(settlement)),
    new Prisma.Decimal(0),
  );
  const unassignedCommissionAmount = specialist.commissions.reduce(
    (sum, commission) => sum.plus(commission.netAmount),
    new Prisma.Decimal(0),
  );

  return decimal(settlementAmount.plus(unassignedCommissionAmount));
}

function splitSpecialistName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? "Especialista",
      lastName: "Externo",
    };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function isSpecialistPayrollEmployee(email: string | null) {
  return Boolean(email?.startsWith("specialist-") && email.endsWith("@gerpy.demo"));
}

async function getFallbackBranchId(tx: Prisma.TransactionClient, tenantId: string, branchId?: string | null) {
  const branch = await tx.branch.findFirst({
    where: {
      tenantId,
      ...(branchId ? { id: branchId } : { status: "ACTIVE" }),
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!branch) {
    throw new ApiError("At least one active branch is required to preview payroll.", 400, "BRANCH_REQUIRED");
  }

  return branch.id;
}

async function resolveSpecialistPayrollEmployee(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string;
    branchId: string;
    specialistId: string;
    specialistName: string;
    createdAt: Date;
  },
) {
  const email = `specialist-${input.specialistId}@gerpy.demo`;
  const existingEmployee = await tx.employee.findFirst({
    where: {
      tenantId: input.tenantId,
      email,
    },
    select: { id: true },
  });

  if (existingEmployee) return existingEmployee.id;

  const name = splitSpecialistName(input.specialistName);
  const employee = await tx.employee.create({
    data: {
      tenantId: input.tenantId,
      branchId: input.branchId,
      firstName: name.firstName,
      lastName: name.lastName,
      email,
      status: "ACTIVE",
      hireDate: input.createdAt,
    },
    select: { id: true },
  });

  return employee.id;
}

async function upsertPayrollItem(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string;
    payrollPeriodId: string;
    employeeId: string;
    displayName: string;
    source: "EMPLOYEE" | "SPECIALIST";
    baseAmount: Prisma.Decimal;
    overtimeAmount: Prisma.Decimal;
    commissionAmount: Prisma.Decimal;
    deductions: Prisma.Decimal;
  },
) {
  const netAmount = calculateNetAmount(input);
  const payrollItem = await tx.payrollItem.upsert({
    where: {
      tenantId_payrollPeriodId_employeeId: {
        tenantId: input.tenantId,
        payrollPeriodId: input.payrollPeriodId,
        employeeId: input.employeeId,
      },
    },
    create: {
      tenantId: input.tenantId,
      payrollPeriodId: input.payrollPeriodId,
      employeeId: input.employeeId,
      baseAmount: input.baseAmount,
      overtimeAmount: input.overtimeAmount,
      commissionAmount: input.commissionAmount,
      deductions: input.deductions,
      netAmount,
    },
    update: {
      baseAmount: input.baseAmount,
      overtimeAmount: input.overtimeAmount,
      commissionAmount: input.commissionAmount,
      deductions: input.deductions,
      netAmount,
    },
  });

  return {
    payrollItem,
    previewItem: {
      payrollItemId: payrollItem.id,
      employeeId: input.employeeId,
      name: input.displayName,
      source: input.source,
      base: input.baseAmount.toString(),
      overtime: input.overtimeAmount.toString(),
      commission: input.commissionAmount.toString(),
      deductions: input.deductions.toString(),
      net: netAmount.toString(),
    },
  };
}

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  try {
    const context = await requireApiContext({ moduleId: "payroll", method: "POST" });
    const { periodId } = await params;

    const result = await prisma.$transaction(async (tx) => {
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

      const periodEndExclusive = new Date(period.endDate.getTime() + 1);

      const [employees, specialists] = await Promise.all([
        tx.employee.findMany({
          where: {
            tenantId: context.tenantId,
            status: "ACTIVE",
            ...(context.branchId ? { branchId: context.branchId } : {}),
          },
          include: {
            contracts: {
              where: {
                tenantId: context.tenantId,
                startDate: { lte: period.endDate },
                OR: [{ endDate: null }, { endDate: { gte: period.startDate } }],
              },
              orderBy: { startDate: "desc" },
              take: 1,
            },
            timeClocks: {
              where: {
                tenantId: context.tenantId,
                clockIn: { gte: period.startDate, lt: periodEndExclusive },
                clockOut: { not: null },
              },
            },
          },
        }),
        tx.specialist.findMany({
          where: {
            tenantId: context.tenantId,
            status: "ACTIVE",
            ...(context.branchId
              ? {
                  OR: [
                    { branchId: context.branchId },
                    { branchId: null },
                    { employee: { branchId: context.branchId } },
                  ],
                }
              : {}),
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                branchId: true,
              },
            },
            settlements: {
              where: {
                tenantId: context.tenantId,
                periodStart: { lte: period.endDate },
                periodEnd: { gte: period.startDate },
                status: { in: ["DRAFT", "APPROVED", "PAID"] },
              },
            },
            commissions: {
              where: {
                tenantId: context.tenantId,
                settlementId: null,
                calculatedAt: { gte: period.startDate, lt: periodEndExclusive },
              },
            },
          },
        }),
      ]);

      const payrollItems = [];
      const previewItems = [];

      for (const employee of employees) {
        if (isSpecialistPayrollEmployee(employee.email)) continue;

        const contract = employee.contracts[0];
        const workedHours = employee.timeClocks.reduce(
          (sum, clock) => sum + hoursBetween(clock.clockIn, clock.clockOut),
          0,
        );
        const baseAmount = contract?.salary
          ? decimal(contract.salary)
          : decimal(contract?.hourlyRate).mul(workedHours).toDecimalPlaces(2);
        const commissionAmount = new Prisma.Decimal(0);
        const overtimeAmount = new Prisma.Decimal(0);
        const deductions = new Prisma.Decimal(0);
        const item = await upsertPayrollItem(tx, {
          tenantId: context.tenantId,
          payrollPeriodId: period.id,
          employeeId: employee.id,
          displayName: `${employee.firstName} ${employee.lastName}`,
          source: "EMPLOYEE",
          baseAmount,
          overtimeAmount,
          commissionAmount,
          deductions,
        });

        payrollItems.push(item.payrollItem);
        previewItems.push(item.previewItem);
      }

      let fallbackBranchId: string | null = null;

      for (const specialist of specialists) {
        let specialistBranchId = specialist.branchId ?? specialist.employee?.branchId;
        if (!specialistBranchId) {
          fallbackBranchId ??= await getFallbackBranchId(tx, context.tenantId, context.branchId);
          specialistBranchId = fallbackBranchId;
        }

        const employeeId = await resolveSpecialistPayrollEmployee(tx, {
          tenantId: context.tenantId,
          branchId: specialistBranchId,
          specialistId: specialist.id,
          specialistName: specialist.name,
          createdAt: specialist.createdAt,
        });
        const commissionAmount = specialistPayrollCommissionAmount(specialist);
        const baseAmount = new Prisma.Decimal(0);
        const overtimeAmount = new Prisma.Decimal(0);
        const deductions = new Prisma.Decimal(0);
        const item = await upsertPayrollItem(tx, {
          tenantId: context.tenantId,
          payrollPeriodId: period.id,
          employeeId,
          displayName: specialist.name,
          source: "SPECIALIST",
          baseAmount,
          overtimeAmount,
          commissionAmount,
          deductions,
        });

        payrollItems.push(item.payrollItem);
        previewItems.push(item.previewItem);
      }

      return { payrollItems, previewItems };
    });

    return created({
      items: result.previewItems,
      payrollItems: result.payrollItems,
      total: result.previewItems.length,
    });
  } catch (error) {
    return fail(error);
  }
}
