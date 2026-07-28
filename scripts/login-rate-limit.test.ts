import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const rateLimitModule = await import(
  new URL("../lib/auth/login-rate-limit.ts", import.meta.url).href
) as typeof import("../lib/auth/login-rate-limit");
const {
  consumeLoginAttempt,
  resetLoginRateLimitForTests,
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
