import { AddStockModal } from "@/components/inventory/add-stock-modal";
import { requireApiContext } from "@/lib/api/context";
import { formatCurrency } from "@/lib/api/pagination";
import { prisma } from "@/lib/db/prisma";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const context = await requireApiContext({ moduleId: "inventory" });
  const branchWhere = context.branchId ? { branchId: context.branchId } : {};

  const [products, items, movements] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId: context.tenantId, status: "ACTIVE" },
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.inventoryItem.findMany({
      where: {
        tenantId: context.tenantId,
        warehouse: branchWhere,
      },
      include: { product: true, warehouse: { include: { branch: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.inventoryMovement.findMany({
      where: {
        tenantId: context.tenantId,
        warehouse: branchWhere,
      },
      include: { product: true, warehouse: { include: { branch: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalUnits = items.reduce((sum, item) => sum + Number(item.quantityOnHand), 0);
  const stockValue = items.reduce(
    (sum, item) => sum + Number(item.quantityOnHand) * Number(item.product.cost),
    0,
  );
  const lowStock = items.filter((item) => Number(item.quantityOnHand) <= Number(item.reorderPoint)).length;

  return (
    <section className="erp-section space-y-6 text-foreground" role="main" aria-label="Inventario">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entradas de stock conectadas a productos y almacenes reales.</p>
        </div>
        <AddStockModal products={products.map((product) => ({ id: product.id, name: product.name, sku: product.sku }))} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unidades disponibles</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{totalUnits}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Valor estimado</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(stockValue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Alertas bajo stock</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{lowStock}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Stock actual</h2>
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Almacen</th>
                  <th className="px-5 py-3 text-right">Stock</th>
                  <th className="px-5 py-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      Sin stock registrado. Usa Agregar stock para crear el primer movimiento.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-5 py-4 font-medium text-foreground">{item.product.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.product.sku}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.warehouse.name} / {item.warehouse.branch.name}</td>
                      <td className="px-5 py-4 text-right font-semibold text-foreground">{item.quantityOnHand.toString()}</td>
                      <td className="px-5 py-4 text-right text-muted-foreground">{formatCurrency(item.product.cost.toString())}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Movimientos recientes</h2>
          </div>
          <div className="divide-y divide-border">
            {movements.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">Sin movimientos aun.</div>
            ) : (
              movements.map((movement) => (
                <div key={movement.id} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{movement.product.name}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{movement.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {movement.quantity.toString()} unidades en {movement.warehouse.name}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
