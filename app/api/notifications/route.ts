import { Prisma } from "@prisma/client";

import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { fail, ok } from "@/lib/api/response";
import { withTenantTransaction } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext();
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const unreadOnly = searchParams.get("unread") === "true";
    const where: Prisma.NotificationRecipientWhereInput = {
      tenantId: context.tenantId,
      userId: context.userId,
      deleted: false,
      ...(unreadOnly ? { read: false } : {}),
      notification: { tenantId: context.tenantId },
    };

    const result = await withTenantTransaction(
      context.tenantId,
      async (tx) => {
        const [items, total, unreadCount] = await Promise.all([
          tx.notificationRecipient.findMany({
            where,
            include: {
              notification: {
                include: {
                  branch: {
                    select: { id: true, name: true, code: true },
                  },
                  targetRole: {
                    select: { id: true, name: true, scope: true },
                  },
                },
              },
            },
            orderBy: { notification: { createdAt: "desc" } },
            skip: pagination.skip,
            take: pagination.take,
          }),
          tx.notificationRecipient.count({ where }),
          tx.notificationRecipient.count({
            where: {
              tenantId: context.tenantId,
              userId: context.userId,
              deleted: false,
              read: false,
              notification: { tenantId: context.tenantId },
            },
          }),
        ]);

        return { items, total, unreadCount };
      },
    );

    return ok({ ...result, pagination });
  } catch (error) {
    return fail(error);
  }
}
