import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import type { Locale } from "@/lib/i18n";
import { WarehouseClient } from "@/components/modules/warehouse/warehouse-client";

export const runtime = "nodejs";

export default async function WarehousePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "warehouse" });
  const branchId = context.branchId;
  const tenantId = context.tenantId;

  const warehouseWhere = branchId ? { tenantId, branchId } : { tenantId };
  const branchWhere = { tenantId, status: "ACTIVE" as const };

  const [dbWarehouses, dbBranches] = await Promise.all([
    prisma.warehouse.findMany({
      where: warehouseWhere,
      include: {
        branch: true,
        inventoryItems: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.branch.findMany({
      where: branchWhere,
      orderBy: { name: "asc" },
    }),
  ]);

  const warehouses = dbWarehouses.map((w) => {
    const uniqueProductsCount = w.inventoryItems.length;
    const totalStockCount = w.inventoryItems.reduce(
      (acc, item) => acc + Number(item.quantityOnHand.toString()),
      0
    );
    return {
      id: w.id,
      name: w.name,
      branchId: w.branchId,
      branchName: w.branch.name,
      uniqueProductsCount,
      totalStockCount,
      createdAt: w.createdAt.toISOString(),
    };
  });

  const branches = dbBranches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <WarehouseClient
      initialWarehouses={warehouses}
      branches={branches}
      locale={locale as Locale}
    />
  );
}
