import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { moduleConfigs } from "@/data/modules";
import WarehouseClient from "@/components/warehouse/WarehouseClient";

function mergeMetrics(moduleId: string, locale: Locale, summary: Awaited<ReturnType<typeof getModuleSummary>>) {
  const config = moduleConfigs[moduleId as any];

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
    <WarehouseClient
      metrics={metrics}
      chart={summary.chart}
      rows={summary.rows}
      moduleTitle={moduleConfigs.warehouse.title[locale as Locale]}
      moduleSubtitle={moduleConfigs.warehouse.subtitle[locale as Locale]}
      chartTitle={dict.moduleChart.title}
      chartDescription={dict.moduleChart.description}
      locale={locale as Locale}
    />
  );
}
