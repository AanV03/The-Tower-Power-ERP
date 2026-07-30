import { InventoryMovementType, Prisma } from "@prisma/client";

import { resolveWritableBranchId } from "@/lib/api/branch";
import { ApiError } from "@/lib/api/response";
import type { TenantContext } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

type InventoryMovementInput = {
  warehouseId?: string;
  branchId?: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  unitCost?: number;
  sourceType?: string;
  sourceId?: string;
};

const OUTBOUND_TYPES = new Set<InventoryMovementType>([
  InventoryMovementType.SALE,
  InventoryMovementType.TRANSFER_OUT,
  InventoryMovementType.SHRINKAGE,
]);

function signedQuantity(type: InventoryMovementType, quantity: number) {
  const decimal = new Prisma.Decimal(quantity);
  return OUTBOUND_TYPES.has(type) ? decimal.negated() : decimal;
}

async function resolveWarehouse(
  tx: Prisma.TransactionClient,
  context: TenantContext,
  input: Pick<InventoryMovementInput, "warehouseId" | "branchId">,
) {
  if (input.warehouseId) {
    const warehouse = await tx.warehouse.findFirst({
      where: {
        id: input.warehouseId,
        tenantId: context.tenantId,
        ...(context.branchId ? { branchId: context.branchId } : {}),
      },
    });

    if (!warehouse) {
      throw new ApiError("Warehouse was not found for this tenant.", 404, "WAREHOUSE_NOT_FOUND");
    }

    return warehouse;
  }

  const branchId = await resolveWritableBranchId(context, input.branchId);

  return tx.warehouse.upsert({
    where: {
      tenantId_branchId_name: {
        tenantId: context.tenantId,
        branchId,
        name: "Principal",
      },
    },
    create: {
      tenantId: context.tenantId,
      branchId,
      name: "Principal",
    },
    update: {},
  });
}

export async function createInventoryMovement(
  context: TenantContext,
  input: InventoryMovementInput,
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.productId,
        tenantId: context.tenantId,
      },
    });

    if (!product) {
      throw new ApiError("Product was not found for this tenant.", 404, "PRODUCT_NOT_FOUND");
    }

    const warehouse = await resolveWarehouse(tx, context, input);
    const quantityDelta = signedQuantity(input.type, input.quantity);
    let item;
    if (quantityDelta.isNegative()) {
      const outboundQuantity = quantityDelta.abs();
      const updated = await tx.inventoryItem.updateMany({
        where: {
          tenantId: context.tenantId,
          warehouseId: warehouse.id,
          productId: product.id,
          quantityOnHand: { gte: outboundQuantity },
        },
        data: {
          quantityOnHand: { decrement: outboundQuantity },
        },
      });

      if (updated.count !== 1) {
        throw new ApiError(
          "Inventory movement would make stock negative.",
          409,
          "INSUFFICIENT_STOCK",
        );
      }

      item = await tx.inventoryItem.findUniqueOrThrow({
        where: {
          tenantId_warehouseId_productId: {
            tenantId: context.tenantId,
            warehouseId: warehouse.id,
            productId: product.id,
          },
        },
        include: { product: true, warehouse: { include: { branch: true } } },
      });
    } else {
      item = await tx.inventoryItem.upsert({
        where: {
          tenantId_warehouseId_productId: {
            tenantId: context.tenantId,
            warehouseId: warehouse.id,
            productId: product.id,
          },
        },
        create: {
          tenantId: context.tenantId,
          warehouseId: warehouse.id,
          productId: product.id,
          quantityOnHand: quantityDelta,
          quantityReserved: new Prisma.Decimal(0),
          reorderPoint: new Prisma.Decimal(0),
        },
        update: { quantityOnHand: { increment: quantityDelta } },
        include: { product: true, warehouse: { include: { branch: true } } },
      });
    }

    const movement = await tx.inventoryMovement.create({
        data: {
          tenantId: context.tenantId,
          warehouseId: warehouse.id,
          productId: product.id,
          type: input.type,
          quantity: new Prisma.Decimal(input.quantity),
          unitCost: input.unitCost === undefined ? undefined : new Prisma.Decimal(input.unitCost),
          sourceType: input.sourceType ?? "DEMO",
          sourceId: input.sourceId,
        },
        include: { product: true, warehouse: { include: { branch: true } } },
      });

    return { item, movement };
  });
}
