import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { onboardingPlanSelectionSchema } from "@/modules/onboarding/schemas/onboarding.schema";
import { saveOnboardingPlan } from "@/modules/onboarding/services/onboarding.service";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "admin",
      permission: "admin.write",
    });
    const body = await request.json().catch(() => {
      throw new ApiError(
        "Request body must be valid JSON.",
        400,
        "INVALID_JSON",
      );
    });
    const input = onboardingPlanSelectionSchema.parse(body);
    const onboarding = await saveOnboardingPlan(context, input);

    return ok({ onboarding });
  } catch (error) {
    return fail(error);
  }
}
