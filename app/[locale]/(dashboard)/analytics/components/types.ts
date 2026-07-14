import type { Locale } from "@/lib/i18n";

export type AnalyticsUiStatus = "idle" | "loading" | "empty" | "error" | "success";
export type AnalyticsMetricTone = "default" | "success" | "warning" | "danger";
export type AnalyticsRange = "today" | "7d" | "30d" | "90d" | "all";
export type AnalyticsTab = "overview" | "branches" | "reports";
export type AnalyticsRowStatus = "active" | "warning" | "critical";
export type ExportFormat = "pdf" | "csv";

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type SparklinePoint = {
  value: number;
};

export type AnalyticsMetric = {
  id: string;
  key: string;
  label: string;
  value: string;
  change: string;
  tone: AnalyticsMetricTone;
  sparkline?: SparklinePoint[];
};

export type AnalyticsChartPoint = {
  label: string;
  value: number;
  retention: number;
  churn: number;
};

export type BranchComparisonPoint = {
  branch: string;
  members: number;
  retention: number;
  revenue: number;
};

export type AnalyticsActivityRow = {
  id: string;
  name: string;
  branch: string;
  status: AnalyticsRowStatus;
  amount: string;
  owner: string;
};

export type PeriodDelta = {
  label: string;
  current: string;
  previous: string;
  delta: number;
  unit?: string;
};

export type PeriodSnapshot = {
  id: string;
  period: string;
  range: string;
  metrics: PeriodDelta[];
};

export type BusinessInsight = {
  title: string;
  message: string;
  tone: "info" | "success" | "warning";
};

export type ExportReportDraft = {
  format: ExportFormat;
  includeCharts: boolean;
  includeMetadata: boolean;
};

export type AnalyticsFilters = {
  query: string;
  branch: string;
  status: AnalyticsRowStatus | "all";
};

export type AnalyticsDashboardData = {
  title: string;
  subtitle: string;
  activeRange: AnalyticsRange;
  activeBranch: string;
  metrics: AnalyticsMetric[];
  insight: BusinessInsight;
  chart: AnalyticsChartPoint[];
  branchComparison: BranchComparisonPoint[];
  rows: AnalyticsActivityRow[];
  snapshots: PeriodSnapshot[];
};

export type AnalyticsDashboardState = {
  page: AnalyticsUiStatus;
  overview: AnalyticsUiStatus;
  branches: AnalyticsUiStatus;
  reports: AnalyticsUiStatus;
  export: AnalyticsUiStatus;
  message?: string;
};

export type AnalyticsLabels = {
  tabs: Record<AnalyticsTab, string>;
  actions: {
    filter: string;
    export: string;
    refresh: string;
    compare: string;
  };
  filters: {
    range: string;
    branch: string;
    status: string;
    searchPlaceholder: string;
    allBranches: string;
    allStatuses: string;
  };
  charts: {
    mainTitle: string;
    mainDescription: string;
    retention: string;
    churn: string;
    branchTitle: string;
    branchDescription: string;
    members: string;
    revenue: string;
  };
  table: {
    title: string;
    description: string;
    item: string;
    branch: string;
    status: string;
    amount: string;
    owner: string;
  };
  export: {
    title: string;
    description: string;
    format: string;
    pdf: string;
    csv: string;
    includeCharts: string;
    includeMetadata: string;
    cancel: string;
    submit: string;
    success: string;
  };
  empty: {
    overviewTitle: string;
    overviewDescription: string;
    branchesTitle: string;
    branchesDescription: string;
    reportsTitle: string;
    reportsDescription: string;
  };
  error: {
    title: string;
    description: string;
    retry: string;
  };
  status: Record<AnalyticsRowStatus, string>;
};

export type AnalyticsActionHandlers = {
  onRangeChange?: (range: AnalyticsRange) => void;
  onBranchChange?: (branch: string) => void;
  onRefresh?: () => void;
  onExport?: (draft: ExportReportDraft) => void;
};

export type AnalyticsDashboardProps = {
  locale: Locale;
  data: AnalyticsDashboardData;
  state: AnalyticsDashboardState;
  labels: AnalyticsLabels;
  rangeOptions: SelectOption<AnalyticsRange>[];
  branchOptions: SelectOption[];
  statusOptions: SelectOption<AnalyticsRowStatus | "all">[];
  actions?: AnalyticsActionHandlers;
};
