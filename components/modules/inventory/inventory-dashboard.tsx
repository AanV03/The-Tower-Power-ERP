import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { getDictionary, type Locale } from "@/lib/i18n";
import { InventoryClient } from "./inventory-client";

export async function InventoryDashboard({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const context = await requireApiContext({ moduleId: "inventory" });
  const branchId = context.branchId;
  const tenantId = context.tenantId;

  const warehouseWhere = branchId ? { tenantId, branchId } : { tenantId };
  const itemWhere = branchId ? { tenantId, warehouse: { branchId } } : { tenantId };
  const movementWhere = branchId ? { tenantId, warehouse: { branchId } } : { tenantId };
  const productWhere = { tenantId, status: "ACTIVE" as const };
  const branchWhere = { tenantId, status: "ACTIVE" as const };

  const [warehouses, inventoryItems, inventoryMovements, products] = await Promise.all([
    prisma.warehouse.findMany({
      where: warehouseWhere,
      include: { branch: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryItem.findMany({
      where: itemWhere,
      include: { product: true, warehouse: { include: { branch: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inventoryMovement.findMany({
      where: movementWhere,
      include: { product: true, warehouse: { include: { branch: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      where: productWhere,
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedItems = inventoryItems.map((item) => ({
    id: item.id,
    warehouseId: item.warehouseId,
    warehouseName: item.warehouse.name,
    branchName: item.warehouse.branch.name,
    productId: item.productId,
    productName: item.product.name,
    productSku: item.product.sku,
    quantityOnHand: Number(item.quantityOnHand.toString()),
    reorderPoint: Number(item.reorderPoint.toString()),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const serializedMovements = inventoryMovements.map((m) => ({
    id: m.id,
    warehouseName: m.warehouse.name,
    productName: m.product.name,
    productSku: m.product.sku,
    type: m.type,
    quantity: Number(m.quantity.toString()),
    unitCost: m.unitCost ? Number(m.unitCost.toString()) : null,
    sourceType: m.sourceType ?? dictionary.inventory.manualAdjustment,
    sourceId: m.sourceId ?? "-",
    createdAt: m.createdAt.toISOString(),
  }));

  const serializedWarehouses = warehouses.map((w) => ({
    id: w.id,
    name: w.name,
    branchName: w.branch.name,
    branchId: w.branchId,
    createdAt: w.createdAt.toISOString(),
  }));

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
  }));

  const totalStock = serializedItems.reduce((acc, item) => acc + item.quantityOnHand, 0);
  const warehousesCount = serializedWarehouses.length;
  const criticalAlerts = serializedItems.filter((item) => item.quantityOnHand <= item.reorderPoint).length;

  return (
    <InventoryClient
      locale={locale}
      initialItems={serializedItems}
      initialMovements={serializedMovements}
      initialWarehouses={serializedWarehouses}
      products={serializedProducts}
      metrics={{
        totalStock,
        warehousesCount,
        criticalAlerts,
      }}
    />
  );
}
