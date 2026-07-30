import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const rateLimitModule = await import(
  new URL("../lib/auth/login-rate-limit.ts", import.meta.url).href
) as typeof import("../lib/auth/login-rate-limit");
const {
  consumeLoginAttempt,
  consumeTwoFactorAttempt,
  resetLoginRateLimitForTests,
  shouldBypassRateLimit,
} = rateLimitModule;

afterEach(() => {
  resetLoginRateLimitForTests();
});

test("allows five login attempts per IP and blocks the sixth", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = consumeLoginAttempt("203.0.113.10", now);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 5 - attempt);
  }

  const blocked = consumeLoginAttempt("203.0.113.10", now);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 60);
});

test("isolates IP buckets and resets them after one minute", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    consumeLoginAttempt("203.0.113.10", now);
  }

  assert.equal(
    consumeLoginAttempt("198.51.100.20", now).allowed,
    true,
  );
  assert.equal(
    consumeLoginAttempt("203.0.113.10", now + 60_000).allowed,
    true,
  );
});

test("isolates 2FA attempts by user and IP", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal(
      consumeTwoFactorAttempt("user-a", "203.0.113.10", now).allowed,
      true,
    );
  }

  assert.equal(
    consumeTwoFactorAttempt("user-a", "203.0.113.10", now).allowed,
    false,
  );
  assert.equal(
    consumeTwoFactorAttempt("user-b", "203.0.113.10", now).allowed,
    true,
  );
  assert.equal(
    consumeTwoFactorAttempt("user-a", "198.51.100.20", now).allowed,
    true,
  );
});

test("allows the E2E bypass only with the server flag and header", () => {
  const previousValue = process.env.E2E_RATE_LIMIT_BYPASS;
  const previousCi = process.env.CI;
  const previousNodeEnv = process.env.NODE_ENV;

  try {
    process.env.E2E_RATE_LIMIT_BYPASS = "true";
    assert.equal(
      shouldBypassRateLimit(
        new Headers({ "x-e2e-bypass-rate-limit": "true" }),
      ),
      true,
    );
    assert.equal(shouldBypassRateLimit(new Headers()), false);

    process.env.E2E_RATE_LIMIT_BYPASS = "false";
    assert.equal(
      shouldBypassRateLimit(
        new Headers({ "x-e2e-bypass-rate-limit": "true" }),
      ),
      false,
    );

    process.env.E2E_RATE_LIMIT_BYPASS = "true";
    delete process.env.CI;
    Reflect.set(process.env, "NODE_ENV", "production");
    assert.equal(
      shouldBypassRateLimit(
        new Headers({ "x-e2e-bypass-rate-limit": "true" }),
      ),
      false,
    );
  } finally {
    if (previousValue === undefined) {
      delete process.env.E2E_RATE_LIMIT_BYPASS;
    } else {
      process.env.E2E_RATE_LIMIT_BYPASS = previousValue;
    }

    if (previousCi === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = previousCi;
    }

    if (previousNodeEnv === undefined) {
      Reflect.deleteProperty(process.env, "NODE_ENV");
    } else {
      Reflect.set(process.env, "NODE_ENV", previousNodeEnv);
    }
  }
});
