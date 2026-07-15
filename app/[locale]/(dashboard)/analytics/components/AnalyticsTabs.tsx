"use client";

import { Building2, FileDown, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsMultiChart } from "./AnalyticsMultiChart";
import { AnalyticsTable } from "./AnalyticsTable";
import { BranchComparisonChart } from "./BranchComparisonChart";
import { PeriodSnapshotPanel } from "./PeriodSnapshotPanel";
import type {
  AnalyticsActivityRow,
  AnalyticsChartPoint,
  AnalyticsDashboardState,
  AnalyticsFilters,
  AnalyticsLabels,
  AnalyticsRowStatus,
  BranchComparisonPoint,
  PeriodSnapshot,
  SelectOption,
} from "./types";

const tabIcons = {
  overview: LayoutDashboard,
  branches: Building2,
  reports: FileDown,
};

export function AnalyticsTabs({
  data,
  state,
  labels,
  filters,
  onFiltersChange,
  statusOptions,
}: {
  locale: string;
  data: {
    chart: AnalyticsChartPoint[];
    branchComparison: BranchComparisonPoint[];
    rows: AnalyticsActivityRow[];
    snapshots: PeriodSnapshot[];
  };
  state: AnalyticsDashboardState;
  labels: AnalyticsLabels;
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  statusOptions: SelectOption<AnalyticsRowStatus | "all">[];
}) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg border bg-muted/60 p-1">
        {(["overview", "branches", "reports"] as const).map((tab) => {
          const Icon = tabIcons[tab];

          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold sm:text-sm"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{labels.tabs[tab]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <AnalyticsMultiChart data={data.chart} status={state.overview} labels={labels} />
      </TabsContent>

      <TabsContent value="branches" className="mt-0 space-y-6">
        <BranchComparisonChart data={data.branchComparison} status={state.branches} labels={labels} />
        <AnalyticsTable
          rows={data.rows}
          status={state.branches}
          labels={labels}
          filters={filters}
          onFiltersChange={onFiltersChange}
          statusOptions={statusOptions}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-0 space-y-6">
        <PeriodSnapshotPanel snapshots={data.snapshots} status={state.reports} labels={labels} />
      </TabsContent>
    </Tabs>
  );
}
