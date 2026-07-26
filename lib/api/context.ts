import { RoleScope } from "@prisma/client";
import { headers } from "next/headers";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import { getTenantContextFromCookies } from "@/lib/auth/server-session";
import {
  requireBranchAccess,
  requireModuleAccess,
  requirePermission,
  requireSystemAdmin,
  requireTenantContext,
  type AuthorizationContext,
  type TenantContext,
} from "@/lib/auth/rbac";
import {
  resolveModuleAccess,
  resolveRoutePermission,
} from "@/lib/api/module-access";
import { ApiError } from "@/lib/api/response";

type ApiContextOptions = {
  moduleId?: string;
  permission?: string;
  branchId?: string | null;
};

function readRoleScopes(values: unknown): RoleScope[] {
  if (!Array.isArray(values)) return [];
  return values.filter(
    (value): value is RoleScope =>
      typeof value === "string" &&
      Object.values(RoleScope).includes(value as RoleScope),
  );
}

function sessionToAuthorizationContext(
  session: Session | null,
): AuthorizationContext | null {
  if (!session?.user?.id) return null;

  const roleScopes = readRoleScopes(session.user.roleScopes);
  const isSystemAdmin = roleScopes.includes(RoleScope.SYSTEM);
  if (!session.user.tenantId && !isSystemAdmin) return null;

  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    branchId: session.user.branchId,
    branchIds: session.user.branchIds,
    roles: session.user.roles,
    roleScopes,
    permissions: session.user.permissions,
    modules: session.user.modules,
    isSystemAdmin,
  };
}

function translateGuardError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw new ApiError("Access denied.", 403, "ACCESS_DENIED");
  }

  const guards: Record<string, ApiError> = {
    AUTH_REQUIRED: new ApiError(
      "Authentication is required.",
      401,
      "AUTH_REQUIRED",
    ),
    TENANT_REQUIRED: new ApiError(
      "A tenant context is required.",
      403,
      "TENANT_REQUIRED",
    ),
    TENANT_MISMATCH: new ApiError(
      "The requested tenant does not match the authenticated session.",
      403,
      "TENANT_MISMATCH",
    ),
    MODULE_DISABLED: new ApiError(
      "The requested module is disabled for this tenant.",
      403,
      "MODULE_DISABLED",
    ),
    PERMISSION_DENIED: new ApiError(
      "The current user does not have permission for this action.",
      403,
      "PERMISSION_DENIED",
    ),
    BRANCH_ACCESS_DENIED: new ApiError(
      "The current user cannot access this branch.",
      403,
      "BRANCH_ACCESS_DENIED",
    ),
    SYSTEM_ROLE_REQUIRED: new ApiError(
      "A SYSTEM role is required for this action.",
      403,
      "SYSTEM_ROLE_REQUIRED",
    ),
  };

  throw guards[error.message] ?? error;
}

async function getAuthorizationContext() {
  try {
    const customContext = await getTenantContextFromCookies();
    if (customContext) return customContext;
  } catch {
    // Fall through to the NextAuth session.
  }

  return sessionToAuthorizationContext(await auth());
}

async function authorizeApiContext(
  options: ApiContextOptions,
  allowSystemWithoutTenant: boolean,
): Promise<AuthorizationContext> {
  const context = await getAuthorizationContext();
  if (!context) {
    throw new ApiError(
      "Authentication is required.",
      401,
      "AUTH_REQUIRED",
    );
  }

  const requestHeaders = await headers();
  const requestedTenantId = requestHeaders.get("x-tenant-id");
  if (
    requestedTenantId &&
    (!context.tenantId || requestedTenantId !== context.tenantId)
  ) {
    throw new ApiError(
      "The requested tenant does not match the authenticated session.",
      403,
      "TENANT_MISMATCH",
    );
  }

  try {
    const moduleAccess = options.moduleId
      ? resolveModuleAccess(options.moduleId)
      : null;
    if (options.moduleId && !moduleAccess) {
      throw new ApiError("Unknown module.", 404, "MODULE_NOT_FOUND");
    }

    const systemWithoutTenant =
      context.isSystemAdmin && context.tenantId === null;
    if (systemWithoutTenant) {
      if (
        !allowSystemWithoutTenant ||
        !moduleAccess?.allowSystemWithoutTenant
      ) {
        throw new Error("TENANT_REQUIRED");
      }

      requireSystemAdmin(context);
    } else {
      requireTenantContext(context);
      if (moduleAccess) {
        requireModuleAccess(context, moduleAccess.moduleKey);
      }
      if (options.branchId) {
        requireBranchAccess(context, options.branchId);
      }
    }

    const routePermission = resolveRoutePermission(
      requestHeaders.get("x-request-method") ?? "",
      requestHeaders.get("x-request-path") ?? "",
    );
    const permission =
      options.permission ?? routePermission ?? moduleAccess?.permission;
    if (permission) {
      requirePermission(context, permission);
    }
  } catch (error) {
    translateGuardError(error);
  }

  return context;
}

export async function requireApiContext(
  options: ApiContextOptions = {},
): Promise<TenantContext> {
  const context = await authorizeApiContext(options, false);
  return requireTenantContext(context);
}

export async function requireAdminContext(
  options: Omit<ApiContextOptions, "moduleId"> = {},
) {
  return authorizeApiContext({ ...options, moduleId: "admin" }, true);
}
