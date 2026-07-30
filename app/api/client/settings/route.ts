import { fail, ok } from "@/lib/api/response";
import {
  getPortalTenantSlug,
  PortalSettingsSchema,
} from "@/lib/portal/schemas";
import {
  getPortalSettings,
  updatePortalSettings,
} from "@/lib/portal/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return ok(await getPortalSettings(getPortalTenantSlug(request)));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = PortalSettingsSchema.parse(await request.json());
    return ok(
      await updatePortalSettings(getPortalTenantSlug(request), input),
    );
  } catch (error) {
    return fail(error);
  }
}
