import { Prisma, SpecialistSessionStatus } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const SpecialistSessionSchema = z.object({
  specialistId: z.string().min(1),
  serviceId: z.string().min(1),
  memberId: z.string().min(1),
  branchId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  status: z.enum(SpecialistSessionStatus).default(SpecialistSessionStatus.SCHEDULED),
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
    const scheduledAt = new Date(data.scheduledAt);

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

      const service = await tx.specialistService.findFirst({
        where: {
          id: data.serviceId,
          tenantId: context.tenantId,
          specialistId: specialist.id,
        },
      });

      if (!service) {
        throw new ApiError("Service was not found for this specialist.", 404, "SPECIALIST_SERVICE_NOT_FOUND");
      }

      const member = await tx.member.findFirst({
        where: {
          id: data.memberId,
          tenantId: context.tenantId,
          branchId,
        },
      });

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
