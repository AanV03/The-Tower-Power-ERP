import { BranchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { normalizeEmail } from "@/lib/auth/password";

const CreateEmployeeSchema = z.object({
  branchId: z.string().optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email().transform(normalizeEmail).optional(),
  phone: z.string().trim().max(40).optional(),
  positionId: z.string().optional(),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
  hireDate: z.string().datetime().optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as BranchStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: { branch: true, position: true, user: true, contracts: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.employee.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const data = CreateEmployeeSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const employee = await prisma.employee.create({
      data: {
        tenantId: context.tenantId,
        branchId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        positionId: data.positionId,
        status: data.status,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
    });

    return created(employee);
  } catch (error) {
    return fail(error);
  }
}
