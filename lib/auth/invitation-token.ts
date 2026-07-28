import { createHmac, timingSafeEqual } from "node:crypto";

import type { Locale } from "@/lib/i18n";

const INVITATION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CLOCK_TOLERANCE_MS = 60_000;
const DEFAULT_INVITATION_LOCALE: Locale = "es";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{1,191}$/;
const HOST_PATTERN =
  /^(?:\[[0-9A-Fa-f:]+\]|[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?)(?::\d{1,5})?$/;

export type InvitationTokenClaims = {
  userId: string;
  tenantId: string | null;
  expiresAt: number;
};

export type CreateInvitationTokenInput = {
  userId: string;
  tenantId: string;
  expiresAt?: number;
  now?: number;
};

function getInvitationSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("AUTH_SECRET_REQUIRED_FOR_INVITATIONS");
  }
  return secret;
}

function sign(payload: string, secret = getInvitationSecret()) {
  return createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");
}

function signaturesMatch(actual: string, expected: string) {
  if (!/^[a-f0-9]{64}$/i.test(actual)) return false;

  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function isValidIdentifier(value: string) {
  return IDENTIFIER_PATTERN.test(value);
}

export function createInvitationToken(input: CreateInvitationTokenInput) {
  const now = input.now ?? Date.now();
  const expiresAt = input.expiresAt ?? now + INVITATION_MAX_AGE_MS;

  if (
    !isValidIdentifier(input.userId) ||
    !isValidIdentifier(input.tenantId) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt - now > INVITATION_MAX_AGE_MS
  ) {
    throw new Error("INVALID_INVITATION_TOKEN_INPUT");
  }

  const payload = `${input.userId}:${input.tenantId}:${expiresAt}`;
  return Buffer.from(`${payload}:${sign(payload)}`, "utf8").toString(
    "base64url",
  );
}

export function verifyInvitationToken(
  token: string,
  now = Date.now(),
): InvitationTokenClaims | null {
  const secret = getInvitationSecret();

  try {
    if (
      token.length === 0 ||
      token.length > 2048 ||
      !TOKEN_PATTERN.test(token)
    ) {
      return null;
    }

    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    const isTenantBound = parts.length === 4;
    const isLegacy = parts.length === 3;
    if (!isTenantBound && !isLegacy) return null;

    const userId = parts[0] ?? "";
    const tenantId = isTenantBound ? (parts[1] ?? "") : null;
    const expiresValue = isTenantBound ? parts[2] : parts[1];
    const signature = isTenantBound ? parts[3] : parts[2];
    const expiresAt = Number(expiresValue);
    const payload = isTenantBound
      ? `${userId}:${tenantId}:${expiresValue}`
      : `${userId}:${expiresValue}`;

    if (
      !isValidIdentifier(userId) ||
      (tenantId !== null && !isValidIdentifier(tenantId)) ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= now ||
      expiresAt - now > INVITATION_MAX_AGE_MS + CLOCK_TOLERANCE_MS ||
      !signature ||
      !signaturesMatch(signature, sign(payload, secret))
    ) {
      return null;
    }

    return { userId, tenantId, expiresAt };
  } catch {
    return null;
  }
}

export function buildInvitationUrl(
  request: Pick<Request, "headers" | "url">,
  token: string,
  locale: Locale = DEFAULT_INVITATION_LOCALE,
) {
  const requestUrl = new URL(request.url);
  const protocol =
    request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim()
      .toLowerCase() || requestUrl.protocol.replace(":", "");
  const host = request.headers.get("host")?.trim() || requestUrl.host;

  if (
    !["http", "https"].includes(protocol) ||
    !HOST_PATTERN.test(host)
  ) {
    throw new Error("INVALID_INVITATION_REQUEST_ORIGIN");
  }

  const inviteUrl = new URL(`/${locale}/invite/accept`, `${protocol}://${host}`);
  inviteUrl.searchParams.set("token", token);
  return inviteUrl.toString();
}
