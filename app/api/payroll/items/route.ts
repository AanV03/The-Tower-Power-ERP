import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";

const CreatePayrollItemSchema = z.object({
  payrollPeriodId: z.string(),
  employeeId: z.string(),
  baseAmount: z.coerce.number().nonnegative(),
  overtimeAmount: z.coerce.number().nonnegative().default(0),
  commissionAmount: z.coerce.number().nonnegative().default(0),
  deductions: z.coerce.number().nonnegative().default(0),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "payroll" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("payrollPeriodId") ? { payrollPeriodId: searchParams.get("payrollPeriodId") ?? undefined } : {}),
      ...(searchParams.get("employeeId") ? { employeeId: searchParams.get("employeeId") ?? undefined } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.payrollItem.findMany({
        where,
        include: { employee: true, payrollPeriod: true },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.payrollItem.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "payroll" });
    const data = CreatePayrollItemSchema.parse(await request.json());
    const baseAmount = new Prisma.Decimal(data.baseAmount).toDecimalPlaces(2);
    const overtimeAmount = new Prisma.Decimal(data.overtimeAmount).toDecimalPlaces(2);
    const commissionAmount = new Prisma.Decimal(data.commissionAmount).toDecimalPlaces(2);
    const deductions = new Prisma.Decimal(data.deductions).toDecimalPlaces(2);
    const netAmount = baseAmount.plus(overtimeAmount).plus(commissionAmount).minus(deductions).toDecimalPlaces(2);

    const item = await prisma.$transaction(async (tx) => {
      const [period, employee] = await Promise.all([
        tx.payrollPeriod.findFirst({
          where: {
            id: data.payrollPeriodId,
            tenantId: context.tenantId,
            status: "DRAFT",
          },
          select: { id: true },
        }),
        tx.employee.findFirst({
          where: {
            id: data.employeeId,
            tenantId: context.tenantId,
            ...(context.branchId ? { branchId: context.branchId } : {}),
          },
          select: { id: true },
        }),
      ]);

      if (!period) {
        throw new ApiError("Payroll period was not found or is locked.", 404, "PAYROLL_PERIOD_NOT_FOUND");
      }

      if (!employee) {
        throw new ApiError("Employee was not found in this tenant.", 404, "EMPLOYEE_NOT_FOUND");
      }

      return tx.payrollItem.upsert({
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
        include: { employee: true, payrollPeriod: true },
      });
    });

    return created(item);
  } catch (error) {
    return fail(error);
  }
}
