import { test } from "node:test";
import assert from "node:assert/strict";

import { formatCurrency, parsePagination } from "../lib/api/pagination.ts";
import { resolveModuleAccess, resolveRoutePermission } from "../lib/api/module-access.ts";

test("resolves module ids to Prisma module keys and permissions", () => {
  assert.deepEqual(resolveModuleAccess("memberships"), {
    moduleKey: "MEMBERSHIPS",
    permission: "memberships.read",
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
    permission: "catalog.read",
  });

  assert.deepEqual(resolveModuleAccess("purchases"), {
    moduleKey: "PURCHASES",
    permission: "purchases.read",
  });

  assert.deepEqual(resolveModuleAccess("warehouse"), {
    moduleKey: "WAREHOUSE",
    permission: "warehouse.read",
  });

  assert.deepEqual(resolveModuleAccess("accounting"), {
    moduleKey: "ACCOUNTING",
    permission: "accounting.read",
  });

  assert.deepEqual(resolveModuleAccess("payroll"), {
    moduleKey: "PAYROLL",
    permission: "payroll.read",
  });

  assert.deepEqual(resolveModuleAccess("analytics"), {
    moduleKey: "ANALYTICS",
    permission: "analytics.read",
  });

  assert.deepEqual(resolveModuleAccess("integrations"), {
    moduleKey: "INTEGRATIONS",
    permission: "integrations.read",
  });

  assert.deepEqual(resolveModuleAccess("maintenance"), {
    moduleKey: "MAINTENANCE",
    permission: "maintenance.read",
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

test("resolves action permissions for hr payroll and accounting routes", () => {
  assert.equal(resolveRoutePermission("GET", "/api/hr/time-clock"), "hr.read");
  assert.equal(resolveRoutePermission("POST", "/api/hr/time-clock"), "hr.attendance.write");
  assert.equal(resolveRoutePermission("GET", "/api/hr/employees"), "hr.read");
  assert.equal(resolveRoutePermission("POST", "/api/hr/employees"), "hr.employee.write");

  assert.equal(resolveRoutePermission("GET", "/api/payroll/periods"), "payroll.read");
  assert.equal(resolveRoutePermission("POST", "/api/payroll/periods"), "payroll.period.write");
  assert.equal(resolveRoutePermission("POST", "/api/payroll/periods/period_1/preview"), "payroll.preview");
  assert.equal(resolveRoutePermission("POST", "/api/payroll/periods/period_1/approve"), "payroll.approve");
  assert.equal(resolveRoutePermission("POST", "/api/payroll/periods/period_1/pay"), "payroll.pay");

  assert.equal(resolveRoutePermission("GET", "/api/accounting/accounts"), "accounting.read");
  assert.equal(resolveRoutePermission("POST", "/api/accounting/accounts"), "accounting.account.write");
  assert.equal(resolveRoutePermission("POST", "/api/accounting/journal-entries"), "accounting.journal.write");
  assert.equal(resolveRoutePermission("POST", "/api/accounting/journal-entries/entry_1/void"), "accounting.void");
});

test("resolves granular permissions for operational routes", () => {
  assert.equal(resolveRoutePermission("GET", "/api/catalog/products"), "catalog.read");
  assert.equal(resolveRoutePermission("POST", "/api/catalog/products"), "catalog.write");
  assert.equal(resolveRoutePermission("DELETE", "/api/catalog/products/product_1"), "catalog.admin");
  assert.equal(resolveRoutePermission("GET", "/api/finance/invoices"), "finance.read");
  assert.equal(resolveRoutePermission("POST", "/api/finance/payments"), "finance.write");
  assert.equal(resolveRoutePermission("GET", "/api/pos/sales"), "pos.read");
  assert.equal(resolveRoutePermission("POST", "/api/pos/checkout"), "pos.write");
  assert.equal(resolveRoutePermission("PATCH", "/api/specialists/settlements"), "specialists.approve");
});
