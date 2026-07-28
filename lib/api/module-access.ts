import type { ModuleKey } from "@prisma/client";

import type { ModuleId } from "@/data/navigation";

export type ModuleAccess = {
  moduleKey: ModuleKey;
  permission: string;
  allowSystemWithoutTenant?: boolean;
};

type RoutePermission = {
  method: string;
  pattern: RegExp;
  permission: string;
};

const MODULE_ACCESS: Record<ModuleId, ModuleAccess> = {
  dashboard: { moduleKey: "DASHBOARD", permission: "dashboard.read" },
  memberships: {
    moduleKey: "MEMBERSHIPS",
    permission: "memberships.read",
  },
  access: { moduleKey: "ACCESS", permission: "access.read" },
  finance: { moduleKey: "FINANCE", permission: "finance.read" },
  pos: { moduleKey: "POS", permission: "pos.read" },
  inventory: { moduleKey: "INVENTORY", permission: "inventory.read" },
  hr: { moduleKey: "HR", permission: "hr.read" },
  marketing: { moduleKey: "MARKETING", permission: "marketing.read" },
  specialists: {
    moduleKey: "SPECIALISTS",
    permission: "specialists.read",
  },
  admin: {
    moduleKey: "ADMIN",
    permission: "admin.read",
    allowSystemWithoutTenant: true,
  },
  catalog: { moduleKey: "CATALOG", permission: "catalog.read" },
  purchases: { moduleKey: "PURCHASES", permission: "purchases.read" },
  warehouse: { moduleKey: "WAREHOUSE", permission: "warehouse.read" },
  accounting: {
    moduleKey: "ACCOUNTING",
    permission: "accounting.read",
  },
  payroll: { moduleKey: "PAYROLL", permission: "payroll.read" },
  analytics: { moduleKey: "ANALYTICS", permission: "analytics.read" },
  integrations: {
    moduleKey: "INTEGRATIONS",
    permission: "integrations.read",
  },
  maintenance: {
    moduleKey: "MAINTENANCE",
    permission: "maintenance.read",
  },
};

