import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  try {
    const context = await requireApiContext({ moduleId: "payroll", permission: "payroll.approve" });
    const { periodId } = await params;

    const result = await prisma.payrollPeriod.updateMany({
      where: {
        id: periodId,
        tenantId: context.tenantId,
        status: "DRAFT",
      },
      data: { status: "APPROVED" },
    });

    if (result.count === 0) {
      throw new ApiError("Only draft payroll periods can be approved.", 409, "PAYROLL_PERIOD_NOT_DRAFT");
    }

    const period = await prisma.payrollPeriod.findFirstOrThrow({
      where: { id: periodId, tenantId: context.tenantId },
    });

    return ok(period);
  } catch (error) {
    return fail(error);
  }
}
