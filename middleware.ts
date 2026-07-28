import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { defaultLocale, locales } from "@/lib/i18n";
import { isAdministrationPath } from "@/lib/api/module-access";
import {
  TOWER_POWER_SESSION_COOKIE,
  getAuthSecret,
  type SessionTokenPayload,
  validateSessionJti,
  verifyAuthToken,
} from "@/lib/auth/session";

const PUBLIC_FILE = /\.(.*)$/;

const PUBLIC_PAGES = new Set([
  "/",
  "/login",
  "/register",
  "/password-recovery",
  "/email-validation",
  "/invite/accept",
]);
const PUBLIC_AUTH_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/password-recovery",
  "/api/auth/2fa/generate",
  "/api/auth/2fa/verify",
  "/api/auth/callback",
  "/api/auth/csrf",
  "/api/auth/error",
  "/api/auth/providers",
  "/api/auth/session",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/invite/accept",
];

const PROTECTED_PAGE_PREFIXES = [
  "/access",
  "/accounting",
  "/admin",
  "/analytics",
  "/catalog",
  "/dashboard",
  "/finance",
  "/hr",
  "/integrations",
  "/inventory",
  "/maintenance",
  "/marketing",
  "/memberships",
  "/payroll",
  "/pos",
  "/profile",
  "/purchases",
  "/settings",
  "/specialists",
  "/warehouse",
  "/onboarding",
];

type MiddlewareAuthContext = {
  userId: string;
  tenantId: string | null;
  branchId?: string | null;
  branchIds: string[];
  role: string;
  roles: string[];
  roleScopes: string[];
  permissions: string[];
  modules: string[];
  isSystemAdmin: boolean;
};

