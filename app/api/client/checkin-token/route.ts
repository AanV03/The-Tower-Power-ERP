import { fail, ok } from "@/lib/api/response";
import { createPortalCheckInToken } from "@/lib/portal/checkin-token";
import { withPortalContext } from "@/lib/portal/context";
import { getPortalTenantSlug } from "@/lib/portal/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const result = await withPortalContext(
      getPortalTenantSlug(request),
      async (_tx, context) =>
        createPortalCheckInToken({
          tenantId: context.tenantId,
          branchId: context.branchId,
          memberId: context.memberId,
        }),
    );

    return ok(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
