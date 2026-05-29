import { test } from "node:test";
import assert from "node:assert/strict";

import {
  hashPassword,
  isPasswordValid,
  normalizeEmail,
  verifyPassword,
} from "../lib/auth/password.ts";

test("normalizes email for credential lookup", () => {
  assert.equal(normalizeEmail("  MANAGER@GERPY.MX "), "manager@gerpy.mx");
});

test("requires the project password policy for new credentials", () => {
  assert.equal(isPasswordValid("weak"), false);
  assert.equal(isPasswordValid("Gerpy2026!"), true);
});

test("verifies a password against a bcrypt hash", async () => {
  const hash = await hashPassword("Gerpy2026!");
  const ok = await verifyPassword("Gerpy2026!", hash);

  assert.equal(ok, true);
});
