"use client";

import { ArrowDown, Clock, Mail, ShieldAlert, Sparkles, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  AutomationBranch,
  AutomationStep,
  AutomationStepType,
  MarketingLabels,
  MarketingUiStatus,
} from "./types";

const stepStyles: Record<AutomationStepType, { icon: typeof Sparkles; className: string; labelClassName: string; pulse: string }> = {
  trigger: {
    icon: Sparkles,
    className: "border-amber-500/30 bg-amber-500/5",
    labelClassName: "text-amber-500",
    pulse: "bg-amber-500",
  },
  delay: {
    icon: Clock,
    className: "border-blue-500/30 bg-blue-500/5",
    labelClassName: "text-blue-500",
    pulse: "bg-blue-500",
  },
  action: {
    icon: Mail,
    className: "border-primary/30 bg-primary/5",
    labelClassName: "text-primary",
    pulse: "bg-primary",
  },
  condition: {
    icon: ShieldAlert,
    className: "border-violet-500/30 bg-violet-500/5",
    labelClassName: "text-violet-500",
    pulse: "bg-violet-500",
  },
};

export function AutomationFlow({
  steps,
  branches,
  status,
  labels,
}: {
  steps: AutomationStep[];
  branches: AutomationBranch[];
  status: MarketingUiStatus;
  labels: MarketingLabels;
}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{labels.automationTitle}</CardTitle>
          <CardDescription>{labels.automationDescription}</CardDescription>
        </div>
        <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {labels.live}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-0 py-2">
        {status === "loading" ? (
          <div className="grid w-full gap-3">
            <Skeleton className="mx-auto h-16 w-full max-w-sm rounded-xl" />
            <Skeleton className="mx-auto h-16 w-full max-w-sm rounded-xl" />
            <Skeleton className="mx-auto h-16 w-full max-w-sm rounded-xl" />
          </div>
        ) : null}
        {status === "error" ? (
          <EmptyState variant="error" title={labels.errorTitle} description={labels.errorDescription} />
        ) : null}
        {status !== "loading" && status !== "error" && steps.length === 0 ? (
          <EmptyState title={labels.emptyAutomationTitle} description={labels.emptyAutomationDescription} />
        ) : null}
        {status !== "loading" &&
          status !== "error" &&
          steps.map((step, index) => {
            const styles = stepStyles[step.type];
            const Icon = styles.icon;

            return (
              <div key={step.id} className="flex w-full flex-col items-center">
                <div className={cn("relative flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-xs", styles.className)}>
                  <div className="relative shrink-0">
                    <div className={cn("absolute inset-0 rounded-full opacity-20", styles.pulse)} />
                    <div className={cn("relative rounded-lg border p-1.5", styles.className)}>
                      <Icon className={cn("size-4", styles.labelClassName)} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[10px] font-bold uppercase tracking-wider", styles.labelClassName)}>
                      {step.label}
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">{step.subLabel}</div>
                    {step.delivered ? <div className="text-[10px] font-medium text-emerald-500">{step.delivered}</div> : null}
                  </div>
                  {step.activeUsers !== undefined ? (
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3" aria-hidden="true" />
                      <span className="font-semibold tabular-nums text-foreground">{step.activeUsers.toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>
                {index < steps.length - 1 ? <ArrowDown className="my-2 size-4 text-muted-foreground/40" aria-hidden="true" /> : null}
              </div>
            );
          })}

        {status !== "loading" && status !== "error" && branches.length > 0 ? (
          <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-4 border-t border-dashed border-border/60 pt-4">
            {branches.map((branch) => (
              <div key={branch.id} className="flex flex-col items-center gap-1.5">
                <span className={cn("text-xs font-bold", branch.tone === "success" ? "text-emerald-500" : "text-red-500")}>
                  {branch.label}
                </span>
                <div
                  className={cn(
                    "w-full rounded-xl border p-3 text-center text-xs shadow-xs",
                    branch.tone === "success"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5",
                  )}
                >
                  <div className="truncate font-semibold text-foreground">{branch.action}</div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="size-2.5" aria-hidden="true" />
                    {branch.activeUsers.toLocaleString()} {labels.activeUsers}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
