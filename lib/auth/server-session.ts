import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import {
  TOWER_POWER_SESSION_COOKIE,
  type SessionTokenPayload,
  tenantContextFromToken,
  verifyAuthToken,
} from "@/lib/auth/session";
import type { TenantContext } from "@/lib/auth/rbac";

export async function getSessionPayloadFromRequest(request: NextRequest) {
  const token = request.cookies.get(TOWER_POWER_SESSION_COOKIE)?.value;
  return verifyAuthToken<SessionTokenPayload>(token, "session");
}

export async function getTenantContextFromRequest(request: NextRequest): Promise<TenantContext | null> {
  const payload = await getSessionPayloadFromRequest(request);
  return payload ? tenantContextFromToken(payload) : null;
}

export async function getSessionPayloadFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOWER_POWER_SESSION_COOKIE)?.value;
  return verifyAuthToken<SessionTokenPayload>(token, "session");
}

export async function getTenantContextFromCookies(): Promise<TenantContext | null> {
  const payload = await getSessionPayloadFromCookies();
  return payload ? tenantContextFromToken(payload) : null;
}
