import { OutboxStatus, Prisma } from "@prisma/client";

import { createWebhookSignature } from "./webhook-signature";

const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BASE_BACKOFF_MS = 30_000;
const DEFAULT_MAX_BACKOFF_MS = 60 * 60 * 1000;
const DEFAULT_LEASE_MS = 2 * 60 * 1000;

export type ClaimedOutboxEvent = {
  id: string;
  tenantId: string;
  type: string;
  aggregateType: string;
  aggregateId: string;
  payload: Prisma.JsonValue;
  status: OutboxStatus;
  attempts: number;
  availableAt: Date;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ClaimOptions = {
  tenantId?: string;
  batchSize: number;
  maxAttempts: number;
  leaseMs: number;
  now: Date;
};

type FailureUpdate = {
  terminal: boolean;
  availableAt: Date;
};

export type OutboxWorkerStore = {
  claim(options: ClaimOptions): Promise<ClaimedOutboxEvent[]>;
  markProcessed(event: ClaimedOutboxEvent, processedAt: Date): Promise<boolean>;
  markFailed(event: ClaimedOutboxEvent, update: FailureUpdate): Promise<boolean>;
};

export type OutboxWorkerOptions = {
  tenantId?: string;
  batchSize?: number;
  maxAttempts?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
  leaseMs?: number;
  now?: () => Date;
  handler?: (event: ClaimedOutboxEvent) => Promise<void>;
  store?: OutboxWorkerStore;
};

function boundedInteger(value: number | undefined, fallback: number, minimum: number, maximum: number) {
  if (!Number.isInteger(value)) return fallback;
  return Math.min(Math.max(value as number, minimum), maximum);
}

export function calculateOutboxBackoffMs(
  attempt: number,
  baseBackoffMs = DEFAULT_BASE_BACKOFF_MS,
  maxBackoffMs = DEFAULT_MAX_BACKOFF_MS,
) {
  const exponent = Math.max(attempt - 1, 0);
  return Math.min(baseBackoffMs * 2 ** exponent, maxBackoffMs);
}

async function withEventTenant<T>(
  event: Pick<ClaimedOutboxEvent, "tenantId">,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  const { prisma, setTenantTransactionContext } = await import("../db/prisma");

  return prisma.$transaction(async (tx) => {
    await setTenantTransactionContext(tx, event.tenantId);
    return operation(tx);
  });
}

const prismaOutboxStore: OutboxWorkerStore = {
  async claim(options) {
    const { prisma, setTenantTransactionContext } = await import("../db/prisma");

    return prisma.$transaction(async (tx) => {
      if (options.tenantId) {
        await setTenantTransactionContext(tx, options.tenantId);
      }

      await tx.outboxEvent.updateMany({
        where: {
          ...(options.tenantId ? { tenantId: options.tenantId } : {}),
          status: { in: [OutboxStatus.PENDING, OutboxStatus.PROCESSING] },
          attempts: { gte: options.maxAttempts },
          availableAt: { lte: options.now },
        },
        data: { status: OutboxStatus.FAILED },
      });

      const tenantId = options.tenantId ?? null;

      return tx.$queryRaw<ClaimedOutboxEvent[]>`
        WITH candidates AS (
          SELECT event."id"
          FROM "outbox_events" AS event
          WHERE event."attempts" < ${options.maxAttempts}
            AND (
              (
                event."status" = CAST('PENDING' AS "OutboxStatus")
                AND event."availableAt" <= CURRENT_TIMESTAMP
              )
              OR (
                event."status" = CAST('PROCESSING' AS "OutboxStatus")
                AND event."availableAt" <= CURRENT_TIMESTAMP
              )
            )
            AND (${tenantId}::text IS NULL OR event."tenantId" = ${tenantId})
          ORDER BY event."availableAt" ASC, event."createdAt" ASC
          FOR UPDATE SKIP LOCKED
          LIMIT ${options.batchSize}
        )
        UPDATE "outbox_events" AS event
        SET
          "status" = CAST('PROCESSING' AS "OutboxStatus"),
          "attempts" = event."attempts" + 1,
          "availableAt" = CURRENT_TIMESTAMP + (${options.leaseMs} * INTERVAL '1 millisecond'),
          "updatedAt" = CURRENT_TIMESTAMP
        FROM candidates
        WHERE event."id" = candidates."id"
        RETURNING event.*
      `;
    });
  },

  async markProcessed(event, processedAt) {
    return withEventTenant(event, async (tx) => {
      const result = await tx.outboxEvent.updateMany({
        where: {
          id: event.id,
          tenantId: event.tenantId,
          status: OutboxStatus.PROCESSING,
          attempts: event.attempts,
        },
        data: {
          status: OutboxStatus.PROCESSED,
          processedAt,
          availableAt: processedAt,
        },
      });

      return result.count === 1;
    });
  },

  async markFailed(event, update) {
    return withEventTenant(event, async (tx) => {
      const result = await tx.outboxEvent.updateMany({
        where: {
          id: event.id,
          tenantId: event.tenantId,
          status: OutboxStatus.PROCESSING,
          attempts: event.attempts,
        },
        data: {
          status: update.terminal ? OutboxStatus.FAILED : OutboxStatus.PENDING,
          availableAt: update.availableAt,
          processedAt: null,
        },
      });

      return result.count === 1;
    });
  },
};

function getDeliveryConfiguration() {
  const urlValue = process.env.OUTBOX_WEBHOOK_URL?.trim();
  const secret = process.env.OUTBOX_WEBHOOK_SECRET?.trim();

  if (!urlValue || !secret || secret.length < 32) {
    throw new Error("OUTBOX_WEBHOOK_CONFIGURATION_REQUIRED");
  }

  const url = new URL(urlValue);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("OUTBOX_WEBHOOK_URL_INVALID");
  }

  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("OUTBOX_WEBHOOK_HTTPS_REQUIRED");
  }

  return { url, secret };
}