const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    method: "GET",
    pattern: /^\/api\/access\/devices$/,
    permission: "access.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/access\/(?:check|validate)$/,
    permission: "access.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/access\/devices$/,
    permission: "access.write",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/access\/devices\/[^/]+$/,
    permission: "access.write",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/access\/devices\/[^/]+$/,
    permission: "access.admin",
  },
  {
    method: "GET",
    pattern: /^\/api\/(?:admin\/tenant|branches)$/,
    permission: "admin.read",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/admin\/tenant$/,
    permission: "admin.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/branches$/,
    permission: "admin.write",
  },
  {
    method: "GET",
    pattern: /^\/api\/analytics\/summary$/,
    permission: "analytics.read",
  },
  {
    method: "GET",
    pattern: /^\/api\/accounting\/(?:accounts|journal-entries)$/,
    permission: "accounting.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/accounting\/accounts$/,
    permission: "accounting.account.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/accounting\/journal-entries$/,
    permission: "accounting.journal.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/accounting\/journal-entries\/[^/]+\/void$/,
    permission: "accounting.void",
  },
  {
    method: "GET",
    pattern: /^\/api\/catalog\/(?:categories|products)$/,
    permission: "catalog.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/catalog\/(?:categories|products)$/,
    permission: "catalog.write",
  },
  {
    method: "PUT",
    pattern: /^\/api\/catalog\/(?:categories|products)\/[^/]+$/,
    permission: "catalog.write",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/catalog\/(?:categories|products)\/[^/]+$/,
    permission: "catalog.admin",
  },
  {
    method: "GET",
    pattern: /^\/api\/finance\/(?:invoices|payments)$/,
    permission: "finance.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/finance\/(?:invoices|payments)$/,
    permission: "finance.write",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/finance\/invoices\/[^/]+$/,
    permission: "finance.write",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/finance\/invoices\/[^/]+$/,
    permission: "finance.admin",
  },
  {
    method: "GET",
    pattern: /^\/api\/hr\/(?:branch-budgets|employees|time-clock)$/,
    permission: "hr.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/hr\/branch-budgets$/,
    permission: "hr.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/hr\/employees$/,
    permission: "hr.employee.write",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/hr\/employees\/[^/]+$/,
    permission: "hr.employee.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/hr\/(?:attendance|time-clock)$/,
    permission: "hr.attendance.write",
  },
  {
    method: "GET",
    pattern: /^\/api\/integrations\/(?:events|outbox)$/,
    permission: "integrations.read",
  },
  {
    method: "GET",
    pattern: /^\/api\/inventory\/(?:movements|products|warehouses)$/,
    permission: "inventory.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/inventory\/(?:movements|products|warehouses)$/,
    permission: "inventory.write",
  },
  {
    method: "PUT",
    pattern: /^\/api\/inventory\/warehouses\/[^/]+$/,
    permission: "inventory.write",
  },
  {
    method: "DELETE",
    pattern: /^\/api\/inventory\/warehouses\/[^/]+$/,
    permission: "inventory.admin",
  },
  {
    method: "GET",
    pattern: /^\/api\/maintenance\/tickets$/,
    permission: "maintenance.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/maintenance\/tickets$/,
    permission: "maintenance.write",
  },
  {
    method: "GET",
    pattern: /^\/api\/memberships\/(?:members|plans|subscriptions)$/,
    permission: "memberships.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/memberships\/(?:members|plans|subscriptions)$/,
    permission: "memberships.write",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/memberships\/subscriptions$/,
    permission: "memberships.write",
  },
  {
    method: "GET",
    pattern: /^\/api\/payroll\/(?:items|periods)$/,
    permission: "payroll.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/payroll\/periods$/,
    permission: "payroll.period.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/payroll\/items$/,
    permission: "payroll.receipt.write",
  },
  {
    method: "POST",
    pattern: /^\/api\/payroll\/periods\/[^/]+\/preview$/,
    permission: "payroll.preview",
  },
  {
    method: "POST",
    pattern: /^\/api\/payroll\/periods\/[^/]+\/approve$/,
    permission: "payroll.approve",
  },
  {
    method: "POST",
    pattern: /^\/api\/payroll\/periods\/[^/]+\/pay$/,
    permission: "payroll.pay",
  },
  {
    method: "GET",
    pattern: /^\/api\/pos\/(?:registers|sales|sessions)$/,
    permission: "pos.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/pos\/(?:checkout|registers|sales|sessions)$/,
    permission: "pos.write",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/pos\/sessions$/,
    permission: "pos.write",
  },
  {
    method: "GET",
    pattern: /^\/api\/purchases\/invoices$/,
    permission: "purchases.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/purchases\/invoices$/,
    permission: "purchases.write",
  },
  {
    method: "GET",
    pattern: /^\/api\/specialists(?:\/(?:sessions|settlements))?$/,
    permission: "specialists.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/specialists(?:\/(?:sessions|settlements))?$/,
    permission: "specialists.write",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/specialists\/settlements$/,
    permission: "specialists.approve",
  },
  {
    method: "GET",
    pattern: /^\/api\/warehouse\/(?:items|movements)$/,
    permission: "warehouse.read",
  },
  {
    method: "POST",
    pattern: /^\/api\/warehouse\/(?:items|movements)$/,
    permission: "warehouse.write",
  },
];

export function resolveModuleAccess(
  moduleId: string,
): ModuleAccess | null {
  if (moduleId in MODULE_ACCESS) {
    return MODULE_ACCESS[moduleId as ModuleId];
  }

  return null;
}

export function isAdministrationPath(pathname: string) {
  const normalizedPath = pathname.replace(
    /^\/(?:en|es|fr)(?=\/)/,
    "",
  );
  return (
    normalizedPath === "/admin" ||
    normalizedPath.startsWith("/admin/") ||
    normalizedPath === "/api/admin" ||
    normalizedPath.startsWith("/api/admin/")
  );
}

export function resolveRoutePermission(
  method: string,
  pathname: string,
) {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  return (
    ROUTE_PERMISSIONS.find(
      (route) =>
        route.method === normalizedMethod &&
        route.pattern.test(normalizedPath),
    )?.permission ?? null
  );
}
