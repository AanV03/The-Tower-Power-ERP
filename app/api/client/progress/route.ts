import { fail, ok } from "@/lib/api/response";
import {
  getPortalTenantSlug,
  PortalProgressSchema,
} from "@/lib/portal/schemas";
import {
  getPortalProgress,
  savePortalProgress,
} from "@/lib/portal/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return ok(await getPortalProgress(getPortalTenantSlug(request)));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = PortalProgressSchema.parse(await request.json());
    return ok(
      await savePortalProgress(getPortalTenantSlug(request), input),
    );
  } catch (error) {
    return fail(error);
  }
}
