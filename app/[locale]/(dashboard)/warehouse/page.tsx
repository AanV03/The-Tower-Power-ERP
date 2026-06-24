import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { moduleConfigs } from "@/data/modules";
// Structural Warehouse dashboard (no state/logic - layout only)
import { Fragment } from "react";

function mergeMetrics(moduleId: string, locale: Locale, summary: Awaited<ReturnType<typeof getModuleSummary>>) {
  const config = moduleConfigs[moduleId as keyof typeof moduleConfigs];

  return config.metrics.map((fallbackMetric: any, index: number) => {
    const apiMetric = summary.metrics[index];

    return {
      label: fallbackMetric.label[locale],
      value: apiMetric?.value ?? fallbackMetric.value,
      change: apiMetric?.change ?? fallbackMetric.change,
      tone: apiMetric?.tone ?? fallbackMetric.tone,
      raw: apiMetric,
    };
  });
}

export default async function WarehousePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  const context = await requireApiContext({ moduleId: "warehouse" });
  const summary = await getModuleSummary("warehouse", context);
  const metrics = mergeMetrics("warehouse", locale as Locale, summary);

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 bg-background">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <nav className="text-sm text-muted">Almacén</nav>
          <h1 className="text-lg font-medium">{moduleConfigs.warehouse.title[locale as Locale]}</h1>
          <div className="ml-4 inline-flex items-center gap-2 text-sm">
            <button className="px-3 py-1 rounded-md glass-control">Todos</button>
            <button className="px-3 py-1 rounded-md AssetBadge">Maquinaria</button>
            <button className="px-3 py-1 rounded-md ConsumableBadge">Consumo</button>
            <button className="px-2 py-1 rounded-md glass-control">Split View</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="sucursal-select" className="text-sm text-muted">Sucursal</label>
            <select id="sucursal-select" className="glass-control px-2 py-1 rounded-md">
              <option>Principal</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Buscar SKU / Nombre" className="glass-control px-3 py-1 rounded-md" />
            <button className="glass-control px-3 py-1 rounded-md">Filtros</button>
            <button className="glass-control px-3 py-1 rounded-md">Exportar</button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Table area */}
        <section className="col-span-2 bg-card rounded-lg shadow p-4 flex flex-col">
          <div className="sticky top-4 z-10 bg-card/80 backdrop-blur py-2 px-2 rounded-md flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button className="glass-control px-3 py-1 rounded-md">Crear movimiento</button>
              <button className="glass-control px-3 py-1 rounded-md">Ajuste</button>
              <button className="glass-control px-3 py-1 rounded-md">Traspaso</button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted">Densidad</span>
              <div className="inline-flex gap-1">
                <button className="glass-control px-2 py-1 rounded-md">Compact</button>
                <button className="glass-control px-2 py-1 rounded-md">Detalle</button>
              </div>
            </div>
          </div>

          <div className="mt-3 overflow-auto flex-1 min-h-[48vh]">
            {/* InventoryDataTable placeholder */}
            <table className="table-fixed w-full divide-y divide-border">
              <thead className="text-sm text-muted">
                <tr className="text-left">
                  <th className="w-[220px] px-3 py-2">Item</th>
                  <th className="w-[120px] px-3 py-2">Tipo</th>
                  <th className="w-[140px] px-3 py-2">Sucursal</th>
                  <th className="w-[100px] px-3 py-2">Ubicación</th>
                  <th className="w-[100px] px-3 py-2">Cantidad</th>
                  <th className="w-[100px] px-3 py-2">Umbral</th>
                  <th className="w-[120px] px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Example rows (structural only) */}
                <tr className="group flex items-center px-3 py-2 border-b border-border/50 hover:bg-accent/3">
                  <td className="px-3 py-2">Cinta de correr - SN: 001</td>
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-navy text-white">Maquinaria</span></td>
                  <td className="px-3 py-2">Principal</td>
                  <td className="px-3 py-2">Bodega A</td>
                  <td className="px-3 py-2">1</td>
                  <td className="px-3 py-2">0</td>
                  <td className="px-3 py-2">$2,500</td>
                  <td className="px-3 py-2">...</td>
                </tr>
                <tr className="group flex items-center px-3 py-2 border-b border-border/50 hover:bg-accent/3">
                  <td className="px-3 py-2">Toalla pequeña - SKU: TOW-01</td>
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-orange text-black">Consumo</span></td>
                  <td className="px-3 py-2">Principal</td>
                  <td className="px-3 py-2">Estantería 3</td>
                  <td className="px-3 py-2">120</td>
                  <td className="px-3 py-2">30</td>
                  <td className="px-3 py-2">$360</td>
                  <td className="px-3 py-2">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: KPIs and actions */}
        <aside className="col-span-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KPI Cards (structural) */}
            {metrics.slice(0, 4).map((m: any, i: number) => (
              <div key={i} className="p-4 rounded-lg glass-panel-strong">
                <div className="text-xs text-muted">{m.label}</div>
                <div className="mt-2 text-xl font-semibold">{m.value}</div>
                <div className="text-sm text-muted">Cambio: {m.change ?? "-"}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="glass-panel p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Alertas</div>
                <button className="glass-control px-2 py-1 rounded-md">Ver todas</button>
              </div>
              <div className="mt-2">
                <div className="p-2 rounded-md bg-destructive/10">Toalla pequeña <span className="text-sm text-destructive">Bajo stock</span></div>
                <div className="p-2 rounded-md bg-accent/5 mt-2">Cinta de correr <span className="text-sm text-muted">Mantenimiento programado</span></div>
              </div>
            </div>

            <div className="glass-panel p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Resumen</div>
                <button className="glass-control px-2 py-1 rounded-md">Exportar PDF</button>
              </div>
              <div className="mt-3">
                {/* InventoryChart placeholder */}
                <div className="h-40 rounded-md bg-[linear-gradient(90deg,#f4f4f4,#fff)] flex items-center justify-center text-sm text-muted">Inventory Chart</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
