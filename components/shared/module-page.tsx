import type { ReactNode } from "react";
import { AuditFeed } from "@/components/shared/audit-feed";
import { MetricCard } from "@/components/shared/metric-card";
import { ModuleChart } from "@/components/shared/module-chart";
import { ModuleTable } from "@/components/shared/module-table";
import { QuickActions } from "@/components/shared/quick-actions";
import { moduleConfigs } from "@/data/modules";
import type { ModuleId } from "@/data/navigation";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { getDictionary, type Locale } from "@/lib/i18n";

function mergeMetrics(moduleId: ModuleId, locale: Locale, summary: Awaited<ReturnType<typeof getModuleSummary>>) {
  const config = moduleConfigs[moduleId];

  return config.metrics.map((fallbackMetric, index) => {
    const apiMetric = summary.metrics[index];

    return {
      label: fallbackMetric.label[locale],
      value: apiMetric?.value ?? fallbackMetric.value,
      change: apiMetric?.change ?? fallbackMetric.change,
      tone: apiMetric?.tone ?? fallbackMetric.tone,
    };
  });
}

export async function ModulePage({
  moduleId,
  locale,
  chartType = "area",
  children,
}: {
  moduleId: ModuleId;
  locale: Locale;
  chartType?: "area" | "bar";
  children?: ReactNode;
}) {
  const config = moduleConfigs[moduleId];
  const dictionary = getDictionary(locale);
  const context = await requireApiContext({ moduleId });
  const summary = await getModuleSummary(moduleId, context);
  const metrics = mergeMetrics(moduleId, locale, summary);

  return (
    <section className="erp-section space-y-6" role="main" aria-label={config.title[locale]}>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            {config.title[locale]}
          </h1>
          <QuickActions primaryLabel={config.primaryAction[locale]} locale={locale} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {config.subtitle[locale]}
        </p>
      </div>

      <div className="erp-page-grid" aria-label={dictionary.common.metricsAriaLabel}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
            locale={locale}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ModuleChart
          title={dictionary.moduleChart.title}
          description={dictionary.moduleChart.description}
          data={summary.chart}
          locale={locale}
          type={chartType}
        />
        <AuditFeed locale={locale} />
      </div>

      <ModuleTable rows={summary.rows} locale={locale} />

      {children}
    </section>
  );
}
