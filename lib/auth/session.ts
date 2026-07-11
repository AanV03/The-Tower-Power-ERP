import type { TenantContext } from "@/lib/auth/rbac";

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
  tenantId: string;
  branchId?: string | null;
  role: string;
  roles: string[];
  permissions: string[];
  modules: string[];
  iat: number;
  exp: number;
};

export type SessionTokenPayload = BaseTokenPayload & {
  typ: "session";
};

export type TwoFactorChallengePayload = BaseTokenPayload & {
  typ: "2fa";
};

export type TwoFactorSetupPayload = BaseTokenPayload & {
  typ: "2fa_setup";
};

export type AuthTokenPayload = SessionTokenPayload | TwoFactorChallengePayload | TwoFactorSetupPayload;

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-tower-power-session-secret-change-me";
  }

  throw new Error("AUTH_SECRET is required for The Tower Power auth sessions.");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
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
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return bytesToBase64Url(new Uint8Array(signature));
}

export function tenantContextFromToken(payload: AuthTokenPayload): TenantContext {
  return {
    userId: payload.userId,
    tenantId: payload.tenantId,
    branchId: payload.branchId,
    roles: payload.roles,
    permissions: payload.permissions,
    modules: payload.modules,
  };
}

export async function createAuthToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp" | "sub"> & { userId: string },
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

export async function verifyAuthToken<T extends AuthTokenPayload>(
  token: string | null | undefined,
  expectedType?: TokenType,
) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = await signInput(`${header}.${body}`);
  if (!constantTimeEqual(signature, expectedSignature)) return null;

  const payload = decodeJson<AuthTokenPayload>(body);
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp <= now) return null;
  if (expectedType && payload.typ !== expectedType) return null;
  if (!payload.userId || !payload.tenantId || !payload.role) return null;

  return payload as T;
}
