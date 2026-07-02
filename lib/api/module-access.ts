import type { ModuleKey } from "@prisma/client";
import type { ModuleId } from "@/data/navigation";

export type ModuleAccess = {
  moduleKey: ModuleKey;
  permissionPrefix: string;
};

const MODULE_ACCESS: Record<ModuleId, ModuleAccess> = {
  dashboard: { moduleKey: "DASHBOARD", permissionPrefix: "dashboard" },
  memberships: { moduleKey: "MEMBERSHIPS", permissionPrefix: "memberships" },
  access: { moduleKey: "ACCESS", permissionPrefix: "access" },
  finance: { moduleKey: "FINANCE", permissionPrefix: "finance" },
  pos: { moduleKey: "POS", permissionPrefix: "pos" },
  inventory: { moduleKey: "INVENTORY", permissionPrefix: "inventory" },
  hr: { moduleKey: "HR", permissionPrefix: "hr" },
  marketing: { moduleKey: "MARKETING", permissionPrefix: "marketing" },
  specialists: { moduleKey: "SPECIALISTS", permissionPrefix: "specialists" },
  admin: { moduleKey: "ADMIN", permissionPrefix: "admin" },
  catalog: { moduleKey: "CATALOG", permissionPrefix: "catalog" },
  purchases: { moduleKey: "PURCHASES", permissionPrefix: "purchases" },
  warehouse: { moduleKey: "WAREHOUSE", permissionPrefix: "warehouse" },
  accounting: { moduleKey: "ACCOUNTING", permissionPrefix: "accounting" },
  payroll: { moduleKey: "PAYROLL", permissionPrefix: "payroll" },
  analytics: { moduleKey: "ANALYTICS", permissionPrefix: "analytics" },
  integrations: { moduleKey: "INTEGRATIONS", permissionPrefix: "integrations" },
  maintenance: { moduleKey: "MAINTENANCE", permissionPrefix: "maintenance" },
};

export function resolveModuleAccess(moduleId: string): ModuleAccess | null {
  if (moduleId in MODULE_ACCESS) {
    return MODULE_ACCESS[moduleId as ModuleId];
  }

  return null;
}
