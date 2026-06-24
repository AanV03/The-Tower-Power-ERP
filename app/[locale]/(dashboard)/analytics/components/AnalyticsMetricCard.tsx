"use client";

import { ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp, TrendingDown, Users, Network, Percent } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ChartArea = Area as unknown as ComponentType<any>;

type MetricTone = "default" | "success" | "warning" | "danger";

const toneStyles: Record<MetricTone, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  danger: "bg-destructive/10 text-destructive dark:text-destructive-foreground border border-destructive/20",
};

const toneColors: Record<MetricTone, string> = {
  default: "var(--brand-orange)",
  success: "var(--brand-green)",
  warning: "var(--brand-yellow)",
  danger: "var(--brand-red)",
};

const metricIcons: Record<string, any> = {
  branches: Network,
  audience: Users,
  retention: Percent,
  churn: Percent,
};

type AnalyticsMetricCardProps = {
  metricKey: string;
  label: string;
  value: string;
  change: string;
  locale: Locale;
  tone?: MetricTone;
  sparklineData?: { value: number }[];
  isDoubleWidth?: boolean;
};

export function AnalyticsMetricCard({
  metricKey,
  label,
  value,
  change,
  locale,
  tone = "default",
  sparklineData,
  isDoubleWidth = false,
}: AnalyticsMetricCardProps) {
  const dictionary = getDictionary(locale);
  
  const StatusIcon = tone === "success" ? ArrowUpRight : tone === "danger" ? ArrowDownRight : Minus;
  const MetricIcon = metricIcons[metricKey] || TrendingUp;

  // Visual highlights for sparkline gradient
  const sparkColor = toneColors[tone];

  return (
    <Card 
      className={cn(
        "glass-effect overflow-hidden",
        isDoubleWidth ? "lg:col-span-2" : "col-span-1"
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[148px]">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className="p-1.5 rounded-lg bg-muted/30 text-muted-foreground">
              <MetricIcon className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* Value and Trend */}
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                toneStyles[tone]
              )}
              aria-label={formatMessage(dictionary.metricCard.changeLabel, { change })}
              role="status"
            >
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{change}</span>
            </span>
          </div>
        </div>

        {/* Sparkline Visualisation */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-10 w-full mt-4 -mx-5 -mb-5 overflow-hidden" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparkColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <ChartArea
                  type="monotone"
                  dataKey="value"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  fill={`url(#gradient-${metricKey})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
