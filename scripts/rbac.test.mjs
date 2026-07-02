import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPermission,
  canAccessBranch,
  canAccessModule,
  hasPermission,
  inferPermissionLevelFromMethod,
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
  permissions: ["finance.read", "memberships.write", "specialists.admin"],
  modules: ["FINANCE", "MEMBERSHIPS"],
};

test("checks permission membership from tenant context", () => {
  assert.equal(hasPermission(context, "finance.read"), true);
  assert.equal(hasPermission(context, "finance.write"), false);
});

test("enforces strict granular permission suffixes", () => {
  assert.equal(hasPermission(context, "memberships.write"), true);
  assert.equal(hasPermission(context, "memberships.read"), false);
  assert.equal(hasPermission(context, "memberships.approve"), false);
  assert.equal(hasPermission(context, "finance.write"), false);
});

test("allows admin permission to satisfy granular module actions", () => {
  assert.equal(hasPermission(context, "specialists.read"), true);
  assert.equal(hasPermission(context, "specialists.write"), true);
  assert.equal(hasPermission(context, "specialists.approve"), true);
  assert.equal(hasPermission(context, "specialists.admin"), true);
});

test("builds module permissions and infers permission levels from HTTP methods", () => {
  assert.equal(buildPermission("catalog", "read"), "catalog.read");
  assert.equal(buildPermission("catalog", "write"), "catalog.write");
  assert.equal(buildPermission("catalog", "approve"), "catalog.approve");
  assert.equal(buildPermission("catalog", "admin"), "catalog.admin");

  assert.equal(inferPermissionLevelFromMethod("GET"), "read");
  assert.equal(inferPermissionLevelFromMethod("HEAD"), "read");
  assert.equal(inferPermissionLevelFromMethod("OPTIONS"), "read");
  assert.equal(inferPermissionLevelFromMethod("POST"), "write");
  assert.equal(inferPermissionLevelFromMethod("PUT"), "write");
  assert.equal(inferPermissionLevelFromMethod("PATCH"), "write");
  assert.equal(inferPermissionLevelFromMethod("DELETE"), "write");
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
  assert.throws(() => requirePermission(context, "memberships.read"), /PERMISSION_DENIED/);
  assert.throws(() => requireModuleAccess(context, "INVENTORY"), /MODULE_DISABLED/);
  assert.throws(() => requireBranchAccess(context, "br_2"), /BRANCH_ACCESS_DENIED/);
});
