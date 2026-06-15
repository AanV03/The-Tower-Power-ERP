import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateInventoryItemSchema = z.object({
  warehouseId: z.string(),
  productId: z.string(),
  quantityOnHand: z.coerce.number().nonnegative().default(0),
  quantityReserved: z.coerce.number().nonnegative().default(0),
  reorderPoint: z.coerce.number().nonnegative().default(0),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "warehouse" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("warehouseId") ? { warehouseId: searchParams.get("warehouseId") ?? undefined } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: { product: true, warehouse: { include: { branch: true } } },
        orderBy: { updatedAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "warehouse" });
    const data = CreateInventoryItemSchema.parse(await request.json());

    const item = await prisma.inventoryItem.create({
      data: {
        tenantId: context.tenantId,
        warehouseId: data.warehouseId,
        productId: data.productId,
        quantityOnHand: new Prisma.Decimal(data.quantityOnHand),
        quantityReserved: new Prisma.Decimal(data.quantityReserved),
        reorderPoint: new Prisma.Decimal(data.reorderPoint),
      },
    });

    return created(item);
  } catch (error) {
    return fail(error);
  }
}
