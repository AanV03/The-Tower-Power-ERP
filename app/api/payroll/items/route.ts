import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

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
    const netAmount = data.baseAmount + data.overtimeAmount + data.commissionAmount - data.deductions;

    const item = await prisma.payrollItem.create({
      data: {
        tenantId: context.tenantId,
        payrollPeriodId: data.payrollPeriodId,
        employeeId: data.employeeId,
        baseAmount: new Prisma.Decimal(data.baseAmount),
        overtimeAmount: new Prisma.Decimal(data.overtimeAmount),
        commissionAmount: new Prisma.Decimal(data.commissionAmount),
        deductions: new Prisma.Decimal(data.deductions),
        netAmount: new Prisma.Decimal(netAmount),
      },
    });

    return created(item);
  } catch (error) {
    return fail(error);
  }
}
