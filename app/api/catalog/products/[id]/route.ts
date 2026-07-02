import { BranchStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { fail, ok, ApiError } from "@/lib/api/response";

const UpdateProductSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(160),
  categoryId: z.string().nullable().optional(),
  price: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  imageUrl: z.string().trim().nullable().optional(),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
});

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "catalog", method: "PUT" });
    const { id } = await params;
    const data = UpdateProductSchema.parse(await request.json());

    // Verify product belongs to tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!existing) {
      return fail(new ApiError("Producto no encontrado", 404));
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        categoryId: data.categoryId || null,
        price: new Prisma.Decimal(data.price),
        cost: new Prisma.Decimal(data.cost),
        taxRate: new Prisma.Decimal(data.taxRate),
        imageUrl: data.imageUrl || null,
        status: data.status,
      },
    });

    return ok(product);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "catalog", method: "DELETE" });
    const { id } = await params;

    // Verify product belongs to tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!existing) {
      return fail(new ApiError("Producto no encontrado", 404));
    }

    // Check for transactional references to prevent database constraint crash
    const [invoiceItemCount, inventoryItemCount, saleItemCount, inventoryMovementCount] = await Promise.all([
      prisma.invoiceItem.count({ where: { productId: id } }),
      prisma.inventoryItem.count({ where: { productId: id } }),
      prisma.saleItem.count({ where: { productId: id } }),
      prisma.inventoryMovement.count({ where: { productId: id } }),
    ]);

    if (invoiceItemCount > 0 || inventoryItemCount > 0 || saleItemCount > 0 || inventoryMovementCount > 0) {
      return fail(
        new ApiError(
          "No se puede eliminar el producto porque está registrado en transacciones, inventarios o ventas.",
          400
        )
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
