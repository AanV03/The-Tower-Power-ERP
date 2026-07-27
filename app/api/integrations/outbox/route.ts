import { OutboxStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, fail, ok } from "@/lib/api/response";
import { processOutboxBatch } from "@/lib/integrations/outbox-worker";
import { verifyWebhookSignature } from "@/lib/integrations/webhook-signature";

const ProcessOutboxSchema = z.object({
  tenantId: z.string().trim().min(1).max(191).optional(),
  batchSize: z.coerce.number().int().min(1).max(100).default(25),
}).strict();
const MAX_WEBHOOK_BODY_BYTES = 16 * 1024;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
      const secret = process.env.CRON_SECRET?.trim();
      if (!secret || secret.length < 16) {
        throw new ApiError(
          "The cron secret is not configured.",
          503,
          "CRON_SECRET_NOT_CONFIGURED",
        );
      }

      if (authorization !== `Bearer ${secret}`) {
        throw new ApiError(
          "A valid cron authorization is required.",
          401,
          "INVALID_CRON_AUTHORIZATION",
        );
      }

      return ok(await processOutboxBatch());
    }

    const context = await requireApiContext({ moduleId: "integrations" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("status") ? { status: searchParams.get("status") as OutboxStatus } : {}),
      ...(searchParams.get("aggregateType") ? { aggregateType: searchParams.get("aggregateType") ?? undefined } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.outboxEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.outboxEvent.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.INTEGRATIONS_WEBHOOK_SECRET?.trim();
    if (!secret || secret.length < 32) {
      throw new ApiError(
        "The integrations webhook secret is not configured.",
        503,
        "WEBHOOK_SECRET_NOT_CONFIGURED",
      );
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BODY_BYTES) {
      throw new ApiError("Webhook payload is too large.", 413, "WEBHOOK_PAYLOAD_TOO_LARGE");
    }

    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
      throw new ApiError("Webhook payload is too large.", 413, "WEBHOOK_PAYLOAD_TOO_LARGE");
    }

    const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
    const signature = request.headers.get("x-webhook-signature");
    const isValid = verifyWebhookSignature({
      body,
      secret,
      signature,
      timestamp,
    });

    if (!isValid) {
      throw new ApiError(
        "A valid webhook signature is required.",
        401,
        "INVALID_WEBHOOK_SIGNATURE",
      );
    }

    let payload: unknown = {};
    try {
      payload = body ? JSON.parse(body) : {};
    } catch {
      throw new ApiError("Webhook payload must be valid JSON.", 400, "INVALID_WEBHOOK_PAYLOAD");
    }

    const input = ProcessOutboxSchema.parse(payload);
    const result = await processOutboxBatch(input);

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
