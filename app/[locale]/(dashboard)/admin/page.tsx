import { AuditFeed } from "@/components/shared/audit-feed";
import { MetricCard } from "@/components/shared/metric-card";
import { ModuleChart } from "@/components/shared/module-chart";
import { ModuleTable } from "@/components/shared/module-table";
import { QuickActions } from "@/components/shared/quick-actions";
import { BrandingPanel } from "@/components/branding/branding-panel";
import { moduleConfigs } from "@/data/modules";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const config = moduleConfigs["admin"];
  const dictionary = getDictionary(l);


  return (
    <section className="erp-section space-y-6" role="main" aria-label={config.title[l]}>
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

      <div className="erp-page-grid" aria-label={dictionary.common.metricsAriaLabel}>
        {config.metrics.map((metric) => (
          <MetricCard
            key={metric.label[l]}
            label={metric.label[l]}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
            locale={l}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ModuleChart
          title={dictionary.moduleChart.title}
          description={dictionary.moduleChart.description}
          data={config.chart}
          locale={l}
          type="bar"
        />
        <AuditFeed locale={l} />
      </div>

      <ModuleTable rows={config.rows} locale={l} />

      {/* â”€â”€ Branding Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {l === "es" ? "PersonalizaciÃ³n de Identidad" : l === "en" ? "Brand Customization" : "Personnalisation"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {l === "es"
              ? "Ajusta los colores del sidebar y topbar para cada tenant. Los cambios se aplican en tiempo real."
              : l === "en"
              ? "Adjust sidebar and topbar colors per tenant. Changes apply in real time."
              : "Ajustez les couleurs du sidebar et du topbar. Les modifications s'appliquent en temps rÃ©el."}
          </p>
        </div>
        <BrandingPanel locale={l} />
      </div>
    </section>
  );
}
