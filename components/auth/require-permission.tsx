"use client";

import type { ReactNode } from "react";

import { useHasPermission } from "@/components/auth/rbac-provider";

export function RequirePermission({
  children,
  fallback = null,
  permission,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  permission: string;
}) {
  if (!useHasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
