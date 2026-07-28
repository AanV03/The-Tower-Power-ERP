import {
  Prisma,
  RoleScope,
  SecurityEventType,
} from "@prisma/client";

import type { AuthorizationContext } from "@/lib/auth/rbac";
import { normalizeEmail } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

export const TOWER_POWER_SESSION_COOKIE = "tower_power_session";
export const TOWER_POWER_TWO_FACTOR_COOKIE = "tower_power_2fa_challenge";
export const TOWER_POWER_TWO_FACTOR_SETUP_COOKIE = "tower_power_2fa_setup";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const TWO_FACTOR_CHALLENGE_MAX_AGE_SECONDS = 60 * 5;
export const TWO_FACTOR_SETUP_MAX_AGE_SECONDS = 60 * 10;

type TokenType = "session" | "2fa" | "2fa_setup";

type BaseTokenPayload = {
  typ: TokenType;
  sub: string;
  userId: string;
  tenantId: string | null;
  branchId?: string | null;
  branchIds: string[];
  role: string;
  roles: string[];
  roleScopes: RoleScope[];
  permissions: string[];
  modules: string[];
  isSystemAdmin: boolean;
  iat: number;
  exp: number;
};

export type SessionTokenPayload = BaseTokenPayload & {
  typ: "session";
  jti: string;
};

export type TwoFactorChallengePayload = BaseTokenPayload & {
  typ: "2fa";
};

export type TwoFactorSetupPayload = BaseTokenPayload & {
  typ: "2fa_setup";
};

export type AuthTokenPayload =
  | SessionTokenPayload
  | TwoFactorChallengePayload
  | TwoFactorSetupPayload;

type AuthTokenInput = Omit<AuthTokenPayload, "iat" | "exp" | "sub"> & {
  userId: string;
};

export type SessionRequestMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
};

type PersistedSessionInput = {
  jti: string;
  sessionToken: string;
  userId: string;
  tenantId: string | null;
  branchId?: string | null;
  expires: Date;
  metadata: SessionRequestMetadata;
  source: "CUSTOM_JWT" | "NEXT_AUTH";
};

type SessionValidationInput = {
  jti: string;
  userId: string;
  tenantId: string | null;
  sessionToken?: string;
};

type RevokeSessionOptions = {
  reason?: string;
  metadata?: SessionRequestMetadata;
};

const EMPTY_SESSION_METADATA: SessionRequestMetadata = {
  ipAddress: null,
  userAgent: null,
  correlationId: null,
};

const LAST_ACTIVITY_WRITE_INTERVAL_MS = 60_000;

export function getAuthSecret() {
  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.JWT_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-tower-power-session-secret-change-me";
  }

  throw new Error("AUTH_SECRET is required for The Tower Power auth sessions.");
}

export function getSessionRequestMetadata(
  request: Pick<Request, "headers">,
): SessionRequestMetadata {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    null;

  return {
    ipAddress,
    userAgent: request.headers.get("user-agent"),
    correlationId:
      request.headers.get("x-correlation-id") ??
      request.headers.get("x-request-id"),
  };
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeJson(value: unknown) {
  return bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(value)),
  );
}

