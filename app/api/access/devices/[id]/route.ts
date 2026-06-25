import { AccessDeviceStatus, AccessDeviceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { fail, ok, ApiError } from "@/lib/api/response";
import { resolveWritableBranchId } from "@/lib/api/branch";

const UpdateDeviceSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  code: z.string().trim().min(2).max(80).optional(),
  type: z.enum(AccessDeviceType).optional(),
  status: z.enum(AccessDeviceStatus).optional(),
  branchId: z.string().optional(),
});

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireApiContext({ moduleId: "access" });
    const data = UpdateDeviceSchema.parse(await request.json());

    // Verify ownership and existence
    const device = await prisma.accessDevice.findFirst({
      where: {
        id,
        tenantId: context.tenantId,
      },
    });

    if (!device) {
      return fail(new ApiError("Device not found or not owned by this tenant.", 404));
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.branchId !== undefined) {
      updateData.branchId = await resolveWritableBranchId(context, data.branchId);
    }

    const updatedDevice = await prisma.accessDevice.update({
      where: { id },
      data: updateData,
    });

    return ok(updatedDevice);
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
    const context = await requireApiContext({ moduleId: "access" });

    // Verify ownership
    const device = await prisma.accessDevice.findFirst({
      where: {
        id,
        tenantId: context.tenantId,
      },
    });

    if (!device) {
      return fail(new ApiError("Device not found or not owned by this tenant.", 404));
    }

    await prisma.accessDevice.delete({
      where: { id },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
