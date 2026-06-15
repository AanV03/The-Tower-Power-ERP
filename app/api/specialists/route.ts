import { BranchStatus, SpecialistType } from "@prisma/client";
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
  type: z.enum(SpecialistType),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
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

    const specialist = await prisma.specialist.create({
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

    return created(specialist);
  } catch (error) {
    return fail(error);
  }
}
