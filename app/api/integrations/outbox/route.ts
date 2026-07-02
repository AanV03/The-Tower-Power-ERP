import { OutboxStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "integrations", method: "GET" });
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
