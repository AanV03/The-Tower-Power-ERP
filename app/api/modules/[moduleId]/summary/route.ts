import { ApiError, fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;
    const context = await requireApiContext({ moduleId });
    const summary = await getModuleSummary(moduleId, context);

    return ok(summary);
  } catch (error) {
    if (error instanceof Error && error.message === "MODULE_NOT_FOUND") {
      return fail(new ApiError("Unknown module.", 404, "MODULE_NOT_FOUND"));
    }

    return fail(error);
  }
}
