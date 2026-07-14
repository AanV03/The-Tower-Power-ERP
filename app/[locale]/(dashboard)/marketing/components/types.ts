import type { Locale } from "@/lib/i18n";

export type MarketingUiStatus = "idle" | "loading" | "empty" | "error" | "success";
export type MarketingMetricTone = "default" | "success" | "warning" | "danger";
export type MarketingChannel = "email" | "sms" | "social";
export type CampaignStatus = "active" | "draft" | "scheduled" | "paused";
export type ChurnRisk = "high" | "medium" | "low";
export type MarketingTab = "overview" | "campaigns" | "audiences" | "automation";

export type MarketingMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: MarketingMetricTone;
};

export type CampaignPerformancePoint = {
  label: string;
  sent: number;
  opened: number;
  converted: number;
};

export type FunnelStage = {
  key: "leads" | "tours" | "trials" | "paid";
  label: string;
  value: number;
};

export type MarketingCampaign = {
  id: string;
  name: string;
  channel: MarketingChannel;
  status: CampaignStatus;
  segment: string;
  sent: number;
  openRate: number;
  clickRate: number;
  conversion: number;
  sparkline: number[];
};

export type AudienceSegment = {
  key: "churn" | "spenders" | "inactive" | "newSignups";
  name: string;
  count: number;
  growth: string;
  positive: boolean;
};

export type MemberAtRisk = {
  id: string;
  name: string;
  plan: string;
  lastVisit: string;
  daysInactive: number;
  churnScore: number;
  risk: ChurnRisk;
  contacted: boolean;
};

export type AutomationStepType = "trigger" | "delay" | "action" | "condition";

export type AutomationStep = {
  id: string;
  type: AutomationStepType;
  label: string;
  activeUsers?: number;
  subLabel: string;
  delivered?: string;
};

export type AutomationBranch = {
  id: string;
  label: string;
  action: string;
  activeUsers: number;
  tone: "success" | "danger";
};

export type CampaignDraft = {
  name: string;
  channel: MarketingChannel;
  segment: string;
  content: string;
};

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type StatusVisualConfig = {
  label: string;
  className: string;
  dotClassName?: string;
};

export type MarketingLabels = {
  tabs: Record<MarketingTab, string>;
  performanceTitle: string;
  performanceDescription: string;
  performanceSeries: {
    sent: string;
    opened: string;
    converted: string;
  };
  funnelTitle: string;
  funnelDescription: string;
  conversionRate: string;
  dropoff: string;
  campaignsTitle: string;
  campaignsDescription: string;
  campaignMetrics: {
    sent: string;
    openRate: string;
    clickRate: string;
    conversion: string;
  };
  campaignActions: {
    pause: string;
    resume: string;
  };
  segmentsTitle: string;
  segmentsDescription: string;
  members: string;
  churnTitle: string;
  churnDescription: string;
  automationTitle: string;
  automationDescription: string;
  activeUsers: string;
  modalTitle: string;
  modalDescription: string;
  modalFields: {
    name: string;
    namePlaceholder: string;
    channel: string;
    segment: string;
    segmentPlaceholder: string;
    content: string;
    contentPlaceholder: string;
  };
  modalActions: {
    cancel: string;
    submit: string;
  };
  searchPlaceholder: string;
  channelFilter: string;
  statusFilter: string;
  allChannels: string;
  allStatuses: string;
  refresh: string;
  export: string;
  preview: string;
  sendIntervention: string;
  markContacted: string;
  contacted: string;
  critical: string;
  interventionProgress: string;
  score: string;
  live: string;
  emptyCampaignsTitle: string;
  emptyCampaignsDescription: string;
  emptyAudiencesTitle: string;
  emptyAudiencesDescription: string;
  emptyAutomationTitle: string;
  emptyAutomationDescription: string;
  loadingTitle: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  formRequiredError: string;
  campaignCreated: string;
  campaignPaused: string;
  campaignResumed: string;
  interventionSent: string;
  markedContacted: string;
  demoUpdated: string;
  exportReady: string;
};

export type CampaignFilterState = {
  query: string;
  channel: MarketingChannel | "all";
  status: CampaignStatus | "all";
};

export type MarketingDashboardData = {
  title: string;
  subtitle: string;
  primaryActionLabel: string;
  metrics: MarketingMetric[];
  performance: CampaignPerformancePoint[];
  funnel: FunnelStage[];
  campaigns: MarketingCampaign[];
  segments: AudienceSegment[];
  membersAtRisk: MemberAtRisk[];
  automationSteps: AutomationStep[];
  automationBranches: AutomationBranch[];
};

export type MarketingDashboardState = {
  page: MarketingUiStatus;
  overview: MarketingUiStatus;
  campaigns: MarketingUiStatus;
  audiences: MarketingUiStatus;
  automation: MarketingUiStatus;
  message?: string;
};

export type MarketingActionHandlers = {
  onCreateCampaign?: (draft: CampaignDraft) => void;
  onToggleCampaignStatus?: (campaignId: string) => void;
  onPreviewCampaign?: (campaignId: string) => void;
  onSendIntervention?: (memberId: string) => void;
  onMarkContacted?: (memberId: string) => void;
  onSendToSegment?: (segmentName: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onRetry?: () => void;
};

export type MarketingDashboardProps = {
  locale: Locale;
  data: MarketingDashboardData;
  state: MarketingDashboardState;
  labels: MarketingLabels;
  actions?: MarketingActionHandlers;
  channelOptions: SelectOption<MarketingChannel | "all">[];
  statusOptions: SelectOption<CampaignStatus | "all">[];
  campaignStatusConfig: Record<CampaignStatus, StatusVisualConfig>;
  churnRiskConfig: Record<ChurnRisk, StatusVisualConfig>;
};
