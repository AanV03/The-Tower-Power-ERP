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
};

export function resolveModuleAccess(moduleId: string): ModuleAccess | null {
  if (moduleId in MODULE_ACCESS) {
    return MODULE_ACCESS[moduleId as ModuleId];
  }

  return null;
}
