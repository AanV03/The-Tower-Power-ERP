import type { Locale } from "@/lib/i18n";
import { moduleConfigs } from "@/data/modules";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import {
  campaignStatusConfig,
  channelOptions,
  churnRiskConfig,
  marketingLabels,
  statusOptions,
} from "./components/config";
import { createMarketingDemoData, marketingInitialState } from "./components/mock-data";
import { MarketingDashboard } from "./components/marketing-dashboard";

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  const config = moduleConfigs["marketing"];
  const context = await requireApiContext({ moduleId: "marketing" });
  const summary = await getModuleSummary("marketing", context);

  // Merge backend metrics with hardcoded config
  const metrics = config.metrics.map((fallbackMetric, index) => {
    const apiMetric = summary.metrics[index];
    return {
      label: fallbackMetric.label[typedLocale],
      value: apiMetric?.value ?? fallbackMetric.value,
      change: apiMetric?.change ?? fallbackMetric.change,
      tone: (apiMetric?.tone ?? fallbackMetric.tone) as "default" | "success" | "warning" | "danger",
    };
  });

  return (
    <section className="erp-section space-y-6" role="main" aria-label={config.title[typedLocale]}>
      <MarketingDashboard
        locale={typedLocale}
        data={createMarketingDemoData({
          title: config.title[typedLocale],
          subtitle: config.subtitle[typedLocale],
          primaryActionLabel: config.primaryAction[typedLocale],
          metrics: metrics.map((metric, index) => ({
            id: `metric-${index}`,
            ...metric,
          })),
        })}
        state={marketingInitialState}
        labels={marketingLabels}
        channelOptions={channelOptions}
        statusOptions={statusOptions}
        campaignStatusConfig={campaignStatusConfig}
        churnRiskConfig={churnRiskConfig}
      />
    </section>
  );
}
