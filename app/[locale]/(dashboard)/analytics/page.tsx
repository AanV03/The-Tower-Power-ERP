import { moduleConfigs } from "@/data/modules";
import type { ModuleId } from "@/data/navigation";
import { scopeOptions } from "@/data/navigation";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import type { Locale } from "@/lib/i18n";
import {
  analyticsLabels,
  analyticsRangeOptions,
  analyticsStatusOptions,
} from "./components/config";
import { createAnalyticsSparkline } from "./components/demo-controller";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import {
  analyticsInitialState,
  createAnalyticsDemoData,
  mapModuleRowsToAnalyticsRows,
  normalizeChartData,
} from "./components/mock-data";
import type { AnalyticsRange } from "./components/types";

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string; branchId?: string }>;
}) {
  const { locale } = await params;
  const { range = "30d", branchId = "" } = await searchParams;
  const typedLocale = locale as Locale;
  const activeRange = (["today", "7d", "30d", "90d", "all"].includes(range) ? range : "30d") as AnalyticsRange;

  const moduleId: ModuleId = "analytics";
  const config = moduleConfigs[moduleId];
  const context = await requireApiContext({ moduleId });
  const summary = await getModuleSummary(moduleId, context, { range: activeRange, branchId });

  const metrics = config.metrics.map((fallbackMetric, index) => {
    const apiMetric = summary.metrics[index];
    const value = apiMetric?.value ?? fallbackMetric.value;
    const key = apiMetric?.key ?? fallbackMetric.label.en.toLowerCase();

    return {
      id: `metric-${key}`,
      key,
      label: fallbackMetric.label[typedLocale],
      value,
      change: apiMetric?.change ?? fallbackMetric.change,
      tone: (apiMetric?.tone ?? fallbackMetric.tone) as "default" | "success" | "warning" | "danger",
      sparkline: key !== "branches" ? createAnalyticsSparkline(key, value, activeRange) : undefined,
    };
  });

  const rows = mapModuleRowsToAnalyticsRows(summary.rows);
  const branchOptions = [
    { value: "", label: analyticsLabels.filters.allBranches },
    ...scopeOptions.map((option) => ({
      value: option.id,
      label: option.label[typedLocale],
    })),
  ];

  const insight = {
    title: "Recomendacion de Inteligencia de Negocio (BI)",
    message:
      "La retencion se mantiene arriba del periodo anterior. Prioriza renovaciones tempranas y revisa las sucursales con alertas para reducir churn operativo.",
    tone: "info" as const,
  };

  return (
    <section className="erp-section space-y-6" role="main" aria-label={config.title[typedLocale]}>
      <AnalyticsDashboard
        locale={typedLocale}
        data={createAnalyticsDemoData({
          title: config.title[typedLocale],
          subtitle: config.subtitle[typedLocale],
          activeRange,
          activeBranch: branchId,
          metrics,
          chart: normalizeChartData(summary.chart),
          rows,
          insight,
        })}
        state={analyticsInitialState}
        labels={analyticsLabels}
        rangeOptions={analyticsRangeOptions}
        branchOptions={branchOptions}
        statusOptions={analyticsStatusOptions}
      />
    </section>
  );
}
