import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Boxes,
  CreditCard,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import AlertStack from "@/components/dashboard/AlertStack";
import DrillPane from "@/components/dashboard/DrillPane";
import FilterBar from "@/components/dashboard/FilterBar";
import OperationalGrid from "@/components/dashboard/OperationalGrid";
import RowDetailDrawer from "@/components/dashboard/RowDetailDrawer";
import { AuditFeed } from "@/components/shared/audit-feed";
import { ModuleChart } from "@/components/shared/module-chart";
import { ModuleTable } from "@/components/shared/module-table";
import { moduleConfigs } from "@/data/modules";
import { requireApiContext } from "@/lib/api/context";
import { getModuleSummary } from "@/lib/api/module-summary";
import { getDictionary, type Locale } from "@/lib/i18n";

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

function rowKey(row: any, index: number) {
  return row.id ?? row.sku ?? row.email ?? `${row.name ?? "row"}-${index}`;
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const dict = getDictionary(l);
  const context = await requireApiContext({ moduleId: "dashboard" });
  const summary = await getModuleSummary("dashboard", context);
  const metrics = mergeMetrics("dashboard", l, summary);
  const visibleRows = (summary.rows || []).slice(0, 4);
  const criticalStock = (summary.rows || []).slice(0, 3);
  const dashboardCards = [
    {
      label: metrics[0]?.label ?? "Revenue",
      value: metrics[0]?.value ?? "-",
      change: metrics[0]?.change ?? "Current",
      icon: CreditCard,
      tone: "text-emerald-400",
    },
    {
      label: metrics[1]?.label ?? "Active members",
      value: metrics[1]?.value ?? "-",
      change: metrics[1]?.change ?? "Live",
      icon: UsersRound,
      tone: "text-sky-400",
    },
    {
      label: metrics[2]?.label ?? "Risk",
      value: metrics[2]?.value ?? "-",
      change: metrics[2]?.change ?? "Watch",
      icon: AlertTriangle,
      tone: "text-amber-400",
    },
  ];

  return (
    <section
      className="erp-section space-y-6"
      role="main"
      aria-label={moduleConfigs.dashboard.title[l]}
      data-testid="dashboard-page"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1
            className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground"
            data-testid="dashboard-heading"
          >
            <Activity className="size-7 text-primary" aria-hidden="true" />
            {moduleConfigs.dashboard.title[l]}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {moduleConfigs.dashboard.subtitle[l]}
          </p>
        </div>
        <FilterBar rows={summary.rows ?? []} />
      </div>

      <main className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-card p-6 text-card-foreground shadow-2xl shadow-black/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(251,133,0,0.18),transparent_34rem),radial-gradient(circle_at_90%_10%,rgba(0,188,125,0.12),transparent_26rem)]" />
          <div className="relative flex flex-col gap-5">

            <div className="grid gap-3 md:grid-cols-3">
              {dashboardCards.map(({ icon: Icon, ...card }) => (
                <article key={card.label} className="rounded-xl border border-white/10 bg-background/55 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {card.label}
                      </p>
                      <p className="mt-3 text-3xl font-black text-foreground">{card.value}</p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className={`mt-4 inline-flex items-center gap-1 rounded-full bg-current/10 px-2.5 py-1 text-xs font-bold ${card.tone}`}>
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span>{card.change}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <ModuleChart
                data={summary.chart}
                title={dict.moduleChart.title}
                description={dict.moduleChart.description}
                locale={l}
              />
              <RowDetailDrawer open={true} />
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Alerts</h2>
                <p className="mt-1 text-xs text-muted-foreground">Branch health and exceptions</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { title: "Access devices", copy: "All doors online", icon: BadgeCheck, tone: "text-emerald-400" },
                { title: "Billing queue", copy: "No failed payments", icon: CreditCard, tone: "text-sky-400" },
                { title: "Inventory", copy: "3 low-stock SKUs", icon: Boxes, tone: "text-amber-400" },
              ].map(({ title, copy, icon: Icon, tone }) => (
                <div key={title} className="flex items-center gap-3 rounded-xl border border-border bg-background/45 p-3">
                  <div className={`flex size-9 items-center justify-center rounded-lg bg-current/10 ${tone}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                    <p className="truncate text-xs text-muted-foreground">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <AlertStack items={[]} locale={l} />
        </aside>
      </main>

      <section>
        <OperationalGrid>
          <article className="flex min-h-[260px] h-full w-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-foreground">Members</h5>
              <UsersRound className="size-4 text-[var(--brand-orange)]" aria-hidden="true" />
            </div>
            <div className="mt-3 flex-1">
              <ModuleTable rows={visibleRows} locale={l} />
            </div>
          </article>

          <article className="flex min-h-[260px] h-full w-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-foreground">Secure audit</h5>
              <Activity className="size-4 text-[var(--brand-green)]" aria-hidden="true" />
            </div>
            <div className="mt-3 flex-1">
              <AuditFeed locale={l} />
            </div>
          </article>

          <article className="flex min-h-[260px] h-full w-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-foreground">Critical stock</h5>
              <BellRing className="size-4 text-amber-400" aria-hidden="true" />
            </div>
            <div className="mt-4 flex-1 space-y-3 text-sm text-muted-foreground">
              {criticalStock.map((row: any, index: number) => (
                <div
                  key={rowKey(row, index)}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/45 px-3 py-2"
                >
                  <span className="truncate">{row.name}</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-500">
                    Watch
                  </span>
                </div>
              ))}
              {criticalStock.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  No critical stock alerts.
                </div>
              )}
            </div>
          </article>
        </OperationalGrid>
      </section>

      <section>
        <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-bold text-foreground">Recent activity</h5>
            <span className="rounded-full bg-[var(--brand-orange)]/10 px-3 py-1 text-xs font-bold text-[var(--brand-orange)]">
              Live feed
            </span>
          </div>
          <div className="mt-3">
            <ModuleTable rows={summary.rows} locale={l} />
          </div>
        </div>
      </section>

      <DrillPane />
    </section>
  );
}
