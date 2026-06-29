import { NextRequest, NextResponse } from "next/server";

import { requireApiContext } from "@/lib/api/context";
import { fail } from "@/lib/api/response";
import { createSaleSchema } from "@/modules/pos/schemas/pos.schema";
import { PosService } from "@/modules/pos/services/pos.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });
    const payload = createSaleSchema.parse(await req.json());
    const sale = await PosService.executeSale(
      context.tenantId,
      context.branchId ?? null,
      context.userId,
      payload,
    );

    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
