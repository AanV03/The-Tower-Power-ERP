import type { RoleScope } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string | null;
      branchId: string | null;
      branchIds: string[];
      roles: string[];
      roleScopes: RoleScope[];
      permissions: string[];
      modules: string[];
      isSystemAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    tenantId?: string | null;
    branchId?: string | null;
    branchIds?: string[];
    roles?: string[];
    roleScopes?: RoleScope[];
    permissions?: string[];
    modules?: string[];
    isSystemAdmin?: boolean;
    sessionIpAddress?: string | null;
    sessionUserAgent?: string | null;
    sessionCorrelationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    jti?: string;
    tenantId?: string | null;
    branchId?: string | null;
    branchIds?: string[];
    roles?: string[];
    roleScopes?: RoleScope[];
    permissions?: string[];
    modules?: string[];
    isSystemAdmin?: boolean;
  }
}
