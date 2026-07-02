export type TenantContext = {
  userId: string;
  tenantId: string;
  branchId?: string | null;
  roles: string[];
  permissions: string[];
  modules: string[];
};

export const PERMISSION_LEVELS = ["read", "write", "approve", "admin"] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function splitPermission(permission: string) {
  const [prefix, level] = permission.split(".");

  if (!prefix || !level || !PERMISSION_LEVELS.includes(level as PermissionLevel)) {
    return null;
  }

  return { prefix, level: level as PermissionLevel };
}

export function buildPermission(permissionPrefix: string, level: PermissionLevel) {
  return `${permissionPrefix}.${level}`;
}

export function inferPermissionLevelFromMethod(method: string | null | undefined): PermissionLevel {
  if (!method) return "read";

  return READ_METHODS.has(method.toUpperCase()) ? "read" : "write";
}

export function hasPermission(context: TenantContext | null | undefined, permission: string) {
  if (!context) return false;

  if (context.permissions.includes(permission)) return true;

  const requested = splitPermission(permission);
  if (!requested) return false;

  return context.permissions.some((ownedPermission) => {
    const owned = splitPermission(ownedPermission);

    return owned?.prefix === requested.prefix && owned.level === "admin";
  });
}

export function canAccessModule(context: TenantContext | null | undefined, moduleKey: string) {
  return Boolean(context?.modules.includes(moduleKey));
}

export function canAccessBranch(
  context: TenantContext | null | undefined,
  branchId: string | null | undefined,
) {
  if (!context || !branchId) return false;
  return context.branchId === null || context.branchId === undefined || context.branchId === branchId;
}

export function requireTenantContext(context: TenantContext | null | undefined) {
  if (!context?.tenantId) {
    throw new Error("AUTH_REQUIRED");
  }

  return context;
}

export function requirePermission(context: TenantContext | null | undefined, permission: string) {
  const resolvedContext = requireTenantContext(context);

  if (!hasPermission(resolvedContext, permission)) {
    throw new Error("PERMISSION_DENIED");
  }

  return resolvedContext;
}

export function requireModuleAccess(context: TenantContext | null | undefined, moduleKey: string) {
  const resolvedContext = requireTenantContext(context);

  if (!canAccessModule(resolvedContext, moduleKey)) {
    throw new Error("MODULE_DISABLED");
  }

  return resolvedContext;
}

export function requireBranchAccess(
  context: TenantContext | null | undefined,
  branchId: string | null | undefined,
) {
  const resolvedContext = requireTenantContext(context);

  if (!canAccessBranch(resolvedContext, branchId)) {
    throw new Error("BRANCH_ACCESS_DENIED");
  }

  return resolvedContext;
}
