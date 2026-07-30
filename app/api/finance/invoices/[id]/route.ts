import { InvoiceStatus, InvoiceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { fail, ok, ApiError } from "@/lib/api/response";
import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireBranchAccess } from "@/lib/auth/rbac";

const UpdateInvoiceSchema = z.object({
  status: z.enum(InvoiceStatus).optional(),
  dueDate: z.string().datetime().optional(),
  issuedAt: z.string().datetime().optional(),
  branchId: z.string().optional(),
});

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireApiContext({
      moduleId: "finance",
      permission: "finance.write",
    });
    const data = UpdateInvoiceSchema.parse(await request.json());

    // Verify ownership and existence
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        tenantId: context.tenantId,
      },
    });

    if (!invoice) {
      return fail(new ApiError("Invoice not found or not owned by this tenant.", 404));
    }
    requireBranchAccess(context, invoice.branchId);

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.issuedAt !== undefined) updateData.issuedAt = new Date(data.issuedAt);
    if (data.branchId !== undefined) {
      updateData.branchId = await resolveWritableBranchId(context, data.branchId);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id, tenantId: context.tenantId },
      data: updateData,
      include: { items: true, customer: true, supplier: true, payments: true },
    });

    return ok(updatedInvoice);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireApiContext({
      moduleId: "finance",
      permission: "finance.admin",
    });

    // Verify ownership
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        tenantId: context.tenantId,
      },
    });

    if (!invoice) {
      return fail(new ApiError("Invoice not found or not owned by this tenant.", 404));
    }
    requireBranchAccess(context, invoice.branchId);

    await prisma.invoice.delete({
      where: { id, tenantId: context.tenantId },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
