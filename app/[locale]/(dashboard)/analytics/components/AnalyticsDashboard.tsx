"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";
import { AnalyticsHeaderControls } from "./AnalyticsHeaderControls";
import { AnalyticsMetricCard } from "./AnalyticsMetricCard";
import { AnalyticsTabs } from "./AnalyticsTabs";
import { ExportReportModal } from "./ExportReportModal";
import { createExportPayload, filterAnalyticsRows } from "./demo-controller";
import type {
  AnalyticsDashboardProps,
  AnalyticsFilters,
  ExportReportDraft,
} from "./types";

export function AnalyticsDashboard({
  locale,
  data,
  state,
  labels,
  rangeOptions,
  branchOptions,
  statusOptions,
  actions,
}: AnalyticsDashboardProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    query: "",
    branch: "",
    status: "all",
  });

  const visibleRows = useMemo(() => filterAnalyticsRows(data.rows, filters), [data.rows, filters]);

  const handleExport = (draft: ExportReportDraft) => {
    const payload = createExportPayload(draft, {
      range: data.activeRange,
      branch: data.activeBranch,
    });

    actions?.onExport?.(draft);
    setIsExportOpen(false);
    toast.success(labels.export.success, {
      description: `${payload.format.toUpperCase()} / ${payload.branch}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Lightbulb className="size-7 text-primary" aria-hidden="true" />
            {data.title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{data.subtitle}</p>
        </div>
        <AnalyticsHeaderControls
          locale={locale}
          range={data.activeRange}
          branch={data.activeBranch}
          labels={labels}
          rangeOptions={rangeOptions}
          branchOptions={branchOptions}
          onExportOpen={() => setIsExportOpen(true)}
          onRefresh={() => {
            actions?.onRefresh?.();
            toast.success("Datos demo actualizados.");
          }}
        />
      </div>

      <section className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-xs">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">{data.insight.title}</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.insight.message}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.metrics.map((metric) => (
          <AnalyticsMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <AnalyticsTabs
        locale={locale}
        data={{
          chart: data.chart,
          branchComparison: data.branchComparison,
          rows: visibleRows,
          snapshots: data.snapshots,
        }}
        state={state}
        labels={labels}
        filters={filters}
        onFiltersChange={setFilters}
        statusOptions={statusOptions}
      />

      <ExportReportModal
        labels={labels}
        isOpen={isExportOpen}
        status={state.export}
        onClose={() => setIsExportOpen(false)}
        onSubmit={handleExport}
      />
    </div>
  );
}
