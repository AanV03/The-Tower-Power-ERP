"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/shared/metric-card";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import {
  Download,
  LayoutDashboard,
  Megaphone,
  Plus,
  RefreshCw,
  Users,
  Workflow,
} from "lucide-react";
import { AudienceSegments } from "./audience-segments";
import { AutomationFlow } from "./automation-flow";
import { CampaignPerformanceChart } from "./campaign-performance-chart";
import { CampaignsGrid } from "./campaigns-grid";
import { ChurnInterventionsPanel } from "./churn-interventions-panel";
import { ConversionFunnel } from "./conversion-funnel";
import {
  addDemoCampaign,
  createCampaignDraft,
  filterMarketingCampaigns,
  markMemberContacted,
  toggleCampaignStatus,
} from "./demo-controller";
import { NewCampaignModal } from "./new-campaign-modal";
import type {
  CampaignDraft,
  CampaignFilterState,
  MarketingCampaign,
  MarketingChannel,
  MarketingDashboardProps,
  MemberAtRisk,
  SelectOption,
} from "./types";

const tabIcons = {
  overview: LayoutDashboard,
  campaigns: Megaphone,
  audiences: Users,
  automation: Workflow,
};

function isConcreteChannel(
  option: SelectOption<MarketingChannel | "all">,
): option is SelectOption<MarketingChannel> {
  return option.value !== "all";
}

export function MarketingDashboard({
  locale,
  data,
  state,
  labels,
  actions,
  channelOptions,
  statusOptions,
  campaignStatusConfig,
  churnRiskConfig,
}: MarketingDashboardProps) {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(data.campaigns);
  const [membersAtRisk, setMembersAtRisk] = useState<MemberAtRisk[]>(data.membersAtRisk);
  const [filters, setFilters] = useState<CampaignFilterState>({
    query: "",
    channel: "all",
    status: "all",
  });
  const [campaignDraft, setCampaignDraft] = useState<CampaignDraft>(() => createCampaignDraft());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleCampaigns = useMemo(
    () => filterMarketingCampaigns(campaigns, filters),
    [campaigns, filters],
  );

  const openCampaignModal = (segmentName = "") => {
    setCampaignDraft(createCampaignDraft(segmentName));
    setIsModalOpen(true);
    actions?.onSendToSegment?.(segmentName);
  };

  const handleCreateCampaign = (draft: CampaignDraft) => {
    setCampaigns((current) => addDemoCampaign(current, draft));
    setIsModalOpen(false);
    actions?.onCreateCampaign?.(draft);
    toast.success(labels.campaignCreated);
  };

  const handleToggleCampaignStatus = (campaignId: string) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    setCampaigns((current) => toggleCampaignStatus(current, campaignId));
    actions?.onToggleCampaignStatus?.(campaignId);

    if (campaign?.status === "active") {
      toast.success(labels.campaignPaused);
    }

    if (campaign?.status === "paused") {
      toast.success(labels.campaignResumed);
    }
  };

  const handleIntervention = (memberId: string, message: string) => {
    const result = markMemberContacted(membersAtRisk, memberId);
    setMembersAtRisk(result.members);
    toast.success(message);
  };

  const handleRefresh = () => {
    actions?.onRefresh?.();
    toast.success(labels.demoUpdated);
  };

  const handleExport = () => {
    actions?.onExport?.();
    toast.success(labels.exportReady);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Megaphone className="size-7 text-primary" aria-hidden="true" />
            {data.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleRefresh}>
              <RefreshCw className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{labels.refresh}</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleExport}>
              <Download className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{labels.export}</span>
            </Button>
            <Button
              onClick={() => openCampaignModal("")}
              className={cn(headerPrimaryActionClass, "h-9 gap-1")}
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{data.primaryActionLabel}</span>
            </Button>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">{data.subtitle}</p>
      </div>

      <div className="erp-page-grid">
        {data.metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
            locale={locale}
          />
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border bg-muted/60 p-1 sm:grid-cols-4 sm:gap-0">
          {(["overview", "campaigns", "audiences", "automation"] as const).map((tab) => {
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

        <TabsContent value="overview" className="mt-0 space-y-6">
          <CampaignPerformanceChart data={data.performance} status={state.overview} labels={labels} />
          <ConversionFunnel stages={data.funnel} status={state.overview} labels={labels} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <CampaignsGrid
            campaigns={visibleCampaigns}
            filters={filters}
            onFiltersChange={setFilters}
            status={state.campaigns}
            labels={labels}
            channelOptions={channelOptions}
            statusOptions={statusOptions}
            campaignStatusConfig={campaignStatusConfig}
            onToggleStatus={handleToggleCampaignStatus}
            onPreview={(campaignId) => {
              actions?.onPreviewCampaign?.(campaignId);
              toast.info(labels.preview);
            }}
          />
        </TabsContent>

        <TabsContent value="audiences" className="mt-0 space-y-6">
          <ChurnInterventionsPanel
            members={membersAtRisk}
            status={state.audiences}
            labels={labels}
            riskConfig={churnRiskConfig}
            onSendMessage={(memberId) => {
              actions?.onSendIntervention?.(memberId);
              handleIntervention(memberId, labels.interventionSent);
            }}
            onMarkContacted={(memberId) => {
              actions?.onMarkContacted?.(memberId);
              handleIntervention(memberId, labels.markedContacted);
            }}
          />
          <AudienceSegments
            segments={data.segments}
            status={state.audiences}
            labels={labels}
            onSendToSegment={openCampaignModal}
          />
        </TabsContent>

        <TabsContent value="automation" className="mt-0 flex justify-center">
          <div className="w-full max-w-2xl">
            <AutomationFlow
              steps={data.automationSteps}
              branches={data.automationBranches}
              status={state.automation}
              labels={labels}
            />
          </div>
        </TabsContent>
      </Tabs>

      <NewCampaignModal
        isOpen={isModalOpen}
        draft={campaignDraft}
        labels={labels}
        channelOptions={channelOptions.filter(isConcreteChannel)}
        onDraftChange={setCampaignDraft}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />
    </div>
  );
}
