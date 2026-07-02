import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canReadNavigationItem,
  filterNavigationGroupsByPermission,
  filterNavigationItemsByPermission,
} from "../lib/auth/navigation-permissions.ts";
import { navigationGroups, navigationItems } from "../data/navigation.ts";

const baseContext = {
  userId: "usr_frontend",
  tenantId: "ten_frontend",
  branchId: null,
  roles: ["Branch Manager"],
  permissions: [],
  modules: [],
};

function contextWith(permissions, modules) {
  return {
    ...baseContext,
    permissions,
    modules,
  };
}

test("shows navigation items only when the user has module read permission", () => {
  const context = contextWith(["dashboard.read", "payroll.read"], ["DASHBOARD", "PAYROLL"]);
  const visibleItems = filterNavigationItemsByPermission(navigationItems, context);

  assert.deepEqual(
    visibleItems.map((item) => item.id),
    ["dashboard", "payroll"],
  );
});

test("does not treat write permission as read access in frontend navigation", () => {
  const context = contextWith(["payroll.write"], ["PAYROLL"]);
  const payrollItem = navigationItems.find((item) => item.id === "payroll");

  assert.ok(payrollItem);
  assert.equal(canReadNavigationItem(context, payrollItem), false);
});

test("allows admin permission to expose read navigation for the same module", () => {
  const context = contextWith(["admin.admin"], ["ADMIN"]);
  const adminItem = navigationItems.find((item) => item.id === "admin");

  assert.ok(adminItem);
  assert.equal(canReadNavigationItem(context, adminItem), true);
});

test("removes empty sidebar groups after filtering inaccessible items", () => {
  const context = contextWith(["payroll.read"], ["PAYROLL"]);
  const visibleGroups = filterNavigationGroupsByPermission(navigationGroups, context);

  assert.deepEqual(
    visibleGroups.map((group) => group.id),
    ["people"],
  );
  assert.deepEqual(
    visibleGroups[0].items.map((item) => item.id),
    ["payroll"],
  );
});
