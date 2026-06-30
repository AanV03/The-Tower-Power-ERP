import { InventoryMovementType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { createInventoryMovement } from "@/lib/api/inventory-movements";
import { created, fail, ok } from "@/lib/api/response";

const CreateMovementSchema = z.object({
  warehouseId: z.string().optional(),
  branchId: z.string().optional(),
  productId: z.string(),
  type: z.nativeEnum(InventoryMovementType).default(InventoryMovementType.PURCHASE),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().nonnegative().optional(),
  sourceType: z.string().trim().max(80).optional(),
  sourceId: z.string().trim().max(120).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "warehouse" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("type") ? { type: searchParams.get("type") as InventoryMovementType } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: { product: true, warehouse: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "warehouse" });
    const data = CreateMovementSchema.parse(await request.json());

    const result = await createInventoryMovement(context, data);

    return created(result);
  } catch (error) {
    return fail(error);
  }
}
