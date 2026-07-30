import { created, fail, ok } from "@/lib/api/response";
import {
  getPortalTenantSlug,
  PortalBookingSchema,
} from "@/lib/portal/schemas";
import {
  cancelPortalBooking,
  createPortalBooking,
} from "@/lib/portal/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = PortalBookingSchema.parse(await request.json());
    const result = await createPortalBooking(
      getPortalTenantSlug(request),
      input.classSessionId,
    );

    return result.idempotent ? ok(result) : created(result);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = PortalBookingSchema.parse(await request.json());
    return ok(
      await cancelPortalBooking(
        getPortalTenantSlug(request),
        input.classSessionId,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
