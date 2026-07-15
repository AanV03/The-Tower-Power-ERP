import type { ModuleRow } from "@/data/modules";
import type {
  AnalyticsActivityRow,
  AnalyticsChartPoint,
  AnalyticsDashboardData,
  AnalyticsDashboardState,
  AnalyticsMetric,
  AnalyticsRange,
  BranchComparisonPoint,
  PeriodSnapshot,
  SelectOption,
} from "./types";

export function mapModuleRowsToAnalyticsRows(rows: ModuleRow[]): AnalyticsActivityRow[] {
  return rows.map((row, index) => ({
    id: `row-${index + 1}`,
    name: row.name,
    branch: row.branch,
    status: row.status,
    amount: row.amount,
    owner: row.owner,
  }));
}

export function normalizeChartData(data: unknown[]): AnalyticsChartPoint[] {
  return data.map((item, index) => {
    const point = item as Partial<AnalyticsChartPoint>;

    return {
      label: String(point.label ?? `P${index + 1}`),
      value: Number(point.value ?? 0),
      retention: Number(point.retention ?? point.value ?? 0),
      churn: Number(point.churn ?? Math.max(0, 100 - Number(point.retention ?? point.value ?? 0))),
    };
  });
}

export const analyticsBranchComparison: BranchComparisonPoint[] = [
  { branch: "Centro", members: 1240, retention: 87, revenue: 148 },
  { branch: "Norte", members: 890, retention: 82, revenue: 102 },
  { branch: "Campus", members: 1560, retention: 91, revenue: 204 },
  { branch: "Sur", members: 620, retention: 76, revenue: 78 },
];

export const analyticsSnapshots: PeriodSnapshot[] = [
  {
    id: "month",
    period: "Este mes vs. mes anterior",
    range: "Jun vs. May",
    metrics: [
      { label: "Nuevos miembros", current: "248", previous: "210", delta: 18.1 },
      { label: "Ingresos", current: "$134k", previous: "$118k", delta: 13.6 },
      { label: "Retencion", current: "87%", previous: "84%", delta: 3.6 },
      { label: "Churn", current: "4.2%", previous: "5.1%", delta: -17.6 },
    ],
  },
  {
    id: "week",
    period: "Esta semana vs. semana anterior",
    range: "Sem 26 vs. Sem 25",
    metrics: [
      { label: "Nuevos miembros", current: "62", previous: "54", delta: 14.8 },
      { label: "Ingresos", current: "$31k", previous: "$28k", delta: 10.7 },
      { label: "Retencion", current: "89%", previous: "87%", delta: 2.3 },
      { label: "Churn", current: "3.8%", previous: "4.4%", delta: -13.6 },
    ],
  },
  {
    id: "day",
    period: "Hoy vs. ayer",
    range: "Sab 28 vs. Vie 27",
    metrics: [
      { label: "Nuevos miembros", current: "9", previous: "11", delta: -18.2 },
      { label: "Ingresos", current: "$4.2k", previous: "$5.1k", delta: -17.6 },
      { label: "Retencion", current: "91%", previous: "89%", delta: 2.2 },
      { label: "Churn", current: "3.1%", previous: "4.0%", delta: -22.5 },
    ],
  },
];

export function createAnalyticsBranchOptions(rows: AnalyticsActivityRow[]): SelectOption[] {
  const branches = Array.from(new Set(rows.map((row) => row.branch))).filter(Boolean);

  return [
    { value: "", label: "Consolidado" },
    ...branches.map((branch) => ({ value: branch, label: branch })),
  ];
}

export function createAnalyticsDemoData({
  title,
  subtitle,
  activeRange,
  activeBranch,
  metrics,
  chart,
  rows,
  insight,
}: {
  title: string;
  subtitle: string;
  activeRange: AnalyticsRange;
  activeBranch: string;
  metrics: AnalyticsMetric[];
  chart: AnalyticsChartPoint[];
  rows: AnalyticsActivityRow[];
  insight: AnalyticsDashboardData["insight"];
}): AnalyticsDashboardData {
  return {
    title,
    subtitle,
    activeRange,
    activeBranch,
    metrics,
    insight,
    chart,
    branchComparison: analyticsBranchComparison,
    rows,
    snapshots: analyticsSnapshots,
  };
}

export const analyticsInitialState: AnalyticsDashboardState = {
  page: "idle",
  overview: "idle",
  branches: "idle",
  reports: "idle",
  export: "idle",
};
