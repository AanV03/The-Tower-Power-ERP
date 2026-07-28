import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { withTenantTransaction } from "@/lib/db/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const context = await requireApiContext();
    const notificationId = (await params).id.trim();

    if (!notificationId) {
      throw new ApiError(
        "Notification id is required.",
        400,
        "NOTIFICATION_ID_REQUIRED",
      );
    }

    const recipient = await withTenantTransaction(
      context.tenantId,
      async (tx) => {
        const existing = await tx.notificationRecipient.findFirst({
          where: {
            tenantId: context.tenantId,
            notificationId,
            userId: context.userId,
            deleted: false,
            notification: { tenantId: context.tenantId },
          },
          include: { notification: true },
        });

        if (!existing) {
          throw new ApiError(
            "Notification was not found.",
            404,
            "NOTIFICATION_NOT_FOUND",
          );
        }

        if (existing.read) return existing;

        return tx.notificationRecipient.update({
          where: {
            notificationId_userId: {
              notificationId,
              userId: context.userId,
            },
          },
          data: { read: true, readAt: new Date() },
          include: { notification: true },
        });
      },
    );

    return ok(recipient);
  } catch (error) {
    return fail(error);
  }
}
