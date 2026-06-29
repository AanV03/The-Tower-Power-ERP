import { AddStockModal } from "@/components/inventory/add-stock-modal";
import { moduleConfigs } from "@/data/modules";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { formatCurrency } from "@/lib/api/pagination";
import { type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db/prisma";

function mergeMetrics(moduleId: string, locale: Locale, summary: Awaited<ReturnType<typeof getModuleSummary>>) {
  const config = moduleConfigs[moduleId as keyof typeof moduleConfigs];

  return config.metrics.map((fallbackMetric: any, index: number) => {
    const apiMetric = summary.metrics[index];

    return {
      label: fallbackMetric.label[locale],
      value: apiMetric?.value ?? fallbackMetric.value,
      change: apiMetric?.change ?? fallbackMetric.change,
      tone: apiMetric?.tone ?? fallbackMetric.tone,
    };
  });
}

export default async function WarehousePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const context = await requireApiContext({ moduleId: "warehouse" });
  const summary = await getModuleSummary("warehouse", context);
  const metrics = mergeMetrics("warehouse", typedLocale, summary);
  const branchWhere = context.branchId ? { branchId: context.branchId } : {};

  const [products, warehouses, items] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId: context.tenantId, status: "ACTIVE" },
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.warehouse.findMany({
      where: { tenantId: context.tenantId, ...branchWhere },
      include: { branch: true, inventoryItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.inventoryItem.findMany({
      where: { tenantId: context.tenantId, warehouse: branchWhere },
      include: { product: true, warehouse: { include: { branch: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <section className="min-h-[calc(100vh-64px)] space-y-6 bg-background p-6 text-foreground">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <nav className="text-sm text-muted-foreground">Almacenes</nav>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-foreground">
            {moduleConfigs.warehouse.title[typedLocale]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Existencias por almacen, sucursal y producto.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddStockModal products={products.map((product) => ({ id: product.id, name: product.name, sku: product.sku }))} />
          <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Exportar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.slice(0, 4).map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-4 text-foreground">
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">Cambio: {metric.change ?? "-"}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <section className="overflow-hidden rounded-xl border border-border bg-card text-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Inventario por almacen</h2>
            <input
              type="text"
              placeholder="Buscar SKU / Nombre"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[820px] text-sm text-foreground">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Sucursal</th>
                  <th className="px-5 py-3">Almacen</th>
                  <th className="px-5 py-3 text-right">Cantidad</th>
                  <th className="px-5 py-3 text-right">Umbral</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                      Sin inventario registrado. Usa Crear movimiento para agregar stock.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-5 py-4 font-medium text-foreground">{item.product.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.product.sku}</td>
                      <td className="px-5 py-4 text-foreground">{item.warehouse.branch.name}</td>
                      <td className="px-5 py-4 text-foreground">{item.warehouse.name}</td>
                      <td className="px-5 py-4 text-right font-semibold text-foreground">{item.quantityOnHand.toString()}</td>
                      <td className="px-5 py-4 text-right text-muted-foreground">{item.reorderPoint.toString()}</td>
                      <td className="px-5 py-4 text-right text-foreground">
                        {formatCurrency(Number(item.quantityOnHand) * Number(item.product.cost))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 text-foreground">
            <h2 className="font-semibold text-foreground">Almacenes</h2>
            <div className="mt-4 divide-y divide-border">
              {warehouses.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Se creara un almacen Principal automaticamente al primer movimiento.</p>
              ) : (
                warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="py-3">
                    <p className="font-medium text-foreground">{warehouse.name}</p>
                    <p className="text-sm text-muted-foreground">{warehouse.branch.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{warehouse.inventoryItems.length} productos con stock</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-foreground">
            <h2 className="font-semibold text-foreground">Alertas</h2>
            <div className="mt-3 space-y-2">
              {items.filter((item) => Number(item.quantityOnHand) <= Number(item.reorderPoint)).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin alertas de bajo stock.</p>
              ) : (
                items
                  .filter((item) => Number(item.quantityOnHand) <= Number(item.reorderPoint))
                  .map((item) => (
                    <div key={item.id} className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {item.product.name} bajo stock
                    </div>
                  ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
