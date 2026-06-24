"use client";

import KpiCardInteractive from "@/components/dashboard/KpiCardInteractive";
import { useMemo, useState } from "react";
import { ModuleChart } from "@/components/shared/module-chart";
import { AuditFeed } from "@/components/shared/audit-feed";
import InventoryTable from "./InventoryTable";
import ReceiveModal from "./ReceiveModal";
import TransferModal from "./TransferModal";
import AdjustmentModal from "./AdjustmentModal";
import ExportButton from "./ExportButton";
import { WarehouseProvider, useWarehouse } from "./WarehouseContext";

export default function WarehouseClient({
  metrics,
  chart,
  rows,
  moduleTitle,
  moduleSubtitle,
  chartTitle,
  chartDescription,
  locale,
}: {
  metrics: any[];
  chart: { label: string; value: number }[];
  rows: any[];
  moduleTitle: string;
  moduleSubtitle: string;
  chartTitle: string;
  chartDescription: string;
  locale: string;
}) {
  const [itemFilter, setItemFilter] = useState<"all" | "sellable" | "internal">("all");

  function getRowType(r: any) {
    if (typeof r.isSellable === "boolean") return r.isSellable ? "sellable" : "internal";
    if (typeof r.type === "string") return r.type === "sellable" ? "sellable" : r.type === "internal" ? "internal" : "sellable";
    if (r.sku) return "sellable"; // heurístico: presencia de SKU → vendible
    return "internal";
  }

  // prefer context-driven items (mocks) when available
  const { items: ctxItems } = useWarehouse();

  const sourceRows = useMemo(() => {
    // normalize context items to table shape if available, otherwise use server rows
    if (ctxItems && ctxItems.length > 0) {
      return ctxItems.map((i) => ({ id: i.id, sku: i.sku, name: i.name, stock: i.quantityOnHand, location: i.location, type: i.type }));
    }
    return rows ?? [];
  }, [ctxItems, rows]);

  const filteredRows = useMemo(() => {
    if (!sourceRows) return [];
    if (itemFilter === "all") return sourceRows;
    return sourceRows.filter((r: any) => getRowType(r) === itemFilter);
  }, [sourceRows, itemFilter]);

  const totalCount = sourceRows.length;
  const sellableCount = sourceRows.filter((r: any) => getRowType(r) === "sellable").length;
  const internalCount = totalCount - sellableCount;
  return (
    <WarehouseProvider>
      <section className="erp-section space-y-6" role="main" aria-label={moduleTitle}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{moduleTitle}</h1>
          <p className="text-sm text-muted-foreground">{moduleSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="warehouse" className="select select-sm">
            <option value="all">All warehouses</option>
          </select>
          <ExportButton rows={filteredRows} />
          <select
            aria-label="item-type"
            className="select select-sm"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="sellable">Vendible</option>
            <option value="internal">Uso interno</option>
          </select>

          <div className="text-sm text-muted-foreground">Mostrando {filteredRows.length} de {totalCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <KpiCardInteractive key={m.label} label={m.label} value={m.value} change={m.change} tone={m.tone} locale={locale} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
          <div className="space-y-6">
            <ModuleChart title={chartTitle} description={chartDescription} data={chart} locale={locale as any} type="bar" />

            <ModuleChart title={chartTitle} description={chartDescription} data={chart} locale={locale as any} type="bar" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCardInteractive key="total-items" label="Total items" value={totalCount} tone="neutral" locale={locale} />
              <KpiCardInteractive key="sellable-items" label="Vendible" value={sellableCount} tone="neutral" locale={locale} />
              <KpiCardInteractive key="internal-items" label="Uso interno" value={internalCount} tone="neutral" locale={locale} />
            </div>

            <InventoryTable rows={filteredRows} locale={locale as any} />
          </div>

          <aside className="space-y-4">
            <div className="space-y-2">
              <ReceiveModal />
              <TransferModal />
              <AdjustmentModal />
            </div>
            <AuditFeed locale={locale as any} />
          </aside>
        </div>
      </div>
      </section>
    </WarehouseProvider>
  );
}
