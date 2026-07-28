import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { postPayrollToAccounting } from "@/lib/accounting/payroll-posting";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  try {
    const context = await requireApiContext({ moduleId: "payroll", permission: "payroll.pay" });
    const { periodId } = await params;

    const result = await postPayrollToAccounting({
      tenantId: context.tenantId,
      payrollPeriodId: periodId,
    });

    if (!result.created) {
      throw new ApiError(
        "Payroll payment was already processed or is in progress.",
        409,
        "PAYROLL_ALREADY_PROCESSED",
      );
    }

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
