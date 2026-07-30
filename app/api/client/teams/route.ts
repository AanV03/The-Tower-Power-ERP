import { fail, ok } from "@/lib/api/response";
import {
  getPortalTenantSlug,
  PortalTeamMembershipSchema,
} from "@/lib/portal/schemas";
import {
  getPortalSocial,
  updatePortalTeamMembership,
} from "@/lib/portal/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return ok(await getPortalSocial(getPortalTenantSlug(request)));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = PortalTeamMembershipSchema.parse(await request.json());
    return ok(
      await updatePortalTeamMembership(
        getPortalTenantSlug(request),
        input.teamId,
        input.joined,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
