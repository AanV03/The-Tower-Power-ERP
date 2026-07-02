import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const branchId = searchParams.get("branchId") || "";

    const context = await requireApiContext({ moduleId: "analytics", method: "GET" });
    const summary = await getModuleSummary("analytics", context, { range, branchId });
    return ok(summary);
  } catch (error) {
    return fail(error);
  }
}
