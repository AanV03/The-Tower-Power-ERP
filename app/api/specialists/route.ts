import { BranchStatus, Prisma, SpecialistContractModel, SpecialistType } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const CreateSpecialistSchema = z.object({
  branchId: z.string().nullable().optional(),
  employeeId: z.string().nullable().optional(),
  name: z.string().trim().min(2).max(140),
  specialty: z.string().trim().min(2).max(120),
  type: z.enum(SpecialistType),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
  contractModel: z.enum(SpecialistContractModel).optional(),
  fixedRentAmount: z.coerce.number().nonnegative().optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  contractStartDate: z.string().datetime().optional(),
  serviceName: z.string().trim().min(2).max(120).optional(),
  servicePrice: z.coerce.number().nonnegative().optional(),
  durationMinutes: z.coerce.number().int().positive().default(60),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as BranchStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.specialist.findMany({
        where,
        include: { branch: true, employee: true, contracts: true, services: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.specialist.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const data = CreateSpecialistSchema.parse(await request.json());
    const branchId =
      data.branchId === null && !context.branchId
        ? null
        : await resolveWritableBranchId(context, data.branchId ?? undefined);

    const specialist = await prisma.$transaction(async (tx) => {
      if (data.employeeId) {
        const employee = await tx.employee.findFirst({
          where: {
            id: data.employeeId,
            tenantId: context.tenantId,
            ...(context.branchId ? { branchId: context.branchId } : {}),
          },
          select: { id: true },
        });

        if (!employee) {
          throw new ApiError("Employee was not found in this tenant.", 404, "EMPLOYEE_NOT_FOUND");
        }
      }

      const createdSpecialist = await tx.specialist.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          employeeId: data.employeeId ?? undefined,
          name: data.name,
          specialty: data.specialty,
          type: data.type,
          status: data.status,
        },
      });

      if (data.contractModel) {
        await tx.specialistContract.create({
          data: {
            tenantId: context.tenantId,
            specialistId: createdSpecialist.id,
            model: data.contractModel,
            fixedRentAmount:
              data.contractModel === SpecialistContractModel.COMMISSION
                ? undefined
                : new Prisma.Decimal(data.fixedRentAmount ?? 0),
            commissionRate:
              data.contractModel === SpecialistContractModel.FIXED_RENT
                ? undefined
                : new Prisma.Decimal(data.commissionRate ?? 0),
            startDate: data.contractStartDate ? new Date(data.contractStartDate) : new Date(),
          },
        });
      }

      if (data.serviceName && data.servicePrice !== undefined) {
        await tx.specialistService.create({
          data: {
            tenantId: context.tenantId,
            specialistId: createdSpecialist.id,
            name: data.serviceName,
            durationMinutes: data.durationMinutes,
            price: new Prisma.Decimal(data.servicePrice),
          },
        });
      }

      return tx.specialist.findUniqueOrThrow({
        where: { id: createdSpecialist.id },
        include: { branch: true, employee: true, contracts: true, services: true },
      });
    });

    return created(specialist);
  } catch (error) {
    return fail(error);
  }
}
