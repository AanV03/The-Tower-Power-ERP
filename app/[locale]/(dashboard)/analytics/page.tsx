import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { getDictionary, type Locale } from "@/lib/i18n";
import { moduleConfigs } from "@/data/modules";
import type { ModuleId } from "@/data/navigation";
import { Lightbulb } from "lucide-react";

// Local component imports
import { AnalyticsHeaderControls } from "./components/AnalyticsHeaderControls";
import { AnalyticsMetricCard } from "./components/AnalyticsMetricCard";
import { AnalyticsTabs } from "./components/AnalyticsTabs";

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string; branchId?: string }>;
}) {
  const { locale } = await params;
  const { range = "30d", branchId = "" } = await searchParams;

  const moduleId: ModuleId = "analytics";
  const config = moduleConfigs[moduleId];
  const dictionary = getDictionary(locale as Locale);
  
  // Obtain tenant context and load data with filters
  const context = await requireApiContext({ moduleId });
  const summary = await getModuleSummary(moduleId, context, { range, branchId });

  // Generate deterministic sparkline trends matching the date range filter
  const getSparklineData = (key: string, currentValue: string) => {
    const val = parseFloat(currentValue.replace(/[^0-9.]/g, "")) || 50;
    const steps = range === "today" ? 6 : range === "7d" ? 7 : range === "90d" ? 5 : 4;
    return Array.from({ length: steps }).map((_, index) => {
      const diff = (steps - 1 - index) * (key === "churn" ? 1.2 : -0.8);
      return { value: Math.max(0, Math.round(val + diff)) };
    });
  };

  // Map backend metrics with their respective localized titles and custom properties
  const metrics = config.metrics.map((fallbackMetric, index) => {
    const apiMetric = summary.metrics[index];
    const rawVal = apiMetric?.value ?? fallbackMetric.value;
    const tone = apiMetric?.tone ?? fallbackMetric.tone;
    const key = apiMetric?.key ?? fallbackMetric.label.en.toLowerCase();
    
    return {
      key,
      label: fallbackMetric.label[locale as Locale],
      value: rawVal,
      change: apiMetric?.change ?? fallbackMetric.change,
      tone: tone as "default" | "success" | "warning" | "danger",
      sparkline: key !== "branches" ? getSparklineData(key, rawVal) : undefined,
    };
  });

  const biMessage = locale === "es"
    ? "La tasa de retención se mantiene un 3% arriba en comparación con el mes anterior. Se recomienda incentivar renovaciones tempranas y lanzar campañas de reactivación enfocadas en la sucursal Centro."
    : locale === "fr"
    ? "Le taux de rétention reste supérieur de 3% à celui du mois dernier. Il est recommandé d'encourager les renouvellements anticipés et de lancer des campagnes de réactivation ciblées sur la succursale Centre."
    : "The retention rate remains 3% higher than last month. It is recommended to incentivize early membership renewals and launch targeted reactivation campaigns for the Downtown Branch.";

  const biTitle = locale === "es"
    ? "Recomendación de Inteligencia de Negocio (BI)"
    : locale === "fr"
    ? "Recommandation de Business Intelligence"
    : "BI Recommendation";

  return (
    <section className="erp-section space-y-6" role="main" aria-label={config.title[locale as Locale]}>
      {/* Header with inline controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Lightbulb className="size-7 text-primary" aria-hidden="true" />
            {config.title[locale as Locale]}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {config.subtitle[locale as Locale]}
          </p>
        </div>
        <div className="shrink-0">
          <AnalyticsHeaderControls 
            locale={locale as Locale}
            range={range}
            branch={branchId}
          />
        </div>
      </div>

      {/* BI Recommendation Banner */}
      <div className="rounded-xl border border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/5 p-4 flex items-start gap-3 shadow-xs">
        <Lightbulb className="w-5 h-5 text-[var(--brand-orange)] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">{biTitle}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{biMessage}</p>
        </div>
      </div>

      {/* KPI Metric Cards — always visible above tabs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {metrics.map((metric) => (
          <AnalyticsMetricCard
            key={metric.key}
            metricKey={metric.key}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
            locale={locale as Locale}
            sparklineData={metric.sparkline}
            isDoubleWidth={false}
          />
        ))}
      </div>

      {/* Tabbed sections: Resumen / Sucursales / Reportes */}
      <AnalyticsTabs
        locale={locale as Locale}
        chartTitle={dictionary.analytics.charts.mainTitle}
        chartDesc={dictionary.analytics.charts.mainDesc}
        chartData={summary.chart as any}
        tableRows={summary.rows}
      />
    </section>
  );
}
