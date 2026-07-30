const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_WINDOW_MS = 60_000;
const MAX_TRACKED_IPS = 10_000;

type RateLimitBucket = {
  attempts: number;
  resetAt: number;
};

type RateLimitState = {
  buckets: Map<string, RateLimitBucket>;
  lastSweepAt: number;
};

type LoginRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
};

const globalRateLimit = globalThis as typeof globalThis & {
  __towerPowerLoginRateLimit?: RateLimitState;
};

const state =
  globalRateLimit.__towerPowerLoginRateLimit ??
  { buckets: new Map<string, RateLimitBucket>(), lastSweepAt: 0 };

globalRateLimit.__towerPowerLoginRateLimit = state;

function sweepExpiredBuckets(now: number) {
  if (now - state.lastSweepAt < LOGIN_WINDOW_MS) return;

  for (const [key, bucket] of state.buckets) {
    if (bucket.resetAt <= now) state.buckets.delete(key);
  }

  state.lastSweepAt = now;
}

export function consumeLoginAttempt(
  ipAddress: string | null,
  now = Date.now(),
): LoginRateLimitResult {
  return consumeAttempt(`login:${ipAddress?.trim() || "unknown"}`, now);
}

export function consumeTwoFactorAttempt(
  userId: string,
  ipAddress: string | null,
  now = Date.now(),
): LoginRateLimitResult {
  return consumeAttempt(
    `mfa:${userId.trim()}:${ipAddress?.trim() || "unknown"}`,
    now,
  );
}

function consumeAttempt(
  key: string,
  now: number,
): LoginRateLimitResult {
  sweepExpiredBuckets(now);

  const current = state.buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (state.buckets.size >= MAX_TRACKED_IPS) {
      const oldestKey = state.buckets.keys().next().value;
      if (oldestKey) state.buckets.delete(oldestKey);
    }

    const resetAt = now + LOGIN_WINDOW_MS;
    state.buckets.set(key, { attempts: 1, resetAt });

    return {
      allowed: true,
      remaining: LOGIN_ATTEMPT_LIMIT - 1,
      retryAfterSeconds: 0,
      resetAt: new Date(resetAt),
    };
  }

  if (current.attempts >= LOGIN_ATTEMPT_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1_000),
      ),
      resetAt: new Date(current.resetAt),
    };
  }

  current.attempts += 1;

  return {
    allowed: true,
    remaining: LOGIN_ATTEMPT_LIMIT - current.attempts,
    retryAfterSeconds: 0,
    resetAt: new Date(current.resetAt),
  };
}

export function resetLoginRateLimitForTests() {
  state.buckets.clear();
  state.lastSweepAt = 0;
}
