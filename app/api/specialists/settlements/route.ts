import { SettlementStatus } from "@prisma/client";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { createSpecialistSettlement } from "@/modules/specialists/services/commission.service";

const SpecialistSettlementSchema = z.object({
  specialistId: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  status: z.enum(SettlementStatus).default(SettlementStatus.DRAFT),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("specialistId") ? { specialistId: searchParams.get("specialistId") ?? undefined } : {}),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as SettlementStatus } : {}),
      ...(context.branchId
        ? {
            specialist: {
              branchId: context.branchId,
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.specialistSettlement.findMany({
        where,
        include: { specialist: true, items: true, commissions: true },
        orderBy: { periodStart: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.specialistSettlement.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const data = SpecialistSettlementSchema.parse(await request.json());
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    if (periodEnd < periodStart) {
      throw new ApiError("Period end must be greater than or equal to period start.", 400, "INVALID_PERIOD");
    }

    if (context.branchId) {
      const specialist = await prisma.specialist.findFirst({
        where: {
          id: data.specialistId,
          tenantId: context.tenantId,
          branchId: context.branchId,
        },
        select: { id: true },
      });

      if (!specialist) {
        throw new ApiError("Specialist was not found for this branch.", 404, "SPECIALIST_NOT_FOUND");
      }
    }

    const settlement = await prisma.$transaction((tx) =>
      createSpecialistSettlement(tx, {
        tenantId: context.tenantId,
        specialistId: data.specialistId,
        periodStart,
        periodEnd,
        status: data.status,
      }),
    );

    return created(settlement);
  } catch (error) {
    return fail(error);
  }
}
