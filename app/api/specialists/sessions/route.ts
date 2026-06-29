import { Prisma, SpecialistSessionStatus } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_TIME_ZONE, getDateTimeForTimeZone } from "@/lib/date/timezone";

const optionalId = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

const optionalText = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(2).max(120).optional());

const SpecialistSessionSchema = z.object({
  specialistId: z.string().min(1),
  serviceId: optionalId,
  serviceName: optionalText,
  memberId: optionalId,
  branchId: optionalId,
  scheduledAt: z.string().datetime().optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/).optional(),
  status: z.enum(SpecialistSessionStatus).default(SpecialistSessionStatus.COMPLETED),
  price: z.coerce.number().nonnegative().optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      ...(searchParams.get("specialistId") ? { specialistId: searchParams.get("specialistId") ?? undefined } : {}),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as SpecialistSessionStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.specialistSession.findMany({
        where,
        include: { specialist: true, service: true, member: true, branch: true },
        orderBy: { scheduledAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.specialistSession.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const data = SpecialistSessionSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, tenantId: context.tenantId },
      select: { timezone: true },
    });

    if (!branch) {
      throw new ApiError("Branch was not found for this tenant.", 404, "BRANCH_NOT_FOUND");
    }

    const timeZone = branch.timezone ?? DEFAULT_TIME_ZONE;
    const scheduledAt = data.scheduledDate
      ? getDateTimeForTimeZone(data.scheduledDate, data.scheduledTime ?? "00:00", timeZone)
      : data.scheduledAt
        ? new Date(data.scheduledAt)
        : new Date();

    if (Number.isNaN(scheduledAt.getTime())) {
      throw new ApiError("Session date is invalid.", 400, "INVALID_SESSION_DATE");
    }

    const session = await prisma.$transaction(async (tx) => {
      const specialist = await tx.specialist.findFirst({
        where: {
          id: data.specialistId,
          tenantId: context.tenantId,
          OR: [{ branchId: null }, { branchId }],
        },
      });

      if (!specialist) {
        throw new ApiError("Specialist was not found for this branch.", 404, "SPECIALIST_NOT_FOUND");
      }

      let service = data.serviceId
        ? await tx.specialistService.findFirst({
            where: {
              id: data.serviceId,
              tenantId: context.tenantId,
              specialistId: specialist.id,
            },
          })
        : null;

      if (!service) {
        const serviceName = data.serviceName?.trim() || "Consulta General";
        const servicePrice = new Prisma.Decimal(data.price ?? 650);

        service = await tx.specialistService.upsert({
          where: {
            tenantId_specialistId_name: {
              tenantId: context.tenantId,
              specialistId: specialist.id,
              name: serviceName,
            },
          },
          create: {
            tenantId: context.tenantId,
            specialistId: specialist.id,
            name: serviceName,
            durationMinutes: 60,
            price: servicePrice,
          },
          update: {
            price: servicePrice,
          },
        });
      }

      const selectedMember = data.memberId
        ? await tx.member.findFirst({
            where: {
              id: data.memberId,
              tenantId: context.tenantId,
              branchId,
            },
          })
        : null;
      const member =
        selectedMember ??
        (await tx.member.upsert({
          where: {
            tenantId_email: {
              tenantId: context.tenantId,
              email: `walk-in+${branchId}@gerpy.local`,
            },
          },
          create: {
            tenantId: context.tenantId,
            branchId,
            firstName: "Cliente",
            lastName: "General",
            email: `walk-in+${branchId}@gerpy.local`,
            status: "ACTIVE",
          },
          update: {
            branchId,
            status: "ACTIVE",
          },
        }));

      if (!member) {
        throw new ApiError("Member was not found in this branch.", 404, "MEMBER_NOT_FOUND");
      }

      return tx.specialistSession.create({
        data: {
          tenantId: context.tenantId,
          specialistId: specialist.id,
          serviceId: service.id,
          memberId: member.id,
          branchId,
          scheduledAt,
          completedAt: data.status === SpecialistSessionStatus.COMPLETED ? scheduledAt : undefined,
          status: data.status,
          price: new Prisma.Decimal(data.price ?? service.price),
        },
        include: { specialist: true, service: true, member: true, branch: true },
      });
    });

    return created(session);
  } catch (error) {
    return fail(error);
  }
}
