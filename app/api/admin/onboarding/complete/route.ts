import { requireApiContext } from "@/lib/api/context";
import { fail, ok } from "@/lib/api/response";
import { completeOnboarding } from "@/modules/onboarding/services/onboarding.service";

export const runtime = "nodejs";

export async function POST() {
  try {
    const context = await requireApiContext({
      moduleId: "admin",
      permission: "admin.write",
    });
    const result = await completeOnboarding(context);

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
