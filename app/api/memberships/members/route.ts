import { MemberStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { normalizeEmail } from "@/lib/auth/password";
import { requireBranchAccess } from "@/lib/auth/rbac";

const CreateMemberSchema = z.object({
  branchId: z.string().optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email().transform(normalizeEmail).optional(),
  phone: z.string().trim().max(40).optional(),
  birthDate: z.string().datetime().optional(),
  status: z.enum(MemberStatus).default(MemberStatus.ACTIVE),
});

async function resolveBranchId(tenantId: string, branchId: string | null | undefined) {
  if (branchId) return branchId;

  const branch = await prisma.branch.findFirst({
    where: { tenantId, status: "ACTIVE" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!branch) {
    throw new ApiError("At least one active branch is required.", 400, "BRANCH_REQUIRED");
  }

  return branch.id;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "memberships" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const branchId = searchParams.get("branchId") ?? context.branchId ?? undefined;

    if (branchId) requireBranchAccess(context, branchId);

    const where = {
      tenantId: context.tenantId,
      ...(branchId ? { branchId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.member.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "memberships" });
    const data = CreateMemberSchema.parse(await request.json());
    const branchId = await resolveBranchId(context.tenantId, data.branchId ?? context.branchId);
    requireBranchAccess(context, branchId);

    const member = await prisma.member.create({
      data: {
        tenantId: context.tenantId,
        branchId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        status: data.status,
      },
    });

    return created(member);
  } catch (error) {
    return fail(error);
  }
}
