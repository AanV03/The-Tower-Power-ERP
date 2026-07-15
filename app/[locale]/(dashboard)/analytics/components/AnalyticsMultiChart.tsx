"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NoDataEmpty, ErrorEmpty } from "@/components/empty-state";
import { ChartSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsChartPoint, AnalyticsLabels, AnalyticsUiStatus } from "./types";

export function AnalyticsMultiChart({
  data,
  status,
  labels,
}: {
  data: AnalyticsChartPoint[];
  status: AnalyticsUiStatus;
  labels: AnalyticsLabels;
}) {
  return (
    <Card className="glass-effect min-h-[400px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">{labels.charts.mainTitle}</CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          {labels.charts.mainDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? <ChartSkeleton /> : null}
        {status === "error" ? (
          <div className="flex min-h-72 items-center justify-center">
            <ErrorEmpty title={labels.error.title} description={labels.error.description} />
          </div>
        ) : null}
        {status !== "loading" && status !== "error" && data.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center">
            <NoDataEmpty title={labels.empty.overviewTitle} description={labels.empty.overviewDescription} />
          </div>
        ) : null}
        {status !== "loading" && status !== "error" && data.length > 0 ? (
          <div className="h-72 w-full" role="img" aria-label={labels.charts.mainTitle}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ left: -16, right: 8, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRetentionArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-green)" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="var(--brand-green)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--text-muted)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--text-muted)" domain={[0, 100]} unit="%" />
                <Tooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                    boxShadow: "var(--glass-shadow)",
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                <Area
                  name={labels.charts.retention}
                  type="monotone"
                  dataKey="retention"
                  stroke="var(--brand-green)"
                  strokeWidth={2.5}
                  fill="url(#analyticsRetentionArea)"
                  activeDot={{ r: 6 }}
                />
                <Line
                  name={labels.charts.churn}
                  type="monotone"
                  dataKey="churn"
                  stroke="var(--brand-red)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
