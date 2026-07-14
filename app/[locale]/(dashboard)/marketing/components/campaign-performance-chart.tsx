"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import type { CampaignPerformancePoint, MarketingLabels, MarketingUiStatus } from "./types";

const series = [
  { key: "sent", color: "var(--chart-4)", gradient: "sentGradient" },
  { key: "opened", color: "var(--chart-3)", gradient: "openedGradient" },
  { key: "converted", color: "var(--chart-2)", gradient: "convertedGradient" },
] as const;

type TooltipPayload = {
  name: string;
  value: number;
  color: string;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-card/95 px-4 py-3 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-bold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums text-foreground">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function CampaignPerformanceChart({
  data,
  status,
  labels,
}: {
  data: CampaignPerformancePoint[];
  status: MarketingUiStatus;
  labels: MarketingLabels;
}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" aria-hidden="true" />
            {labels.performanceTitle}
          </CardTitle>
          <CardDescription>{labels.performanceDescription}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {series.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full" style={{ backgroundColor: item.color }} />
              {labels.performanceSeries[item.key]}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {status === "loading" ? <Skeleton className="h-64 w-full rounded-lg" /> : null}
        {status === "error" ? (
          <EmptyState
            variant="error"
            title={labels.errorTitle}
            description={labels.errorDescription}
            className="bg-transparent"
          />
        ) : null}
        {status !== "loading" && status !== "error" && data.length === 0 ? (
          <EmptyState title={labels.emptyCampaignsTitle} description={labels.emptyCampaignsDescription} />
        ) : null}
        {status !== "loading" && status !== "error" && data.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {series.map((item) => (
                    <linearGradient key={item.gradient} id={item.gradient} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={item.color} stopOpacity={0.24} />
                      <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.07} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => (Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value)}
                />
                <Tooltip content={<CustomTooltip />} />
                {series.map((item) => (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={labels.performanceSeries[item.key]}
                    stroke={item.color}
                    strokeWidth={2}
                    fill={`url(#${item.gradient})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
