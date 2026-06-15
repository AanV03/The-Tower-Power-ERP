import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string | null;
      branchId: string | null;
      roles: string[];
      permissions: string[];
      modules: string[];
    } & DefaultSession["user"];
  }

  interface User {
    tenantId?: string | null;
    branchId?: string | null;
    roles?: string[];
    permissions?: string[];
    modules?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string | null;
    branchId?: string | null;
    roles?: string[];
    permissions?: string[];
    modules?: string[];
  }
}
