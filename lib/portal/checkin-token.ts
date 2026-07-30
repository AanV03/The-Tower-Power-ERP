import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { getAuthSecret } from "@/lib/auth/session";

export type PortalCheckInTokenPayload = {
  iss: "gerpy";
  aud: "gerpy-access";
  sub: string;
  tenantId: string;
  branchId: string;
  jti: string;
  iat: number;
  exp: number;
};

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

export function createPortalCheckInToken(input: {
  tenantId: string;
  branchId: string;
  memberId: string;
}) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: PortalCheckInTokenPayload = {
    iss: "gerpy",
    aud: "gerpy-access",
    sub: input.memberId,
    tenantId: input.tenantId,
    branchId: input.branchId,
    jti: randomUUID(),
    iat: issuedAt,
    exp: issuedAt + 15,
  };
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  const unsignedToken = `${header}.${body}`;

  return {
    token: `${unsignedToken}.${sign(unsignedToken)}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function verifyPortalCheckInToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const unsignedToken = `${parts[0]}.${parts[1]}`;
  const receivedSignature = Buffer.from(parts[2], "base64url");
  const expectedSignature = Buffer.from(sign(unsignedToken), "base64url");
  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as PortalCheckInTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.iss !== "gerpy" ||
      payload.aud !== "gerpy-access" ||
      !payload.sub ||
      !payload.tenantId ||
      !payload.branchId ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
