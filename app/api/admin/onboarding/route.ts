import { requireApiContext } from "@/lib/api/context";
import { fail, ok } from "@/lib/api/response";
import { getOnboardingState } from "@/modules/onboarding/services/onboarding.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const context = await requireApiContext({
      moduleId: "admin",
      permission: "admin.read",
    });
    const onboarding = await getOnboardingState(context);

    return ok({ onboarding });
  } catch (error) {
    return fail(error);
  }
}
