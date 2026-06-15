import { test } from "node:test";
import assert from "node:assert/strict";

import { formatCurrency, parsePagination } from "../lib/api/pagination.ts";
import { resolveModuleAccess } from "../lib/api/module-access.ts";

test("resolves module ids to Prisma module keys and permissions", () => {
  assert.deepEqual(resolveModuleAccess("memberships"), {
    moduleKey: "MEMBERSHIPS",
    permission: "memberships.manage",
  });

  assert.deepEqual(resolveModuleAccess("dashboard"), {
    moduleKey: "DASHBOARD",
    permission: "dashboard.read",
  });

  assert.equal(resolveModuleAccess("unknown"), null);
});

test("resolves premium ERP module ids to Prisma module keys and permissions", () => {
  assert.deepEqual(resolveModuleAccess("catalog"), {
    moduleKey: "CATALOG",
    permission: "catalog.manage",
  });

  assert.deepEqual(resolveModuleAccess("purchases"), {
    moduleKey: "PURCHASES",
    permission: "purchases.manage",
  });

  assert.deepEqual(resolveModuleAccess("warehouse"), {
    moduleKey: "WAREHOUSE",
    permission: "warehouse.manage",
  });

  assert.deepEqual(resolveModuleAccess("accounting"), {
    moduleKey: "ACCOUNTING",
    permission: "accounting.manage",
  });

  assert.deepEqual(resolveModuleAccess("payroll"), {
    moduleKey: "PAYROLL",
    permission: "payroll.manage",
  });

  assert.deepEqual(resolveModuleAccess("analytics"), {
    moduleKey: "ANALYTICS",
    permission: "analytics.manage",
  });

  assert.deepEqual(resolveModuleAccess("integrations"), {
    moduleKey: "INTEGRATIONS",
    permission: "integrations.manage",
  });

  assert.deepEqual(resolveModuleAccess("maintenance"), {
    moduleKey: "MAINTENANCE",
    permission: "maintenance.manage",
  });
});

test("parses bounded API pagination from URL search params", () => {
  const params = new URLSearchParams({ page: "2", pageSize: "250" });
  assert.deepEqual(parsePagination(params), {
    page: 2,
    pageSize: 100,
    skip: 100,
    take: 100,
  });

  assert.deepEqual(parsePagination(new URLSearchParams({ page: "-1", pageSize: "abc" })), {
    page: 1,
    pageSize: 25,
    skip: 0,
    take: 25,
  });
});

test("formats currency values for API summaries", () => {
  assert.equal(formatCurrency(1420, "MXN"), "$1,420");
  assert.equal(formatCurrency("690.50", "MXN"), "$690.50");
});
