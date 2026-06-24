"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, TrendingDown, Send } from "lucide-react";

type Segment = {
  key: "churn" | "spenders" | "inactive" | "newSignups";
  name: string;
  count: number;
  growth: string;
  positive: boolean;
};

export function AudienceSegments({
  translations,
  onSendToSegment,
}: {
  translations: {
    title: string;
    description: string;
    members: string;
    actions: {
      send: string;
    };
    names: {
      churn: string;
      spenders: string;
      inactive: string;
      newSignups: string;
    };
  };
  onSendToSegment: (segmentName: string) => void;
}) {
  const segments: Segment[] = [
    {
      key: "churn",
      name: translations.names.churn,
      count: 312,
      growth: "+1.2%",
      positive: false,
    },
    {
      key: "spenders",
      name: translations.names.spenders,
      count: 1420,
      growth: "+8.4%",
      positive: true,
    },
    {
      key: "inactive",
      name: translations.names.inactive,
      count: 580,
      growth: "-3.1%",
      positive: true, // Decreasing inactive is positive
    },
    {
      key: "newSignups",
      name: translations.names.newSignups,
      count: 890,
      growth: "+14.8%",
      positive: true,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <CardDescription>{translations.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="flex items-center justify-between p-3 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.01)] hover:bg-[rgba(var(--glass-bg),0.03)] transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Users className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">{segment.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-foreground">{segment.count}</span>
                  <span>{translations.members}</span>
                  <span className="flex items-center gap-0.5 font-semibold">
                    {segment.positive ? (
                      <TrendingUp className="w-3 h-3 text-[var(--color-success)]" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-[var(--color-danger)]" aria-hidden="true" />
                    )}
                    <span className={segment.positive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>
                      {segment.growth}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => onSendToSegment(segment.name)}
              className="h-7 text-xs gap-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <Send className="w-3 h-3" aria-hidden="true" />
              <span className="hidden sm:inline">{translations.actions.send}</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
