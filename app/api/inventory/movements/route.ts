import { InventoryMovementType } from "@prisma/client";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { createInventoryMovement } from "@/lib/api/inventory-movements";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const CreateMovementSchema = z.object({
  warehouseId: z.string().optional(),
  branchId: z.string().optional(),
  productId: z.string().min(1),
  type: z.enum(InventoryMovementType).default(InventoryMovementType.PURCHASE),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().nonnegative().optional(),
  sourceType: z.string().trim().max(80).optional(),
  sourceId: z.string().trim().max(120).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "inventory",
      permission: "inventory.read",
    });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("type") ? { type: searchParams.get("type") as InventoryMovementType } : {}),
      ...(context.branchId
        ? { warehouse: { branchId: context.branchId } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: { product: true, warehouse: { include: { branch: true } } },
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
    const context = await requireApiContext({
      moduleId: "inventory",
      permission: "inventory.write",
    });
    const data = CreateMovementSchema.parse(await request.json());
    const result = await createInventoryMovement(context, data);

    return created(result);
  } catch (error) {
    return fail(error);
  }
}
