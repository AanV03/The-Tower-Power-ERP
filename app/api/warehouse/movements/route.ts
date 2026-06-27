import { InventoryMovementType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateMovementSchema = z.object({
  warehouseId: z.string(),
  productId: z.string(),
  type: z.nativeEnum(InventoryMovementType),
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

    const movement = await prisma.$transaction(async (tx) => {
      const qtyDecimal = new Prisma.Decimal(data.quantity);

      const m = await tx.inventoryMovement.create({
        data: {
          tenantId: context.tenantId,
          warehouseId: data.warehouseId,
          productId: data.productId,
          type: data.type,
          quantity: qtyDecimal,
          unitCost: data.unitCost === undefined ? undefined : new Prisma.Decimal(data.unitCost),
          sourceType: data.sourceType,
          sourceId: data.sourceId,
        },
      });

      const isIncrement = ["PURCHASE", "TRANSFER_IN", "ADJUSTMENT"].includes(data.type);

      await tx.inventoryItem.upsert({
        where: {
          tenantId_warehouseId_productId: {
            tenantId: context.tenantId,
            warehouseId: data.warehouseId,
            productId: data.productId,
          },
        },
        update: {
          quantityOnHand: isIncrement ? { increment: qtyDecimal } : { decrement: qtyDecimal },
        },
        create: {
          tenantId: context.tenantId,
          warehouseId: data.warehouseId,
          productId: data.productId,
          quantityOnHand: isIncrement ? qtyDecimal : new Prisma.Decimal(0),
          quantityReserved: new Prisma.Decimal(0),
          reorderPoint: new Prisma.Decimal(0),
        },
      });

      return m;
    });

    return created(movement);
  } catch (error) {
    return fail(error);
  }
}
