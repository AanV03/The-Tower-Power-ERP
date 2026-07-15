"use client";

import { ArrowDown, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FunnelStage, MarketingLabels, MarketingUiStatus } from "./types";

const barColors = [
  { bg: "bg-[var(--chart-4)]", text: "text-[var(--chart-4)]" },
  { bg: "bg-[var(--chart-5)]", text: "text-[var(--chart-5)]" },
  { bg: "bg-[var(--chart-2)]", text: "text-[var(--chart-2)]" },
  { bg: "bg-[var(--chart-3)]", text: "text-[var(--chart-3)]" },
];

export function ConversionFunnel({
  stages,
  status,
  labels,
}: {
  stages: FunnelStage[];
  status: MarketingUiStatus;
  labels: MarketingLabels;
}) {
  const maxValue = stages[0]?.value ?? 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{labels.funnelTitle}</CardTitle>
        <CardDescription>{labels.funnelDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === "loading" ? (
          <>
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </>
        ) : null}
        {status === "error" ? (
          <EmptyState variant="error" title={labels.errorTitle} description={labels.errorDescription} />
        ) : null}
        {status !== "loading" && status !== "error" && stages.length === 0 ? (
          <EmptyState title={labels.emptyCampaignsTitle} description={labels.emptyCampaignsDescription} />
        ) : null}
        {status !== "loading" &&
          status !== "error" &&
          stages.map((stage, index) => {
            const nextStage = stages[index + 1];
            const barWidth = (stage.value / maxValue) * 100;
            const overallRate = ((stage.value / maxValue) * 100).toFixed(1);
            const stepConvRate = nextStage ? ((nextStage.value / stage.value) * 100).toFixed(1) : null;
            const stepDropoff = nextStage ? (100 - (nextStage.value / stage.value) * 100).toFixed(1) : null;
            const color = barColors[index] ?? barColors[0];

            return (
              <div key={stage.key} className="space-y-1.5">
                <div
                  className="group relative flex min-h-14 items-center overflow-hidden rounded-xl border border-border/60 bg-card/50 transition-colors hover:border-border"
                  role="group"
                  aria-label={`${stage.label}: ${stage.value}`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 rounded-xl opacity-10 transition-all duration-500 group-hover:opacity-15 ${color.bg}`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${color.bg}`} />
                  <div className="relative flex w-full items-center justify-between px-4 py-3">
                    <div className="flex flex-col pl-2">
                      <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                      <span className={`text-xs font-bold ${color.text}`}>{overallRate}%</span>
                    </div>
                    <span className="text-xl font-extrabold tabular-nums text-foreground">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>

                {nextStage && stepConvRate && stepDropoff ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 py-0.5 text-xs">
                    <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400">
                      <ArrowDown className="size-3" aria-hidden="true" />
                      <span className="font-bold">{stepConvRate}%</span>
                      <span className="text-muted-foreground">{labels.conversionRate}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-600 dark:text-red-400">
                      <TrendingDown className="size-3" aria-hidden="true" />
                      <span className="font-bold">{stepDropoff}%</span>
                      <span className="text-muted-foreground">{labels.dropoff}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
