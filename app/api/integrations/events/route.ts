import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "integrations" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("provider") ? { provider: searchParams.get("provider") ?? undefined } : {}),
      ...(searchParams.get("status") ? { status: searchParams.get("status") ?? undefined } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.paymentGatewayEvent.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.paymentGatewayEvent.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}
