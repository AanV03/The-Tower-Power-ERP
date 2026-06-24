"use client";

import { useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, ArrowDown } from "lucide-react";

type FunnelStage = {
  key: "leads" | "tours" | "trials" | "paid";
  label: string;
  value: number;
  color: string;
};

export function ConversionFunnel({
  translations,
}: {
  translations: {
    title: string;
    description: string;
    stages: {
      leads: string;
      tours: string;
      trials: string;
      paid: string;
    };
    conversionRate: string;
    dropoff: string;
  };
}) {
  const stages: FunnelStage[] = [
    { key: "leads", label: translations.stages.leads, value: 1086, color: "bg-[var(--color-primary)]" },
    { key: "tours", label: translations.stages.tours, value: 610, color: "bg-[var(--color-primary)]/80" },
    { key: "trials", label: translations.stages.trials, value: 420, color: "bg-[var(--color-primary)]/60" },
    { key: "paid", label: translations.stages.paid, value: 270, color: "bg-[var(--color-primary)]/40" },
  ];

  return (
    <Card className="flex-1 w-full">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <CardDescription>{translations.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-4">
        {stages.map((stage, idx) => {
          const nextStage = stages[idx + 1];
          const widthPercent = 100 - idx * 15; // Decreasing width
          const overallRate = ((stage.value / stages[0].value) * 100).toFixed(1);

          return (
            <div key={stage.key} className="w-full flex flex-col items-center">
              {/* Funnel Stage block */}
              <div
                style={{ width: `${widthPercent}%` }}
                className="group relative flex items-center justify-between px-6 py-4 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.02)] backdrop-blur-xs shadow-xs hover:border-[var(--color-primary)] hover:bg-[rgba(var(--glass-bg),0.05)] transition-all duration-300 min-h-[60px]"
                role="group"
                aria-label={`${stage.label}: ${stage.value}`}
              >
                {/* Visual fill indicator */}
                <div className="absolute inset-y-0 left-0 rounded-l-xl w-2 transition-all duration-300 group-hover:w-3" style={{ backgroundColor: `var(--color-primary)` }} />
                
                <div className="flex flex-col pl-2">
                  <span className="font-medium text-foreground">{stage.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {overallRate}% del total
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-semibold text-foreground font-mono">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Conversion/Dropoff Indicator */}
              {nextStage && (
                <div className="flex items-center gap-3 my-2 text-xs text-muted-foreground animate-fade-in">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full border border-foreground/5">
                    <ArrowDown className="w-3.5 h-3.5 text-[var(--color-success)]" aria-hidden="true" />
                    <span className="font-semibold text-foreground">
                      {((nextStage.value / stage.value) * 100).toFixed(1)}%
                    </span>
                    <span>{translations.conversionRate}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/10">
                    <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-semibold">
                      {(100 - (nextStage.value / stage.value) * 100).toFixed(1)}%
                    </span>
                    <span>{translations.dropoff}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
