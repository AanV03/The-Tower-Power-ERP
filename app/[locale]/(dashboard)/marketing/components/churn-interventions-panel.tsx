"use client";

import { AlertTriangle, CheckCircle2, Clock, Dumbbell, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ChurnRisk, MarketingLabels, MarketingUiStatus, MemberAtRisk, StatusVisualConfig } from "./types";

export function ChurnInterventionsPanel({
  members,
  status,
  labels,
  riskConfig,
  onSendMessage,
  onMarkContacted,
}: {
  members: MemberAtRisk[];
  status: MarketingUiStatus;
  labels: MarketingLabels;
  riskConfig: Record<ChurnRisk, StatusVisualConfig>;
  onSendMessage: (memberId: string) => void;
  onMarkContacted: (memberId: string) => void;
}) {
  const highRiskCount = members.filter((member) => member.risk === "high").length;
  const contactedCount = members.filter((member) => member.contacted).length;
  const progress = members.length > 0 ? (contactedCount / members.length) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
            {labels.churnTitle}
          </CardTitle>
          <CardDescription>{labels.churnDescription}</CardDescription>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-xs text-red-600 dark:text-red-400">
            {highRiskCount} {labels.critical}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {contactedCount}/{members.length} {labels.contacted.toLowerCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {status === "loading" ? (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </>
        ) : null}
        {status === "error" ? (
          <EmptyState variant="error" title={labels.errorTitle} description={labels.errorDescription} />
        ) : null}
        {status !== "loading" && status !== "error" && members.length === 0 ? (
          <EmptyState title={labels.emptyAudiencesTitle} description={labels.emptyAudiencesDescription} />
        ) : null}
        {status !== "loading" &&
          status !== "error" &&
          members.map((member) => {
            const config = riskConfig[member.risk];

            return (
              <article
                key={member.id}
                className={cn(
                  "relative flex flex-col items-start justify-between gap-3 rounded-xl border border-l-4 border-border bg-card/50 p-3 transition-colors hover:bg-card sm:flex-row sm:items-center",
                  config.dotClassName,
                  member.contacted && "opacity-65",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-muted/60 p-2">
                    <Dumbbell className="size-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                      {member.contacted ? (
                        <Badge variant="outline" className="h-5 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600">
                          <CheckCircle2 className="mr-1 size-2.5" aria-hidden="true" />
                          {labels.contacted}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{member.plan}</span>
                      <span className="text-muted-foreground/60">/</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" aria-hidden="true" />
                        {member.lastVisit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <div className="text-center">
                    <p className="text-base font-extrabold tabular-nums text-foreground">{member.churnScore}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{labels.score}</p>
                  </div>
                  <Badge variant="outline" className={cn("hidden text-[10px] sm:flex", config.className)}>
                    {config.label}
                  </Badge>
                  <div className="flex gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onSendMessage(member.id)}
                      disabled={member.contacted}
                      className="h-7 gap-1 hover:border-primary hover:text-primary"
                    >
                      <MessageSquare className="size-3" aria-hidden="true" />
                      <span className="hidden sm:inline">{labels.sendIntervention}</span>
                    </Button>
                    {!member.contacted ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onMarkContacted(member.id)}
                        className="h-7 gap-1 text-emerald-600 hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                        <span className="hidden sm:inline">{labels.markContacted}</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}

        {status !== "loading" && status !== "error" && members.length > 0 ? (
          <div className="space-y-1.5 border-t border-border/50 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{labels.interventionProgress}</span>
              <span className="font-semibold text-foreground">
                {contactedCount}/{members.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
