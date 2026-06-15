import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canAccessBranch,
  canAccessModule,
  hasPermission,
  requireBranchAccess,
  requireModuleAccess,
  requirePermission,
  requireTenantContext,
} from "../lib/auth/rbac.ts";

const context = {
  userId: "usr_1",
  tenantId: "ten_1",
  branchId: "br_1",
  roles: ["Super Admin"],
  permissions: ["finance.read", "memberships.write"],
  modules: ["FINANCE", "MEMBERSHIPS"],
};

test("checks permission membership from tenant context", () => {
  assert.equal(hasPermission(context, "finance.read"), true);
  assert.equal(hasPermission(context, "finance.write"), false);
});

test("checks enabled tenant modules from tenant context", () => {
  assert.equal(canAccessModule(context, "FINANCE"), true);
  assert.equal(canAccessModule(context, "INVENTORY"), false);
});

test("checks branch access from tenant context", () => {
  assert.equal(canAccessBranch(context, "br_1"), true);
  assert.equal(canAccessBranch(context, "br_2"), false);
  assert.equal(canAccessBranch({ ...context, branchId: null }, "br_2"), true);
});

test("throws explicit auth and scope errors for server guards", () => {
  assert.equal(requireTenantContext(context), context);
  assert.equal(requirePermission(context, "finance.read"), context);
  assert.equal(requireModuleAccess(context, "FINANCE"), context);
  assert.equal(requireBranchAccess(context, "br_1"), context);

  assert.throws(() => requireTenantContext(null), /AUTH_REQUIRED/);
  assert.throws(() => requirePermission(context, "finance.write"), /PERMISSION_DENIED/);
  assert.throws(() => requireModuleAccess(context, "INVENTORY"), /MODULE_DISABLED/);
  assert.throws(() => requireBranchAccess(context, "br_2"), /BRANCH_ACCESS_DENIED/);
});
