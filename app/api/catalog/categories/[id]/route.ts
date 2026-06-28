import { BranchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { fail, ok, ApiError } from "@/lib/api/response";

const UpdateCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  parentId: z.string().nullable().optional(),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
});

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "catalog" });
    const { id } = await params;
    const data = UpdateCategorySchema.parse(await request.json());

    // Verify category belongs to tenant
    const existing = await prisma.productCategory.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!existing) {
      return fail(new ApiError("Categoría no encontrada", 404));
    }

    // Check circular references to prevent hierarchy crashes
    if (data.parentId === id) {
      return fail(new ApiError("Una categoría no puede ser su propio elemento principal.", 400));
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        parentId: data.parentId || null,
        status: data.status,
      },
    });

    return ok(category);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireApiContext({ moduleId: "catalog" });
    const { id } = await params;

    // Verify category belongs to tenant
    const existing = await prisma.productCategory.findFirst({
      where: { id, tenantId: context.tenantId },
    });

    if (!existing) {
      return fail(new ApiError("Categoría no encontrada", 404));
    }

    // Check for products or subcategories linked
    const [productCount, childCount] = await Promise.all([
      prisma.product.count({ where: { categoryId: id } }),
      prisma.productCategory.count({ where: { parentId: id } }),
    ]);

    if (productCount > 0 || childCount > 0) {
      return fail(
        new ApiError(
          "No se puede eliminar la categoría porque contiene productos o subcategorías asociadas.",
          400
        )
      );
    }

    await prisma.productCategory.delete({
      where: { id },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
