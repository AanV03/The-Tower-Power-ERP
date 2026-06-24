import type { Session } from "next-auth";
import { auth } from "@/auth";
import { getTenantContextFromCookies } from "@/lib/auth/server-session";
import { requireBranchAccess, requireModuleAccess, requirePermission } from "@/lib/auth/rbac";
import type { TenantContext } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api/response";
import { resolveModuleAccess } from "@/lib/api/module-access";

function sessionToTenantContext(session: Session | null): TenantContext | null {
  if (!session?.user?.id || !session.user.tenantId) return null;

  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    branchId: session.user.branchId,
    roles: session.user.roles,
    permissions: session.user.permissions,
    modules: session.user.modules,
  };
}

function translateGuardError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw new ApiError("Access denied.", 403, "ACCESS_DENIED");
  }

  if (error.message === "AUTH_REQUIRED") {
    throw new ApiError("Authentication is required.", 401, "AUTH_REQUIRED");
  }

  if (error.message === "MODULE_DISABLED") {
    throw new ApiError("The requested module is disabled for this tenant.", 403, "MODULE_DISABLED");
  }

  if (error.message === "PERMISSION_DENIED") {
    throw new ApiError("The current user does not have permission for this action.", 403, "PERMISSION_DENIED");
  }

  if (error.message === "BRANCH_ACCESS_DENIED") {
    throw new ApiError("The current user cannot access this branch.", 403, "BRANCH_ACCESS_DENIED");
  }

  throw error;
}

async function getCustomTenantContext() {
  try {
    return await getTenantContextFromCookies();
  } catch {
    return null;
  }
}

export async function requireApiContext(options?: {
  moduleId?: string;
  permission?: string;
  branchId?: string | null;
}) {
  const customContext = await getCustomTenantContext();
  const session = customContext ? null : await auth();
  const context = customContext ?? sessionToTenantContext(session);

  if (!context) {
    throw new ApiError("Authentication is required.", 401, "AUTH_REQUIRED");
  }

  try {
    if (options?.moduleId) {
      const access = resolveModuleAccess(options.moduleId);
      if (!access) throw new ApiError("Unknown module.", 404, "MODULE_NOT_FOUND");

      requireModuleAccess(context, access.moduleKey);
      requirePermission(context, options.permission ?? access.permission);
    } else if (options?.permission) {
      requirePermission(context, options.permission);
    }

    if (options?.branchId) {
      requireBranchAccess(context, options.branchId);
    }
  } catch (error) {
    translateGuardError(error);
  }

  return context;
}
