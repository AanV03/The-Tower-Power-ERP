"use client";

import AlertCenter from "./AlertCenter";
import FiltersBar from "./FiltersBar";
import KpiCardInteractive from "./KpiCardInteractive";
import { ModuleChart } from "@/components/shared/module-chart";
import { AuditFeed } from "@/components/shared/audit-feed";
import { ModuleTable } from "@/components/shared/module-table";

export default function DashboardClient({
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
  return (
    <section className="erp-section space-y-6" role="main" aria-label={moduleTitle}>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">{moduleTitle}</h1>
          <div className="flex items-center gap-2">
            <FiltersBar />
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">{moduleSubtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Metrics row: show 4 large KPI cards in a single row on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="col-span-1">
              <KpiCardInteractive label={m.label} value={m.value} change={m.change} tone={m.tone} locale={locale} />
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
          <div className="space-y-6">
            <ModuleChart title={chartTitle} description={chartDescription} data={chart} locale={locale as any} type="area" />

            <ModuleTable rows={rows} locale={locale as any} />
          </div>

          <aside className="space-y-4">
            <AlertCenter />
            <AuditFeed locale={locale as any} />
          </aside>
        </div>
      </div>
    </section>
  );
}
