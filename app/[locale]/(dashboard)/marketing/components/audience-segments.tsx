"use client";

import { Send, TrendingDown, TrendingUp, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AudienceSegment, MarketingLabels, MarketingUiStatus } from "./types";

export function AudienceSegments({
  segments,
  status,
  labels,
  onSendToSegment,
}: {
  segments: AudienceSegment[];
  status: MarketingUiStatus;
  labels: MarketingLabels;
  onSendToSegment: (segmentName: string) => void;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{labels.segmentsTitle}</CardTitle>
        <CardDescription>{labels.segmentsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {status === "loading" ? (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </>
        ) : null}
        {status === "error" ? (
          <EmptyState variant="error" title={labels.errorTitle} description={labels.errorDescription} className="lg:col-span-2" />
        ) : null}
        {status !== "loading" && status !== "error" && segments.length === 0 ? (
          <EmptyState
            title={labels.emptyAudiencesTitle}
            description={labels.emptyAudiencesDescription}
            className="lg:col-span-2"
          />
        ) : null}
        {status !== "loading" &&
          status !== "error" &&
          segments.map((segment) => (
            <article
              key={segment.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/50 p-3 shadow-xs transition-colors hover:bg-card"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Users className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">{segment.name}</h4>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground">{segment.count.toLocaleString()}</span>
                    <span>{labels.members}</span>
                    <span className="flex items-center gap-0.5 font-semibold">
                      {segment.positive ? (
                        <TrendingUp className="size-3 text-success" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="size-3 text-destructive" aria-hidden="true" />
                      )}
                      <span className={segment.positive ? "text-success" : "text-destructive"}>{segment.growth}</span>
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={() => onSendToSegment(segment.name)}
                className="h-7 gap-1 hover:border-primary hover:text-primary"
              >
                <Send className="size-3" aria-hidden="true" />
                <span className="hidden sm:inline">{labels.sendIntervention}</span>
              </Button>
            </article>
          ))}
      </CardContent>
    </Card>
  );
}
