export type TenantContext = {
  userId: string;
  tenantId: string;
  branchId?: string | null;
  roles: string[];
  permissions: string[];
  modules: string[];
};

export function hasPermission(context: TenantContext | null | undefined, permission: string) {
  return Boolean(context?.permissions.includes(permission));
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
