import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { after, test } from "node:test";

const previousAuthSecret = process.env.AUTH_SECRET;
process.env.AUTH_SECRET = "invite-test-secret-with-at-least-32-characters";

const invitationTokenModule = await import(
  new URL("../lib/auth/invitation-token.ts", import.meta.url).href
) as typeof import("../lib/auth/invitation-token");

const {
  buildInvitationUrl,
  createInvitationToken,
  verifyInvitationToken,
} = invitationTokenModule;

after(() => {
  if (previousAuthSecret === undefined) {
    delete process.env.AUTH_SECRET;
  } else {
    process.env.AUTH_SECRET = previousAuthSecret;
  }
});

test("signs and verifies tenant-bound invitation tokens", () => {
  const now = Date.parse("2026-07-28T12:00:00.000Z");
  const token = createInvitationToken({
    userId: "user_123",
    tenantId: "tenant_123",
    expiresAt: now + 60_000,
    now,
  });

  assert.deepEqual(verifyInvitationToken(token, now), {
    userId: "user_123",
    tenantId: "tenant_123",
    expiresAt: now + 60_000,
  });
  const tamperedToken = `${token[0] === "A" ? "B" : "A"}${token.slice(1)}`;
  assert.equal(
    verifyInvitationToken(tamperedToken, now),
    null,
  );
  assert.equal(verifyInvitationToken(token, now + 60_001), null);
});

test("accepts the stateless legacy token format from the integration guide", () => {
  const now = Date.parse("2026-07-28T12:00:00.000Z");
  const expiresAt = now + 60_000;
  const payload = `legacy_user:${expiresAt}`;
  const signature = createHmac("sha256", process.env.AUTH_SECRET!)
    .update(payload)
    .digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url");

  assert.deepEqual(verifyInvitationToken(token, now), {
    userId: "legacy_user",
    tenantId: null,
    expiresAt,
  });
});

test("builds localized invitation URLs from proxy protocol and host headers", () => {
  const request = new Request("http://internal:3000/api/hr/invite", {
    headers: {
      host: "erp.example.com",
      "x-forwarded-proto": "https",
    },
  });
  const url = buildInvitationUrl(request, "signed_token", "fr");

  assert.equal(
    url,
    "https://erp.example.com/fr/invite/accept?token=signed_token",
  );
});

test("middleware exposes localized invitation paths and keeps static bypasses", async () => {
  const source = await readFile(
    new URL("../middleware.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /"\/invite\/accept"/);
  assert.match(source, /"\/api\/auth\/invite\/accept"/);
  assert.match(source, /PUBLIC_PAGES\.has\(stripLocale\(pathname\)\)/);
  assert.ok(
    source.indexOf('pathname.startsWith("/_next")') <
      source.indexOf("const protectedRoute = isProtectedRoute(pathname)"),
  );
});
