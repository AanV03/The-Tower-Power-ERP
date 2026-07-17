import type { ModuleKey } from "@prisma/client";
import type { ModuleId } from "@/data/navigation";

export type ModuleAccess = {
  moduleKey: ModuleKey;
  permission: string;
};

const MODULE_ACCESS: Record<ModuleId, ModuleAccess> = {
  dashboard: { moduleKey: "DASHBOARD", permission: "dashboard.read" },
  memberships: { moduleKey: "MEMBERSHIPS", permission: "memberships.manage" },
  access: { moduleKey: "ACCESS", permission: "access.manage" },
  finance: { moduleKey: "FINANCE", permission: "finance.manage" },
  pos: { moduleKey: "POS", permission: "pos.manage" },
  inventory: { moduleKey: "INVENTORY", permission: "inventory.manage" },
  hr: { moduleKey: "HR", permission: "hr.manage" },
  marketing: { moduleKey: "MARKETING", permission: "marketing.manage" },
  specialists: { moduleKey: "SPECIALISTS", permission: "specialists.manage" },
  admin: { moduleKey: "ADMIN", permission: "admin.manage" },
  catalog: { moduleKey: "CATALOG", permission: "catalog.manage" },
  purchases: { moduleKey: "PURCHASES", permission: "purchases.manage" },
  warehouse: { moduleKey: "WAREHOUSE", permission: "warehouse.manage" },
  accounting: { moduleKey: "ACCOUNTING", permission: "accounting.manage" },
  payroll: { moduleKey: "PAYROLL", permission: "payroll.manage" },
  analytics: { moduleKey: "ANALYTICS", permission: "analytics.manage" },
  integrations: { moduleKey: "INTEGRATIONS", permission: "integrations.manage" },
  maintenance: { moduleKey: "MAINTENANCE", permission: "maintenance.manage" },
};

export function resolveModuleAccess(moduleId: string): ModuleAccess | null {
  if (moduleId in MODULE_ACCESS) {
    return MODULE_ACCESS[moduleId as ModuleId];
  }

  return null;
}

const ROUTE_PERMISSIONS: Array<{
  method: string;
  pattern: RegExp;
  permission: string;
}> = [
  { method: "GET", pattern: /^\/api\/hr\/employees(?:\/[^/]+)?$/, permission: "hr.read" },
  { method: "POST", pattern: /^\/api\/hr\/employees$/, permission: "hr.employee.write" },
  { method: "PATCH", pattern: /^\/api\/hr\/employees\/[^/]+$/, permission: "hr.employee.write" },
  { method: "GET", pattern: /^\/api\/hr\/time-clock$/, permission: "hr.read" },
  { method: "POST", pattern: /^\/api\/hr\/time-clock$/, permission: "hr.attendance.write" },
  { method: "POST", pattern: /^\/api\/hr\/attendance$/, permission: "hr.attendance.write" },
  { method: "GET", pattern: /^\/api\/payroll\/periods$/, permission: "payroll.read" },
  { method: "POST", pattern: /^\/api\/payroll\/periods$/, permission: "payroll.period.write" },
  { method: "GET", pattern: /^\/api\/payroll\/items$/, permission: "payroll.read" },
  { method: "POST", pattern: /^\/api\/payroll\/items$/, permission: "payroll.receipt.write" },
  { method: "POST", pattern: /^\/api\/payroll\/periods\/[^/]+\/preview$/, permission: "payroll.preview" },
  { method: "POST", pattern: /^\/api\/payroll\/periods\/[^/]+\/approve$/, permission: "payroll.approve" },
  { method: "POST", pattern: /^\/api\/payroll\/periods\/[^/]+\/pay$/, permission: "payroll.pay" },
  { method: "GET", pattern: /^\/api\/accounting\/accounts$/, permission: "accounting.read" },
  { method: "POST", pattern: /^\/api\/accounting\/accounts$/, permission: "accounting.account.write" },
  { method: "GET", pattern: /^\/api\/accounting\/journal-entries$/, permission: "accounting.read" },
  { method: "POST", pattern: /^\/api\/accounting\/journal-entries$/, permission: "accounting.journal.write" },
  { method: "POST", pattern: /^\/api\/accounting\/journal-entries\/[^/]+\/void$/, permission: "accounting.void" },
];

export function resolveRoutePermission(method: string, pathname: string) {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return (
    ROUTE_PERMISSIONS.find(
      (route) => route.method === normalizedMethod && route.pattern.test(normalizedPath),
    )?.permission ?? null
  );
}
