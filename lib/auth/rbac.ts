import type { RoleScope } from "@prisma/client";

export type AuthorizationContext = {
  userId: string;
  tenantId: string | null;
  branchId?: string | null;
  branchIds: string[];
  roles: string[];
  roleScopes: RoleScope[];
  permissions: string[];
  modules: string[];
  isSystemAdmin: boolean;
};

export type TenantContext = AuthorizationContext & {
  tenantId: string;
};

export function hasPermission(context: AuthorizationContext | null | undefined, permission: string) {
  return Boolean(context?.permissions.includes(permission));
}

export function canAccessModule(context: AuthorizationContext | null | undefined, moduleKey: string) {
  return Boolean(context?.modules.includes(moduleKey));
}

export function canAccessBranch(
  context: AuthorizationContext | null | undefined,
  branchId: string | null | undefined,
) {
  if (!context?.tenantId || !branchId) return false;
  if (!Array.isArray(context.branchIds)) {
    return context.branchId === null || context.branchId === undefined
      ? true
      : context.branchId === branchId;
  }

  const branchIds =
    context.branchIds.length > 0
      ? context.branchIds
      : context.branchId
        ? [context.branchId]
        : [];
  return branchIds.includes(branchId);
}

export function requireTenantContext(
  context: AuthorizationContext | null | undefined,
): TenantContext {
  if (!context) throw new Error("AUTH_REQUIRED");
  if (!context.tenantId) throw new Error("TENANT_REQUIRED");

  return context as TenantContext;
}

export function requirePermission(
  context: AuthorizationContext | null | undefined,
  permission: string,
) {
  if (!context) throw new Error("AUTH_REQUIRED");
  if (!hasPermission(context, permission)) {
    throw new Error("PERMISSION_DENIED");
  }

  return context;
}

export function requireModuleAccess(
  context: AuthorizationContext | null | undefined,
  moduleKey: string,
) {
  if (!context) throw new Error("AUTH_REQUIRED");
  if (!canAccessModule(context, moduleKey)) {
    throw new Error("MODULE_DISABLED");
  }

  return context;
}

export function requireBranchAccess(
  context: AuthorizationContext | null | undefined,
  branchId: string | null | undefined,
) {
  const resolvedContext = requireTenantContext(context);

  if (!canAccessBranch(resolvedContext, branchId)) {
    throw new Error("BRANCH_ACCESS_DENIED");
  }

  return resolvedContext;
}

export function requireSystemAdmin(context: AuthorizationContext | null | undefined) {
  if (!context) throw new Error("AUTH_REQUIRED");
  if (!context.isSystemAdmin) throw new Error("SYSTEM_ROLE_REQUIRED");
  return context;
}
