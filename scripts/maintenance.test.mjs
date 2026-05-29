import { test } from "node:test";
import assert from "node:assert/strict";

import { assertMaintenanceBranchBelongsToTenant } from "../lib/api/maintenance.ts";

test("accepts maintenance tickets only for active branches in the current tenant", async () => {
  const prisma = {
    branch: {
      findFirst: async ({ where }) => {
        if (where.tenantId === "tenant_1" && where.id === "branch_1" && where.status === "ACTIVE") {
          return { id: "branch_1" };
        }

        return null;
      },
    },
  };

  await assert.doesNotReject(() =>
    assertMaintenanceBranchBelongsToTenant(prisma, "tenant_1", "branch_1"),
  );

  await assert.rejects(
    () => assertMaintenanceBranchBelongsToTenant(prisma, "tenant_1", "branch_2"),
    /BRANCH_NOT_FOUND/,
  );
});