function hasLocale(pathname: string) {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function getLocaleFromPath(pathname: string) {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function stripLocale(pathname: string) {
  const locale = getLocaleFromPath(pathname);

  if (!locale) return pathname;

  const stripped = pathname.slice(locale.length + 1);
  return stripped.length > 0 ? stripped : "/";
}

function getLegacyAuthRedirect(pathname: string) {
  if (pathname === "/signin" || pathname.startsWith("/signin/")) return "/login";
  if (pathname === "/signup" || pathname.startsWith("/signup/")) return "/register";

  for (const locale of locales) {
    if (pathname === `/${locale}/signin` || pathname.startsWith(`/${locale}/signin/`)) {
      return `/${locale}/login`;
    }

    if (pathname === `/${locale}/signup` || pathname.startsWith(`/${locale}/signup/`)) {
      return `/${locale}/register`;
    }
  }

  return null;
}

function isPublicAuthApi(pathname: string) {
  return PUBLIC_AUTH_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isSignedServiceApi(request: NextRequest) {
  if (request.nextUrl.pathname !== "/api/integrations/outbox") return false;
  if (request.method === "POST") return true;

  const cronSecret = process.env.CRON_SECRET?.trim();
  return (
    request.method === "GET" &&
    Boolean(cronSecret) &&
    request.headers.get("authorization") === `Bearer ${cronSecret}`
  );
}

function isProtectedPage(pathname: string) {
  const normalizedPath = stripLocale(pathname);
  return PROTECTED_PAGE_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}

function isProtectedRoute(pathname: string) {
  if (pathname.startsWith("/api")) {
    return !isPublicAuthApi(pathname);
  }

  return isProtectedPage(pathname);
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function getMiddlewareAuthContext(request: NextRequest): Promise<MiddlewareAuthContext | null> {
  const sessionCookie = request.cookies.get(TOWER_POWER_SESSION_COOKIE)?.value;
  const sessionPayload = await verifyAuthToken<SessionTokenPayload>(sessionCookie, "session");

  if (sessionPayload) {
    return {
      userId: sessionPayload.userId,
      tenantId: sessionPayload.tenantId,
      branchId: sessionPayload.branchId,
      branchIds: sessionPayload.branchIds,
      role: sessionPayload.role,
      roles: sessionPayload.roles,
      roleScopes: sessionPayload.roleScopes,
      permissions: sessionPayload.permissions,
      modules: sessionPayload.modules,
      isSystemAdmin: sessionPayload.isSystemAdmin,
    };
  }

  const nextAuthToken = await getToken({
    req: request,
    secret: getAuthSecret(),
  });
  const userId = readString(nextAuthToken?.sub);
  const jti = readString(nextAuthToken?.jti);
  const tenantId = readString(nextAuthToken?.tenantId);
  const roles = readStringList(nextAuthToken?.roles);
  const roleScopes = readStringList(nextAuthToken?.roleScopes);
  const isSystemAdmin = roleScopes.includes("SYSTEM");

  if (
    !userId ||
    !jti ||
    (!tenantId && !isSystemAdmin) ||
    !(await validateSessionJti({ jti, userId, tenantId }))
  ) {
    return null;
  }

  return {
    userId,
    tenantId,
    branchId: readString(nextAuthToken?.branchId),
    branchIds: readStringList(nextAuthToken?.branchIds),
    role: roles[0] ?? "USER",
    roles,
    roleScopes,
    permissions: readStringList(nextAuthToken?.permissions),
    modules: readStringList(nextAuthToken?.modules),
    isSystemAdmin,
  };
}

function unauthorizedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      { ok: false, error: "AUTH_REQUIRED", message: "Authentication is required." },
      { status: 401 },
    );
  }

  const locale = getLocaleFromPath(request.nextUrl.pathname);
  const loginUrl = new URL(locale ? `/${locale}/login` : "/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

function nextWithTenantHeaders(request: NextRequest, context: MiddlewareAuthContext) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-user-id", context.userId);
  requestHeaders.set("x-user-role", context.role);
  requestHeaders.set("x-user-roles", context.roles.join(","));
  requestHeaders.set("x-user-role-scopes", context.roleScopes.join(","));
  requestHeaders.set("x-system-admin", String(context.isSystemAdmin));
  requestHeaders.set("x-request-method", request.method);
  requestHeaders.set("x-request-path", request.nextUrl.pathname);

  if (context.tenantId) {
    requestHeaders.set("x-tenant-id", context.tenantId);
    requestHeaders.set("x-auth-tenant-id", context.tenantId);
  } else {
    requestHeaders.delete("x-tenant-id");
    requestHeaders.delete("x-auth-tenant-id");
  }

  if (context.branchId) {
    requestHeaders.set("x-branch-id", context.branchId);
  } else {
    requestHeaders.delete("x-branch-id");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function forbiddenResponse(code: string, message: string) {
  return NextResponse.json(
    { ok: false, error: code, message },
    { status: 403 },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const legacyAuthRedirect = getLegacyAuthRedirect(pathname);
  if (legacyAuthRedirect) {
    const url = new URL(legacyAuthRedirect, request.url);
    return NextResponse.redirect(url);
  }

  const isPublicPage = PUBLIC_PAGES.has(stripLocale(pathname));

  if (pathname === "/" || (!pathname.startsWith("/api") && !isPublicPage && !hasLocale(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/api") &&
    (isPublicAuthApi(pathname) || isSignedServiceApi(request))
  ) {
    return NextResponse.next();
  }

  const protectedRoute = isProtectedRoute(pathname);
  if (protectedRoute) {
    const context = await getMiddlewareAuthContext(request);

    if (!context) {
      return unauthorizedResponse(request);
    }

    const requestedTenantId = request.headers.get("x-tenant-id");
    if (
      requestedTenantId &&
      (!context.tenantId || requestedTenantId !== context.tenantId)
    ) {
      return forbiddenResponse(
        "TENANT_MISMATCH",
        "The requested tenant does not match the authenticated session.",
      );
    }

    if (
      !context.tenantId &&
      !(context.isSystemAdmin && isAdministrationPath(pathname))
    ) {
      return forbiddenResponse(
        "TENANT_REQUIRED",
        "A tenant context is required for this route.",
      );
    }

    return nextWithTenantHeaders(request, context);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
