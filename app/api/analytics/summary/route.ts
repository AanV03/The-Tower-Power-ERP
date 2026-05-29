import { fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";

export const runtime = "nodejs";

export async function GET() {
  try {
    const context = await requireApiContext({ moduleId: "analytics" });
    const summary = await getModuleSummary("analytics", context);
    return ok(summary);
  } catch (error) {
    return fail(error);
  }
}
