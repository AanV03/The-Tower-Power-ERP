"use client";

import type { ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, Network, Percent, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalyticsMetric, AnalyticsMetricTone } from "./types";

const ChartArea = Area as unknown as ComponentType<{
  type: string;
  dataKey: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  dot: boolean;
}>;

const toneStyles: Record<AnalyticsMetricTone, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border border-destructive/20 bg-destructive/10 text-destructive",
};

const toneColors: Record<AnalyticsMetricTone, string> = {
  default: "var(--brand-orange)",
  success: "var(--brand-green)",
  warning: "var(--brand-yellow)",
  danger: "var(--brand-red)",
};

const metricIcons: Record<string, typeof TrendingUp> = {
  branches: Network,
  audience: Users,
  retention: Percent,
  churn: Percent,
};

export function AnalyticsMetricCard({ metric }: { metric: AnalyticsMetric }) {
  const StatusIcon = metric.tone === "success" ? ArrowUpRight : metric.tone === "danger" ? ArrowDownRight : Minus;
  const MetricIcon = metricIcons[metric.key] ?? TrendingUp;
  const sparkColor = toneColors[metric.tone];

  return (
    <Card className="glass-effect overflow-hidden">
      <CardContent className="flex min-h-36 flex-col justify-between p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {metric.label}
            </span>
            <div className="rounded-lg bg-muted/30 p-1.5 text-muted-foreground">
              <MetricIcon className="size-4" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight text-foreground">{metric.value}</p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                toneStyles[metric.tone],
              )}
              role="status"
            >
              <StatusIcon className="size-3.5" aria-hidden="true" />
              <span>{metric.change}</span>
            </span>
          </div>
        </div>

        {metric.sparkline && metric.sparkline.length > 0 ? (
          <div className="-mx-5 -mb-5 mt-4 h-10 w-full overflow-hidden" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metric.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparkColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ChartArea
                  type="monotone"
                  dataKey="value"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  fill={`url(#gradient-${metric.id})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
