"use client";

import { ArrowRight, Calendar, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsLabels, AnalyticsUiStatus, PeriodSnapshot } from "./types";

function DeltaBadge({ delta, isChurn }: { delta: number; isChurn: boolean }) {
  const isPositive = isChurn ? delta < 0 : delta > 0;
  const isNeutral = Math.abs(delta) < 0.5;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  }

  if (isPositive) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3" aria-hidden="true" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
      <TrendingDown className="size-3" aria-hidden="true" />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export function PeriodSnapshotPanel({
  snapshots,
  status,
  labels,
}: {
  snapshots: PeriodSnapshot[];
  status: AnalyticsUiStatus;
  labels: AnalyticsLabels;
}) {
  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    );
  }

  if (status === "error") {
    return <EmptyState variant="error" title={labels.error.title} description={labels.error.description} />;
  }

  if (snapshots.length === 0) {
    return <EmptyState title={labels.empty.reportsTitle} description={labels.empty.reportsDescription} />;
  }

  return (
    <div className="space-y-4">
      {snapshots.map((snapshot) => (
        <Card key={snapshot.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-4 text-primary" aria-hidden="true" />
                {snapshot.period}
              </CardTitle>
              <span className="rounded-full border border-border/40 bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {snapshot.range}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {snapshot.metrics.map((metric) => {
                const isChurn = metric.label.toLowerCase().includes("churn");

                return (
                  <div
                    key={metric.label}
                    className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </span>
                    <span className="text-lg font-extrabold leading-none tabular-nums text-foreground">
                      {metric.current}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs tabular-nums text-muted-foreground/60 line-through">
                        {metric.previous}
                      </span>
                      <ArrowRight className="size-2.5 text-muted-foreground/40" aria-hidden="true" />
                      <DeltaBadge delta={metric.delta} isChurn={isChurn} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
