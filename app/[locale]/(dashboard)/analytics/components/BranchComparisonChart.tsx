"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ChartSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsLabels, AnalyticsUiStatus, BranchComparisonPoint } from "./types";

type TooltipPayload = {
  name: string;
  value: number;
  fill: string;
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
      <p className="flex items-center gap-1.5 font-bold text-foreground">
        <Building2 className="size-3" aria-hidden="true" />
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: entry.fill }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-semibold tabular-nums text-foreground">
            {entry.name.includes("%") ? `${entry.value}%` : entry.name.includes("$") ? `$${entry.value}k` : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BranchComparisonChart({
  data,
  status,
  labels,
}: {
  data: BranchComparisonPoint[];
  status: AnalyticsUiStatus;
  labels: AnalyticsLabels;
}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" aria-hidden="true" />
            {labels.charts.branchTitle}
          </CardTitle>
          <CardDescription>{labels.charts.branchDescription}</CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <LegendDot className="bg-blue-500" label={labels.charts.members} />
          <LegendDot className="bg-emerald-500" label={`${labels.charts.retention} %`} />
          <LegendDot className="bg-amber-500" label={labels.charts.revenue} />
        </div>
      </CardHeader>
      <CardContent>
        {status === "loading" ? <ChartSkeleton /> : null}
        {status === "error" ? (
          <EmptyState variant="error" title={labels.error.title} description={labels.error.description} />
        ) : null}
        {status !== "loading" && status !== "error" && data.length === 0 ? (
          <EmptyState title={labels.empty.branchesTitle} description={labels.empty.branchesDescription} />
        ) : null}
        {status !== "loading" && status !== "error" && data.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="24%" barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.07} vertical={false} />
                <XAxis dataKey="branch" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", opacity: 0.04 }} />
                <Bar dataKey="members" name={labels.charts.members} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="retention" name={`${labels.charts.retention} %`} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="revenue" name={labels.charts.revenue} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block size-2 rounded-sm ${className}`} />
      {label}
    </div>
  );
}
