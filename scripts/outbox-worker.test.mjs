import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./webhook-signature" &&
      context.parentURL?.endsWith("/lib/integrations/outbox-worker.ts")
    ) {
      return {
        shortCircuit: true,
        url: new URL(
          "../lib/integrations/webhook-signature.ts",
          import.meta.url,
        ).href,
      };
    }

    return nextResolve(specifier, context);
  },
});

const {
  createWebhookSignature,
  verifyWebhookSignature,
} = await import("../lib/integrations/webhook-signature.ts");
const {
  calculateOutboxBackoffMs,
  processOutboxBatch,
} = await import("../lib/integrations/outbox-worker.ts");

test("validates signed webhook payloads and rejects tampering or stale requests", () => {
  const secret = "outbox-test-secret-at-least-32-characters";
  const body = JSON.stringify({ batchSize: 10 });
  const timestamp = "1785100000";
  const now = Number(timestamp) * 1000;
  const signature = createWebhookSignature({ body, secret, timestamp });

  assert.equal(
    verifyWebhookSignature({ body, secret, signature, timestamp, now }),
    true,
  );
  assert.equal(
    verifyWebhookSignature({
      body: `${body} `,
      secret,
      signature,
      timestamp,
      now,
    }),
    false,
  );
  assert.equal(
    verifyWebhookSignature({
      body,
      secret,
      signature,
      timestamp,
      now: now + 301_000,
    }),
    false,
  );
});

test("calculates capped exponential backoff", () => {
  assert.equal(calculateOutboxBackoffMs(1, 1_000, 10_000), 1_000);
  assert.equal(calculateOutboxBackoffMs(2, 1_000, 10_000), 2_000);
  assert.equal(calculateOutboxBackoffMs(5, 1_000, 10_000), 10_000);
});

test("processes, retries and dead-letters claimed events", async () => {
  const fixedNow = new Date("2026-07-27T12:00:00.000Z");
  const baseEvent = {
    tenantId: "tenant-1",
    aggregateType: "member",
    aggregateId: "member-1",
    payload: {},
    status: "PROCESSING",
    availableAt: fixedNow,
    processedAt: null,
    createdAt: fixedNow,
    updatedAt: fixedNow,
  };
  const events = [
    { ...baseEvent, id: "success", type: "success", attempts: 1 },
    { ...baseEvent, id: "retry", type: "retry", attempts: 2 },
    { ...baseEvent, id: "dead", type: "dead", attempts: 3 },
  ];
  const processed = [];
  const failures = [];
  const store = {
    claim: async (options) => {
      assert.equal(options.batchSize, 10);
      assert.equal(options.maxAttempts, 3);
      return events;
    },
    markProcessed: async (event) => {
      processed.push(event.id);
      return true;
    },
    markFailed: async (event, update) => {
      failures.push({ id: event.id, ...update });
      return true;
    },
  };

  const result = await processOutboxBatch({
    batchSize: 10,
    maxAttempts: 3,
    baseBackoffMs: 1_000,
    maxBackoffMs: 10_000,
    now: () => fixedNow,
    store,
    handler: async (event) => {
      if (event.type !== "success") throw new Error("DELIVERY_FAILED");
    },
  });

  assert.deepEqual(result, {
    claimed: 3,
    processed: 1,
    retried: 1,
    failed: 1,
    leaseLost: 0,
  });
  assert.deepEqual(processed, ["success"]);
  assert.equal(failures[0].id, "retry");
  assert.equal(failures[0].terminal, false);
  assert.equal(failures[0].availableAt.toISOString(), "2026-07-27T12:00:02.000Z");
  assert.equal(failures[1].id, "dead");
  assert.equal(failures[1].terminal, true);
});
