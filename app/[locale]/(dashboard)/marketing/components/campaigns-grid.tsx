"use client";

import { Mail, MessageSquare, Pause, Play, Search, Share2, SlidersHorizontal, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  CampaignFilterState,
  CampaignStatus,
  MarketingCampaign,
  MarketingChannel,
  MarketingLabels,
  MarketingUiStatus,
  SelectOption,
  StatusVisualConfig,
} from "./types";

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  social: Share2,
};

const channelClasses: Record<MarketingChannel, string> = {
  email: "border-blue-500/30 text-blue-600 dark:text-blue-400",
  sms: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  social: "border-primary/30 text-primary",
};

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const points = data.map((value, index) => {
    const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
    const y = 100 - (value / max) * 100;
    return `${x},${y}`;
  });

  return (
    <svg width="64" height="28" viewBox="0 0 100 100" preserveAspectRatio="none" className="opacity-75">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
    </svg>
  );
}

export function CampaignsGrid({
  campaigns,
  filters,
  onFiltersChange,
  status,
  labels,
  channelOptions,
  statusOptions,
  campaignStatusConfig,
  onToggleStatus,
  onPreview,
}: {
  campaigns: MarketingCampaign[];
  filters: CampaignFilterState;
  onFiltersChange: (filters: CampaignFilterState) => void;
  status: MarketingUiStatus;
  labels: MarketingLabels;
  channelOptions: SelectOption<MarketingChannel | "all">[];
  statusOptions: SelectOption<CampaignStatus | "all">[];
  campaignStatusConfig: Record<CampaignStatus, StatusVisualConfig>;
  onToggleStatus: (campaignId: string) => void;
  onPreview: (campaignId: string) => void;
}) {
  const showCards = status !== "loading" && status !== "error" && campaigns.length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <MegaphoneTitleIcon />
              {labels.campaignsTitle}
            </CardTitle>
            <CardDescription>{labels.campaignsDescription}</CardDescription>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_160px_160px] lg:min-w-[600px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
                placeholder={labels.searchPlaceholder}
                className="pl-8"
              />
            </div>
            <NativeSelect
              aria-label={labels.channelFilter}
              value={filters.channel}
              onChange={(event) =>
                onFiltersChange({ ...filters, channel: event.target.value as MarketingChannel | "all" })
              }
            >
              {channelOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label={labels.statusFilter}
              value={filters.status}
              onChange={(event) =>
                onFiltersChange({ ...filters, status: event.target.value as CampaignStatus | "all" })
              }
            >
              {statusOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {status === "loading" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <EmptyState
            variant="error"
            title={labels.errorTitle}
            description={labels.errorDescription}
            className="bg-transparent"
          />
        ) : null}

        {status !== "loading" && status !== "error" && campaigns.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal className="size-10 text-muted-foreground" aria-hidden="true" />}
            title={labels.emptyCampaignsTitle}
            description={labels.emptyCampaignsDescription}
            className="bg-transparent"
          />
        ) : null}

        {showCards ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {campaigns.map((campaign) => {
              const Icon = channelIcons[campaign.channel];
              const statusConfig = campaignStatusConfig[campaign.status];
              const canToggle = campaign.status === "active" || campaign.status === "paused";

              return (
                <article
                  key={campaign.id}
                  className={cn(
                    "flex min-h-48 flex-col justify-between rounded-xl border bg-card/55 p-4 shadow-xs transition-colors hover:bg-card",
                    channelClasses[campaign.channel],
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="rounded-lg border bg-background/60 p-1.5">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                            {campaign.name}
                          </h3>
                          <p className="truncate text-xs text-muted-foreground">{campaign.segment}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 gap-1", statusConfig.className)}>
                        {statusConfig.dotClassName ? (
                          <span className={cn("size-1.5 rounded-full", statusConfig.dotClassName)} />
                        ) : null}
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-1 rounded-lg border border-border/50 bg-muted/30 py-2 text-center text-xs">
                      <Metric label={labels.campaignMetrics.sent} value={campaign.sent.toLocaleString()} />
                      <Metric
                        label={labels.campaignMetrics.openRate}
                        value={campaign.channel === "social" ? "-" : `${campaign.openRate}%`}
                      />
                      <Metric label={labels.campaignMetrics.clickRate} value={`${campaign.clickRate}%`} />
                      <Metric label={labels.campaignMetrics.conversion} value={`${campaign.conversion}%`} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className={channelClasses[campaign.channel]}>
                      <MiniSparkline data={campaign.sparkline} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {canToggle ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onToggleStatus(campaign.id)}
                          className="gap-1"
                        >
                          {campaign.status === "active" ? (
                            <Pause className="size-3" aria-hidden="true" />
                          ) : (
                            <Play className="size-3" aria-hidden="true" />
                          )}
                          <span className="hidden lg:inline">
                            {campaign.status === "active"
                              ? labels.campaignActions.pause
                              : labels.campaignActions.resume}
                          </span>
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="icon-xs" onClick={() => onPreview(campaign.id)}>
                        <BarChart3 className="size-3" aria-hidden="true" />
                        <span className="sr-only">{labels.preview}</span>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-mono text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}

function MegaphoneTitleIcon() {
  return <BarChart3 className="size-4 text-primary" aria-hidden="true" />;
}
