"use client";

import { AlertTriangle, CheckCircle2, CircleDollarSign, FileText } from "lucide-react";

import { CardGridSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AccountingMetric, AccountingUiStatus } from "./types";

const toneClass = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/15 text-emerald-600",
  warning: "bg-[var(--brand-yellow)] text-[var(--brand-ink)]",
  danger: "bg-destructive/15 text-destructive",
};

const icons = [FileText, AlertTriangle, CheckCircle2, CircleDollarSign];

export function AccountingKpiGrid({
  metrics,
  status,
  ariaLabel,
}: {
  metrics: AccountingMetric[];
  status: AccountingUiStatus;
  ariaLabel: string;
}) {
  if (status === "loading") {
    return <CardGridSkeleton count={4} columns={4} />;
  }

  return (
    <div className="erp-page-grid" aria-label={ariaLabel}>
      {metrics.map((metric, index) => {
        const Icon = icons[index] ?? FileText;

        return (
          <Card key={metric.id} className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <span className={cn("rounded-md p-1.5", toneClass[metric.tone])}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-normal text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
