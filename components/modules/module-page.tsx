import { AuditFeed } from "@/components/shared/audit-feed";
import { MetricCard } from "@/components/shared/metric-card";
import { ModuleChart } from "@/components/shared/module-chart";
import { ModuleTable } from "@/components/shared/module-table";
import { QuickActions } from "@/components/shared/quick-actions";
import { moduleConfigs } from "@/data/modules";
import type { ModuleId } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";

export function ModulePage({
  moduleId,
  locale,
}: {
  moduleId: ModuleId;
  locale: Locale;
}) {
  const config = moduleConfigs[moduleId];
  const chartLabels = {
    es: {
      title: "Tendencia operativa",
      description: "Datos de muestra para diseñar la integración con APIs.",
    },
    en: {
      title: "Operational trend",
      description: "Sample data to design future API integration.",
    },
    fr: {
      title: "Tendance opérationnelle",
      description: "Données d'exemple pour concevoir l'intégration future de l'API.",
    },
  }[locale];

  return (
    <section className="erp-section space-y-6" role="main" aria-label={config.title[locale]}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-primary">
            Gerpy ERP
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            {config.title[locale]}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            {config.subtitle[locale]}
          </p>
        </div>
        <QuickActions primaryLabel={config.primaryAction[locale]} locale={locale} />
      </div>

      <div className="erp-page-grid" aria-label="Métricas clave">
        {config.metrics.map((metric) => (
          <MetricCard
            key={metric.label[locale]}
            label={metric.label[locale]}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ModuleChart
          title={chartLabels.title}
          description={chartLabels.description}
          data={config.chart}
          type={moduleId === "inventory" || moduleId === "admin" ? "bar" : "area"}
        />
        <AuditFeed locale={locale} />
      </div>

      <ModuleTable rows={config.rows} locale={locale} />
    </section>
  );
}
