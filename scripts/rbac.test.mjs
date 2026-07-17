import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

test("seeds action-specific permissions for hr payroll and accounting", () => {
  const seed = readFileSync(join(process.cwd(), "prisma/seed.ts"), "utf8");
  const tenantBootstrap = readFileSync(join(process.cwd(), "lib/auth/tenant-context.ts"), "utf8");
  const required = [
    "hr.read",
    "hr.employee.write",
    "hr.contract.write",
    "hr.attendance.write",
    "payroll.read",
    "payroll.period.write",
    "payroll.receipt.write",
    "payroll.preview",
    "payroll.approve",
    "payroll.pay",
    "accounting.read",
    "accounting.account.write",
    "accounting.journal.write",
    "accounting.post",
    "accounting.void",
  ];

  for (const permission of required) {
    assert.match(seed, new RegExp(`"${permission}"`), `${permission} is seeded`);
    assert.match(tenantBootstrap, new RegExp(`"${permission}"`), `${permission} is granted to bootstrap owners`);
  }

  assert.match(seed, /name: "Auditor"[\s\S]*"accounting\.read"/);
  assert.doesNotMatch(seed, /name: "Auditor"[\s\S]*"accounting\.manage"/);
  assert.match(seed, /name: "Entrenador"[\s\S]*"hr\.attendance\.write"/);
  assert.doesNotMatch(seed, /name: "Entrenador"[\s\S]*"payroll\.manage"/);
});
