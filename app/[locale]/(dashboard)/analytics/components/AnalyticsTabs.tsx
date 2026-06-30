"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, Building2, FileDown } from "lucide-react";
import { AnalyticsMultiChart } from "./AnalyticsMultiChart";
import { AnalyticsTable } from "./AnalyticsTable";
import { BranchComparisonChart } from "./BranchComparisonChart";
import { PeriodSnapshotPanel } from "./PeriodSnapshotPanel";
import type { Locale } from "@/lib/i18n";
import type { ModuleRow } from "@/data/modules";

type AnalyticsTabsProps = {
  locale: Locale;
  chartTitle: string;
  chartDesc: string;
  chartData: { label: string; value: number; retention: number; churn: number }[];
  tableRows: ModuleRow[];
};

export function AnalyticsTabs({
  locale,
  chartTitle,
  chartDesc,
  chartData,
  tableRows,
}: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 !h-auto sm:!h-10 bg-muted/60 p-1 rounded-lg border">
        <TabsTrigger
          value="overview"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          <LayoutDashboard className="size-4 shrink-0" />
          <span>Resumen</span>
        </TabsTrigger>
        <TabsTrigger
          value="branches"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          <Building2 className="size-4 shrink-0" />
          <span>Sucursales</span>
        </TabsTrigger>
        <TabsTrigger
          value="reports"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          <FileDown className="size-4 shrink-0" />
          <span>Reportes</span>
        </TabsTrigger>
      </TabsList>

      {/* TAB 1 — Resumen: gráfico multi-serie de retención/churn */}
      <TabsContent value="overview" className="mt-0">
        <AnalyticsMultiChart
          title={chartTitle}
          description={chartDesc}
          data={chartData}
          locale={locale}
        />
      </TabsContent>

      {/* TAB 2 — Sucursales: comparativa de barras + tabla de actividad */}
      <TabsContent value="branches" className="space-y-6 mt-0">
        <BranchComparisonChart />
        <AnalyticsTable rows={tableRows} locale={locale} />
      </TabsContent>

      {/* TAB 3 — Reportes: snapshots de periodos */}
      <TabsContent value="reports" className="space-y-6 mt-0">
        <PeriodSnapshotPanel />
      </TabsContent>
    </Tabs>
  );
}
