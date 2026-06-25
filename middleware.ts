import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { defaultLocale, locales } from "@/lib/i18n";
import {
  GERPY_SESSION_COOKIE,
  getAuthSecret,
  type SessionTokenPayload,
  verifyAuthToken,
} from "@/lib/auth/session";

const PUBLIC_FILE = /\.(.*)$/;

const PUBLIC_PAGES = new Set(["/", "/login", "/register"]);
const PUBLIC_AUTH_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/2fa/verify",
  "/api/auth/callback",
  "/api/auth/csrf",
  "/api/auth/error",
  "/api/auth/providers",
  "/api/auth/session",
  "/api/auth/signin",
  "/api/auth/signout",
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
];

type MiddlewareAuthContext = {
  userId: string;
  tenantId: string;
  branchId?: string | null;
  role: string;
  roles: string[];
  permissions: string[];
  modules: string[];
};

function hasLocale(pathname: string) {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function stripLocale(pathname: string) {
  const locale = locales.find(
    (candidate) => pathname === `/${candidate}` || pathname.startsWith(`/${candidate}/`),
  );

  if (!locale) return pathname;

  const stripped = pathname.slice(locale.length + 1);
  return stripped.length > 0 ? stripped : "/";
}

function isPublicAuthApi(pathname: string) {
  return PUBLIC_AUTH_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
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
  const sessionCookie = request.cookies.get(GERPY_SESSION_COOKIE)?.value;
  const sessionPayload = await verifyAuthToken<SessionTokenPayload>(sessionCookie, "session");

  if (sessionPayload) {
    return {
      userId: sessionPayload.userId,
      tenantId: sessionPayload.tenantId,
      branchId: sessionPayload.branchId,
      role: sessionPayload.role,
      roles: sessionPayload.roles,
      permissions: sessionPayload.permissions,
      modules: sessionPayload.modules,
    };
  }

  const nextAuthToken = await getToken({
    req: request,
    secret: getAuthSecret(),
  });
  const userId = readString(nextAuthToken?.sub);
  const tenantId = readString(nextAuthToken?.tenantId);
  const roles = readStringList(nextAuthToken?.roles);

  if (!userId || !tenantId) return null;

  return {
    userId,
    tenantId,
    branchId: readString(nextAuthToken?.branchId),
    role: roles[0] ?? "USER",
    roles,
    permissions: readStringList(nextAuthToken?.permissions),
    modules: readStringList(nextAuthToken?.modules),
  };
}

function unauthorizedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      { ok: false, error: "AUTH_REQUIRED", message: "Authentication is required." },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

function nextWithTenantHeaders(request: NextRequest, context: MiddlewareAuthContext) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-user-id", context.userId);
  requestHeaders.set("x-tenant-id", context.tenantId);
  requestHeaders.set("x-user-role", context.role);
  requestHeaders.set("x-user-roles", context.roles.join(","));

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isPublicPage = PUBLIC_PAGES.has(pathname);

  if (pathname.startsWith("/api") && isPublicAuthApi(pathname)) {
    return NextResponse.next();
  }

  const protectedRoute = isProtectedRoute(pathname);
  if (protectedRoute) {
    const context = await getMiddlewareAuthContext(request);

    if (!context?.tenantId) {
      return unauthorizedResponse(request);
    }

    return nextWithTenantHeaders(request, context);
  }

  if (!pathname.startsWith("/api") && !isPublicPage && !hasLocale(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