function decodeJson<T>(value: string) {
  const bytes = base64UrlToBytes(value);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function signInput(input: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(input),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return `sha256:${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function securityMetadata(
  jti: string,
  source: PersistedSessionInput["source"],
  metadata: SessionRequestMetadata,
  reason?: string,
): Prisma.InputJsonObject {
  return {
    jti,
    source,
    ...(metadata.userAgent ? { userAgent: metadata.userAgent } : {}),
    ...(reason ? { reason } : {}),
  };
}

async function writeTenantAudit(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string | null;
    userId: string;
    branchId?: string | null;
    action: string;
    jti: string;
    metadata: SessionRequestMetadata;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
  },
) {
  if (!input.tenantId) return;

  const membership = await tx.tenantMembership.findUnique({
    where: {
      tenantId_userId: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
    },
    select: { id: true },
  });

  if (!membership) return;

  await tx.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorId: membership.id,
      branchId: input.branchId,
      action: input.action,
      entity: "Session",
      entityId: input.jti,
      oldValues: input.oldValues,
      newValues: input.newValues,
      ipAddress: input.metadata.ipAddress,
      correlationId: input.metadata.correlationId ?? input.jti,
    },
  });
}

async function persistSessionRecord(input: PersistedSessionInput) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.session.create({
      data: {
        jti: input.jti,
        sessionToken: input.sessionToken,
        userId: input.userId,
        tenantId: input.tenantId,
        expires: input.expires,
        ipAddress: input.metadata.ipAddress,
        deviceInfo: {
          source: input.source,
          ...(input.metadata.userAgent
            ? { userAgent: input.metadata.userAgent }
            : {}),
        },
      },
    });

    await tx.securityEvent.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        eventType: SecurityEventType.LOGIN_SUCCEEDED,
        ipAddress: input.metadata.ipAddress,
        userAgent: input.metadata.userAgent,
        metadata: securityMetadata(
          input.jti,
          input.source,
          input.metadata,
        ),
      },
    });

    await writeTenantAudit(tx, {
      tenantId: input.tenantId,
      userId: input.userId,
      branchId: input.branchId,
      action: "AUTH.LOGIN_SUCCEEDED",
      jti: input.jti,
      metadata: input.metadata,
      newValues: {
        jti: input.jti,
        expires: input.expires.toISOString(),
      },
    });

    return session;
  });
}

export function tenantContextFromToken(
  payload: AuthTokenPayload,
): AuthorizationContext {
  return {
    userId: payload.userId,
    tenantId: payload.tenantId,
    branchId: payload.branchId,
    branchIds: payload.branchIds,
    roles: payload.roles,
    roleScopes: payload.roleScopes,
    permissions: payload.permissions,
    modules: payload.modules,
    isSystemAdmin: payload.isSystemAdmin,
  };
}

export async function createAuthToken(
  payload: AuthTokenInput,
  maxAgeSeconds: number,
) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const body = encodeJson({
    ...payload,
    sub: payload.userId,
    iat: now,
    exp: now + maxAgeSeconds,
  });
  const input = `${header}.${body}`;
  const signature = await signInput(input);

  return `${input}.${signature}`;
}

export async function createPersistedSession(
  payload: Omit<AuthTokenPayload, "iat" | "exp" | "sub" | "jti">,
  metadata: SessionRequestMetadata = EMPTY_SESSION_METADATA,
) {
  const jti = crypto.randomUUID();
  const sessionPayload = {
    ...payload,
    typ: "session" as const,
    jti,
  };
  const token = await createAuthToken(
    sessionPayload,
    SESSION_MAX_AGE_SECONDS,
  );
  const expires = new Date(
    Date.now() + SESSION_MAX_AGE_SECONDS * 1_000,
  );

  await persistSessionRecord({
    jti,
    sessionToken: await hashSessionToken(token),
    userId: payload.userId,
    tenantId: payload.tenantId,
    branchId: payload.branchId,
    expires,
    metadata,
    source: "CUSTOM_JWT",
  });

  return { token, payload: sessionPayload, expires };
}

export async function persistNextAuthSession(input: {
  jti: string;
  userId: string;
  tenantId: string | null;
  branchId?: string | null;
  metadata?: SessionRequestMetadata;
}) {
  const metadata = input.metadata ?? EMPTY_SESSION_METADATA;

  await persistSessionRecord({
    jti: input.jti,
    sessionToken: `next-auth:${input.jti}`,
    userId: input.userId,
    tenantId: input.tenantId,
    branchId: input.branchId,
    expires: new Date(
      Date.now() + SESSION_MAX_AGE_SECONDS * 1_000,
    ),
    metadata,
    source: "NEXT_AUTH",
  });
}

export async function validateSessionJti(
  input: SessionValidationInput,
) {
  const now = new Date();
  const session = await prisma.session.findUnique({
    where: { jti: input.jti },
    select: {
      id: true,
      sessionToken: true,
      userId: true,
      tenantId: true,
      expires: true,
      isRevoked: true,
      lastActivity: true,
      user: { select: { status: true } },
      membership: {
        select: {
          status: true,
          tenant: { select: { status: true } },
        },
      },
    },
  });

  if (
    !session ||
    session.isRevoked ||
    session.expires <= now ||
    session.user.status !== "ACTIVE" ||
    session.userId !== input.userId ||
    session.tenantId !== input.tenantId
  ) {
    return false;
  }

  if (
    session.tenantId &&
    (session.membership?.status !== "ACTIVE" ||
      session.membership.tenant.status !== "ACTIVE")
  ) {
    return false;
  }

  if (
    input.sessionToken &&
    session.sessionToken !==
      (await hashSessionToken(input.sessionToken))
  ) {
    return false;
  }

  if (
    session.lastActivity.getTime() <
    now.getTime() - LAST_ACTIVITY_WRITE_INTERVAL_MS
  ) {
    await prisma.session.updateMany({
      where: {
        id: session.id,
        isRevoked: false,
        lastActivity: {
          lt: new Date(
            now.getTime() - LAST_ACTIVITY_WRITE_INTERVAL_MS,
          ),
        },
      },
      data: { lastActivity: now },
    });
  }

  return true;
}

function isValidAuthorizationPayload(
  payload: AuthTokenPayload,
  expectedType?: TokenType,
) {
  const hasSystemScope =
    Array.isArray(payload.roleScopes) &&
    payload.roleScopes.includes(RoleScope.SYSTEM);
  const hasValidAuthorizationLists =
    Array.isArray(payload.branchIds) &&
    Array.isArray(payload.roles) &&
    Array.isArray(payload.roleScopes) &&
    Array.isArray(payload.permissions) &&
    Array.isArray(payload.modules);

  if (expectedType && payload.typ !== expectedType) return false;
  if (!payload.userId || !payload.role) return false;
  if (!hasValidAuthorizationLists) return false;
  if (!payload.tenantId && !hasSystemScope) return false;
  if (payload.isSystemAdmin !== hasSystemScope) return false;
  if (payload.typ === "session" && !payload.jti) return false;

  return true;
}

export async function verifyAuthToken<
  T extends AuthTokenPayload,
>(
  token: string | null | undefined,
  expectedType?: TokenType,
) {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = await signInput(`${header}.${body}`);
    if (!constantTimeEqual(signature, expectedSignature)) return null;

    const payload = decodeJson<AuthTokenPayload>(body);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) return null;
    if (!isValidAuthorizationPayload(payload, expectedType)) return null;

    if (
      payload.typ === "session" &&
      !(await validateSessionJti({
        jti: payload.jti,
        userId: payload.userId,
        tenantId: payload.tenantId,
        sessionToken: token,
      }))
    ) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

export async function recordLoginFailure(
  email: string | null | undefined,
  metadata: SessionRequestMetadata,
  reason = "INVALID_CREDENTIALS",
) {
  const normalizedEmail = email ? normalizeEmail(email) : "";
  const user = normalizedEmail
    ? await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          memberships: {
            orderBy: { createdAt: "asc" },
            select: { tenantId: true },
            take: 1,
          },
        },
      })
    : null;
  const tenantId = user?.memberships[0]?.tenantId ?? null;

  await prisma.securityEvent.create({
    data: {
      tenantId,
      userId: user?.id ?? null,
      eventType: SecurityEventType.LOGIN_FAILED,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      metadata: {
        reason,
        ...(normalizedEmail
          ? {
              emailFingerprint: await hashSessionToken(
                normalizedEmail,
              ),
            }
          : {}),
      },
    },
  });
}

export async function recordMfaChallengeFailure(input: {
  userId: string;
  tenantId: string | null;
  metadata: SessionRequestMetadata;
  reason: string;
}) {
  await prisma.securityEvent.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      eventType: SecurityEventType.MFA_CHALLENGE_FAILED,
      ipAddress: input.metadata.ipAddress,
      userAgent: input.metadata.userAgent,
      metadata: { reason: input.reason },
    },
  });
}

export async function revokeSessionByJti(
  jti: string,
  options: RevokeSessionOptions = {},
) {
  const metadata = options.metadata ?? EMPTY_SESSION_METADATA;
  const reason = options.reason ?? "SESSION_REVOKED";

  return prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { jti },
      select: {
        id: true,
        jti: true,
        userId: true,
        tenantId: true,
        isRevoked: true,
        deviceInfo: true,
      },
    });

    if (!session || session.isRevoked) return false;

    await tx.session.update({
      where: { id: session.id },
      data: {
        isRevoked: true,
        lastActivity: new Date(),
      },
    });

    const source =
      typeof session.deviceInfo === "object" &&
      session.deviceInfo &&
      !Array.isArray(session.deviceInfo) &&
      session.deviceInfo.source === "NEXT_AUTH"
        ? "NEXT_AUTH"
        : "CUSTOM_JWT";

    await tx.securityEvent.create({
      data: {
        tenantId: session.tenantId,
        userId: session.userId,
        eventType:
          reason === "LOGOUT"
            ? SecurityEventType.LOGOUT
            : SecurityEventType.SESSION_REVOKED,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: securityMetadata(
          session.jti,
          source,
          metadata,
          reason,
        ),
      },
    });

    await writeTenantAudit(tx, {
      tenantId: session.tenantId,
      userId: session.userId,
      action:
        reason === "LOGOUT"
          ? "AUTH.LOGOUT"
          : "AUTH.SESSION_REVOKED",
      jti: session.jti,
      metadata,
      oldValues: { isRevoked: false },
      newValues: { isRevoked: true, reason },
    });

    return true;
  });
}

export async function revokeUserSessions(input: {
  userId: string;
  tenantId?: string | null;
  reason?: string;
  exceptJti?: string;
}) {
  const sessions = await prisma.session.findMany({
    where: {
      userId: input.userId,
      isRevoked: false,
      expires: { gt: new Date() },
      ...(input.tenantId !== undefined
        ? { tenantId: input.tenantId }
        : {}),
      ...(input.exceptJti
        ? { jti: { not: input.exceptJti } }
        : {}),
    },
    select: { jti: true },
  });

  const results = await Promise.all(
    sessions.map((session) =>
      revokeSessionByJti(session.jti, {
        reason: input.reason ?? "RBAC_PERMISSIONS_CHANGED",
      }),
    ),
  );

  return results.filter(Boolean).length;
}
