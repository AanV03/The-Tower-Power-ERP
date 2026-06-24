import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { moduleConfigs } from "@/data/modules";
import { ModuleChart } from "@/components/shared/module-chart";
import { AuditFeed } from "@/components/shared/audit-feed";
import { ModuleTable } from "@/components/shared/module-table";
import HeroKPI from "@/components/dashboard/HeroKPI";
import AlertStack from "@/components/dashboard/AlertStack";
import FilterBar from "@/components/dashboard/FilterBar";
import OperationalGrid from "@/components/dashboard/OperationalGrid";
import DrillPane from "@/components/dashboard/DrillPane";
import RowDetailDrawer from "@/components/dashboard/RowDetailDrawer";

function mergeMetrics(moduleId: string, locale: Locale, summary: Awaited<ReturnType<typeof getModuleSummary>>) {
  const config = moduleConfigs[moduleId as keyof typeof moduleConfigs];

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

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  const context = await requireApiContext({ moduleId: "dashboard" });
  const summary = await getModuleSummary("dashboard", context);
  const metrics = mergeMetrics("dashboard", locale as Locale, summary);

  return (
    <div className="container mx-auto px-4 lg:px-6">
      <FilterBar />
      <div className="h-12" />

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
        <div className="lg:col-span-2 h-full">
          <HeroKPI
            title={moduleConfigs.dashboard.title[locale as Locale]}
            value={metrics[0]?.value ?? "-"}
            subtitle={moduleConfigs.dashboard.subtitle[locale as Locale]}
            meta={dict.moduleChart.title}
          >
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2">
                <ModuleChart data={summary.chart} title={dict.moduleChart.title} description={dict.moduleChart.description} locale={locale as Locale} />
              </div>
              <div className="lg:col-span-1">
                <RowDetailDrawer open={true} />
              </div>
            </div>
          </HeroKPI>
        </div>
        <aside className="lg:col-span-1 h-full">
          <AlertStack items={[]} />
        </aside>
      </main>

      <section className="mt-6">
        <OperationalGrid>
          <article className="h-full w-full bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 flex flex-col min-h-[240px]">
            <h5 className="text-sm font-medium">Miembros</h5>
            <div className="mt-3 flex-1">
              <ModuleTable rows={summary.rows} locale={locale as Locale} />
            </div>
          </article>

          <article className="h-full w-full bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 flex flex-col min-h-[240px]">
            <h5 className="text-sm font-medium">Suscripciones</h5>
            <div className="mt-3 flex-1">
              <AuditFeed locale={locale as Locale} />
            </div>
          </article>

          <article className="h-full w-full bg-white dark:bg-slate-800 rounded-md shadow-sm p-4 flex flex-col min-h-[240px]">
            <h5 className="text-sm font-medium">Stock crítico</h5>
            <div className="mt-3 flex-1 text-sm text-slate-500">{(summary.rows || []).slice(0,3).map((r:any)=> (<div key={r.id}>{r.name}</div>))}</div>
          </article>
        </OperationalGrid>
      </section>

      <section className="mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-4">
          <h5 className="text-sm font-medium">Actividad reciente</h5>
          <div className="mt-3">
            <ModuleTable rows={summary.rows} locale={locale as Locale} />
          </div>
        </div>
      </section>

      <DrillPane />
    </div>
  );
}
