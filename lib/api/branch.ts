import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/api/response";
import type { TenantContext } from "@/lib/auth/rbac";
import { requireBranchAccess } from "@/lib/auth/rbac";

export async function resolveWritableBranchId(context: TenantContext, branchId?: string | null) {
  const resolvedBranchId = branchId ?? context.branchId;

  if (resolvedBranchId) {
    requireBranchAccess(context, resolvedBranchId);
    return resolvedBranchId;
  }

  const branch = await prisma.branch.findFirst({
    where: { tenantId: context.tenantId, status: "ACTIVE" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!branch) {
    throw new ApiError("At least one active branch is required.", 400, "BRANCH_REQUIRED");
  }

  return branch.id;
}

export function scopedBranchWhere(context: TenantContext, branchId?: string | null) {
  const resolvedBranchId = branchId ?? context.branchId;
  if (resolvedBranchId) requireBranchAccess(context, resolvedBranchId);

  return {
    tenantId: context.tenantId,
    ...(resolvedBranchId ? { branchId: resolvedBranchId } : {}),
  };
}
