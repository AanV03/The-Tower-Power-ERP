import { fail, ok } from "@/lib/api/response";
import { getPortalTenantSlug } from "@/lib/portal/schemas";
import { getPortalWorkouts } from "@/lib/portal/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return ok(await getPortalWorkouts(getPortalTenantSlug(request)));
  } catch (error) {
    return fail(error);
  }
}
