import { PayrollStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreatePayrollPeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(PayrollStatus).default(PayrollStatus.DRAFT),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "payroll" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("status") ? { status: searchParams.get("status") as PayrollStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.payrollPeriod.findMany({
        where,
        include: { items: { include: { employee: true } } },
        orderBy: { startDate: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.payrollPeriod.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "payroll" });
    const data = CreatePayrollPeriodSchema.parse(await request.json());

    const period = await prisma.payrollPeriod.create({
      data: {
        tenantId: context.tenantId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
      },
    });

    return created(period);
  } catch (error) {
    return fail(error);
  }
}
