import { PayrollStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { DEFAULT_TIME_ZONE, getDayBoundsForLocalDate } from "@/lib/date/timezone";

const CreatePayrollPeriodSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(PayrollStatus).default(PayrollStatus.DRAFT),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "payroll", permission: "payroll.read" });
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
    const context = await requireApiContext({ moduleId: "payroll", permission: "payroll.period.write" });
    const data = CreatePayrollPeriodSchema.parse(await request.json());
    const scopedBranch = context.branchId
      ? await prisma.branch.findFirst({
          where: { tenantId: context.tenantId, id: context.branchId },
          select: { timezone: true },
        })
      : null;
    const timeZone = scopedBranch?.timezone ?? DEFAULT_TIME_ZONE;
    const startDate = getDayBoundsForLocalDate(data.startDate, timeZone).start;
    const endDate = new Date(getDayBoundsForLocalDate(data.endDate, timeZone).end.getTime() - 1);

    if (endDate < startDate) {
      throw new ApiError("Period end must be greater than or equal to period start.", 400, "INVALID_PERIOD");
    }

    const existingPeriod = await prisma.payrollPeriod.findUnique({
      where: {
        tenantId_startDate_endDate: {
          tenantId: context.tenantId,
          startDate,
          endDate,
        },
      },
    });

    if (existingPeriod) {
      return ok(existingPeriod);
    }

    const period = await prisma.payrollPeriod.create({
      data: {
        tenantId: context.tenantId,
        startDate,
        endDate,
        status: data.status,
      },
    });

    return created(period);
  } catch (error) {
    return fail(error);
  }
}
