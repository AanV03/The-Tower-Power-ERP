"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { hasClientPermission } from "@/lib/auth/navigation-permissions";
import type { TenantContext } from "@/lib/auth/rbac";

const RbacContext = createContext<TenantContext | null>(null);

export function RbacProvider({
  children,
  tenantContext,
}: {
  children: ReactNode;
  tenantContext: TenantContext | null;
}) {
  const value = useMemo(() => tenantContext, [tenantContext]);

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbacContext() {
  return useContext(RbacContext);
}

export function useHasPermission(permission: string) {
  const context = useRbacContext();

  return hasClientPermission(context, permission);
}
