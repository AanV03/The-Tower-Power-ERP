import { BranchStatus, SpecialistType, SpecialistContractModel, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateSpecialistSchema = z.object({
  branchId: z.string().nullable().optional(),
  employeeId: z.string().nullable().optional(),
  name: z.string().trim().min(2).max(140),
  specialty: z.string().trim().min(2).max(120),
  type: z.enum(["INTERNAL", "EXTERNAL", "CLINIC"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  model: z.enum(["FIXED_RENT", "COMMISSION", "HYBRID"]).optional(),
  fixedRent: z.coerce.number().nonnegative().optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  serviceName: z.string().trim().optional(),
  servicePrice: z.coerce.number().nonnegative().optional(),
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
    const branchId = data.branchId === null ? null : await resolveWritableBranchId(context, data.branchId);

    const specialist = await prisma.$transaction(async (tx) => {
      // 1. Create specialist
      const spec = await tx.specialist.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          employeeId: data.employeeId ?? undefined,
          name: data.name,
          specialty: data.specialty,
          type: data.type as SpecialistType,
          status: data.status as BranchStatus,
        },
      });

      // 2. Create contract if model provided
      if (data.model) {
        await tx.specialistContract.create({
          data: {
            tenantId: context.tenantId,
            specialistId: spec.id,
            model: data.model as SpecialistContractModel,
            fixedRentAmount: data.fixedRent !== undefined ? new Prisma.Decimal(data.fixedRent) : null,
            commissionRate: data.commissionRate !== undefined ? new Prisma.Decimal(data.commissionRate) : null,
            startDate: new Date(),
            status: BranchStatus.ACTIVE,
          },
        });
      }

      // 3. Create service if serviceName provided
      if (data.serviceName) {
        await tx.specialistService.create({
          data: {
            tenantId: context.tenantId,
            specialistId: spec.id,
            name: data.serviceName,
            durationMinutes: 60,
            price: data.servicePrice !== undefined ? new Prisma.Decimal(data.servicePrice) : new Prisma.Decimal(0),
          },
        });
      }

      return spec;
    });

    return created(specialist);
  } catch (error) {
    return fail(error);
  }
}
