import { AuditFeed } from "@/components/shared/audit-feed";
import { MetricCard } from "@/components/shared/metric-card";
import { ModuleChart } from "@/components/shared/module-chart";
import { ModuleTable } from "@/components/shared/module-table";
import { QuickActions } from "@/components/shared/quick-actions";
import { moduleConfigs } from "@/data/modules";
import type { Locale } from "@/lib/i18n";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const config = moduleConfigs["finance"];

  const chartLabels: Record<Locale, { title: string; description: string }> = {
    es: {
      title: "Flujo de efectivo semanal",
      description: "Proyección de ingresos y egresos por semana.",
    },
    en: {
      title: "Weekly cash flow",
      description: "Weekly revenue and expense projection.",
    },
    fr: {
      title: "Flux de trésorerie hebdomadaire",
      description: "Projection hebdomadaire des revenus et dépenses.",
    },
  };

  return (
    <section
      className="erp-section space-y-6"
      role="main"
      aria-label={config.title[l]}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            {config.title[l]}
          </h1>
          <QuickActions primaryLabel={config.primaryAction[l]} locale={l} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {config.subtitle[l]}
        </p>
      </div>

      <div className="erp-page-grid" aria-label="Métricas clave">
        {config.metrics.map((metric) => (
          <MetricCard
            key={metric.label[l]}
            label={metric.label[l]}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ModuleChart
          title={chartLabels[l].title}
          description={chartLabels[l].description}
          data={config.chart}
          type="area"
        />
        <AuditFeed locale={l} />
      </div>

      <ModuleTable rows={config.rows} locale={l} />
    </section>
  );
}