export async function deliverOutboxWebhook(event: ClaimedOutboxEvent) {
  const { url, secret } = getDeliveryConfiguration();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify({
    id: event.id,
    tenantId: event.tenantId,
    type: event.type,
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    payload: event.payload,
    createdAt: event.createdAt.toISOString(),
  });
  const signature = createWebhookSignature({ body, secret, timestamp });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": event.id,
      "x-webhook-signature": signature,
      "x-webhook-timestamp": timestamp,
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`OUTBOX_WEBHOOK_HTTP_${response.status}`);
  }
}

export async function processOutboxBatch(options: OutboxWorkerOptions = {}) {
  const tenantId = options.tenantId?.trim();
  if (options.tenantId !== undefined && !tenantId) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  const now = options.now ?? (() => new Date());
  const batchSize = boundedInteger(options.batchSize, DEFAULT_BATCH_SIZE, 1, 100);
  const maxAttempts = boundedInteger(options.maxAttempts, DEFAULT_MAX_ATTEMPTS, 1, 20);
  const leaseMs = boundedInteger(options.leaseMs, DEFAULT_LEASE_MS, 5_000, 15 * 60 * 1000);
  const baseBackoffMs = boundedInteger(
    options.baseBackoffMs,
    DEFAULT_BASE_BACKOFF_MS,
    1_000,
    60 * 60 * 1000,
  );
  const maxBackoffMs = boundedInteger(
    options.maxBackoffMs,
    DEFAULT_MAX_BACKOFF_MS,
    baseBackoffMs,
    24 * 60 * 60 * 1000,
  );
  const handler = options.handler ?? deliverOutboxWebhook;
  const store = options.store ?? prismaOutboxStore;
  const events = await store.claim({
    tenantId,
    batchSize,
    maxAttempts,
    leaseMs,
    now: now(),
  });
  const result = {
    claimed: events.length,
    processed: 0,
    retried: 0,
    failed: 0,
    leaseLost: 0,
  };

  for (const event of events) {
    try {
      await handler(event);
      const updated = await store.markProcessed(event, now());
      updated ? result.processed += 1 : result.leaseLost += 1;
    } catch {
      const terminal = event.attempts >= maxAttempts;
      const delay = calculateOutboxBackoffMs(event.attempts, baseBackoffMs, maxBackoffMs);
      const updated = await store.markFailed(event, {
        terminal,
        availableAt: new Date(now().getTime() + delay),
      });

      if (!updated) {
        result.leaseLost += 1;
      } else if (terminal) {
        result.failed += 1;
      } else {
        result.retried += 1;
      }
    }
  }

  return result;
}
