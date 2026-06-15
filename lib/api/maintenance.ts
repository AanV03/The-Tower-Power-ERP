type BranchReader = {
  branch: {
    findFirst(args: {
      where: { tenantId: string; id: string; status: "ACTIVE" };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
};

class MaintenanceBranchError extends Error {
  status = 400;
  code = "BRANCH_NOT_FOUND";
}

export async function assertMaintenanceBranchBelongsToTenant(
  db: BranchReader,
  tenantId: string,
  branchId: string,
) {
  const branch = await db.branch.findFirst({
    where: { tenantId, id: branchId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!branch) {
    throw new MaintenanceBranchError("BRANCH_NOT_FOUND: Maintenance tickets require an active branch in the current tenant.");
  }
}
