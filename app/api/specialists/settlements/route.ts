import { SettlementStatus } from "@prisma/client";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_TIME_ZONE, getDayBoundsForLocalDate } from "@/lib/date/timezone";
import {
  createSpecialistSettlement,
  transitionSpecialistSettlementStatus,
} from "@/modules/specialists/services/commission.service";

const SettlementStatusSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toUpperCase() : value),
  z.enum(SettlementStatus),
);

const SpecialistSettlementSchema = z.object({
  specialistId: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  status: SettlementStatusSchema.default(SettlementStatus.DRAFT),
});

const UpdateSpecialistSettlementSchema = z.object({
  settlementId: z.string().min(1),
  status: SettlementStatusSchema,
});

export const runtime = "nodejs";

function parsePeriodBoundary(value: string, timeZone: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return getDayBoundsForLocalDate(value, timeZone).start;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError("Settlement period date is invalid.", 400, "INVALID_PERIOD_DATE");
  }

  return date;
}

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

    if (data.status === SettlementStatus.PAID) {
      throw new ApiError("Settlements must be approved before they can be marked as paid.", 409, "INVALID_SETTLEMENT_TRANSITION");
    }

    const specialist = await prisma.specialist.findFirst({
      where: {
        id: data.specialistId,
        tenantId: context.tenantId,
        ...(context.branchId
          ? {
              OR: [{ branchId: context.branchId }, { branchId: null }],
            }
          : {}),
      },
      include: { branch: { select: { timezone: true } } },
    });

    if (!specialist) {
      throw new ApiError("Specialist was not found for this branch.", 404, "SPECIALIST_NOT_FOUND");
    }

    const timeZone = specialist.branch?.timezone ?? DEFAULT_TIME_ZONE;
    const periodStart = parsePeriodBoundary(data.periodStart, timeZone);
    const periodEnd = parsePeriodBoundary(data.periodEnd, timeZone);

    if (periodEnd < periodStart) {
      throw new ApiError("Period end must be greater than or equal to period start.", 400, "INVALID_PERIOD");
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

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const data = UpdateSpecialistSettlementSchema.parse(await request.json());

    if (context.branchId) {
      const settlement = await prisma.specialistSettlement.findFirst({
        where: {
          id: data.settlementId,
          tenantId: context.tenantId,
          specialist: {
            OR: [{ branchId: context.branchId }, { branchId: null }],
          },
        },
        select: { id: true },
      });

      if (!settlement) {
        throw new ApiError("Settlement was not found for this branch.", 404, "SETTLEMENT_NOT_FOUND");
      }
    }

    const settlement = await prisma.$transaction((tx) =>
      transitionSpecialistSettlementStatus(tx, {
        tenantId: context.tenantId,
        settlementId: data.settlementId,
        status: data.status,
      }),
    );

    return ok(settlement);
  } catch (error) {
    return fail(error);
  }
}
