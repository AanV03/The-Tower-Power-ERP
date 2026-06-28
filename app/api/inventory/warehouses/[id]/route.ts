import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { fail, ok, ApiError } from "@/lib/api/response";

const UpdateWarehouseSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().trim().min(2).max(120),
});

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "inventory" });
    const { id } = await params;
    const bodyJson = await request.json();
    const data = UpdateWarehouseSchema.parse(bodyJson);

    // Resolve branch ID checking permissions
    const branchId = await resolveWritableBranchId(context, data.branchId);

    // Verify warehouse belongs to tenant
    const existing = await prisma.warehouse.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!existing) {
      return fail(new ApiError("Almacén no encontrado", 404));
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        branchId,
        name: data.name,
      },
    });

    return ok(warehouse);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "inventory" });
    const { id } = await params;

    // Verify warehouse belongs to tenant
    const existing = await prisma.warehouse.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!existing) {
      return fail(new ApiError("Almacén no encontrado", 404));
    }

    // Check for existing items or movements to prevent database constraint crash
    const [itemCount, movementCount] = await Promise.all([
      prisma.inventoryItem.count({ where: { warehouseId: id } }),
      prisma.inventoryMovement.count({ where: { warehouseId: id } }),
    ]);

    if (itemCount > 0 || movementCount > 0) {
      return fail(
        new ApiError(
          "No se puede eliminar el almacén porque contiene productos o movimientos registrados.",
          400
        )
      );
    }

    await prisma.warehouse.delete({
      where: { id },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
