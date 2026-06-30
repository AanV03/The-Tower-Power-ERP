"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, ArrowDown } from "lucide-react";

type FunnelStage = {
  key: "leads" | "tours" | "trials" | "paid";
  label: string;
  value: number;
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
    { key: "leads", label: translations.stages.leads, value: 1086 },
    { key: "tours", label: translations.stages.tours, value: 610 },
    { key: "trials", label: translations.stages.trials, value: 420 },
    { key: "paid", label: translations.stages.paid, value: 270 },
  ];

  const maxValue = stages[0].value;

  // Gradient colors for bars from rich blue → amber
  const barColors = [
    { bg: "bg-blue-500", text: "text-blue-500" },
    { bg: "bg-violet-500", text: "text-violet-500" },
    { bg: "bg-amber-500", text: "text-amber-500" },
    { bg: "bg-emerald-500", text: "text-emerald-500" },
  ];

  return (
    <Card className="flex-1 w-full">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <CardDescription>{translations.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {stages.map((stage, idx) => {
          const nextStage = stages[idx + 1];
          const barWidth = (stage.value / maxValue) * 100;
          const overallRate = ((stage.value / maxValue) * 100).toFixed(1);
          const stepConvRate = nextStage
            ? ((nextStage.value / stage.value) * 100).toFixed(1)
            : null;
          const stepDropoff = nextStage
            ? (100 - (nextStage.value / stage.value) * 100).toFixed(1)
            : null;
          const color = barColors[idx];

          return (
            <div key={stage.key} className="space-y-1.5">
              {/* Stage row */}
              <div
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/50 hover:border-border transition-all duration-300 min-h-[56px] flex items-center"
                role="group"
                aria-label={`${stage.label}: ${stage.value}`}
              >
                {/* Animated progress bar fill */}
                <div
                  className={`absolute inset-y-0 left-0 ${color.bg} opacity-10 rounded-xl transition-all duration-700 ease-out group-hover:opacity-15`}
                  style={{ width: `${barWidth}%` }}
                />
                {/* Left accent stripe */}
                <div className={`absolute inset-y-0 left-0 w-1 ${color.bg} rounded-l-xl`} />

                <div className="relative flex items-center justify-between px-4 py-3 w-full">
                  <div className="pl-2 flex flex-col">
                    <span className="font-semibold text-sm text-foreground">{stage.label}</span>
                    <span className={`text-xs font-bold ${color.text}`}>{overallRate}%</span>
                  </div>
                  <span className="text-xl font-extrabold text-foreground tabular-nums">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Conversion / dropoff indicator */}
              {nextStage && stepConvRate && stepDropoff && (
                <div className="flex items-center justify-center gap-3 py-0.5 text-xs">
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <ArrowDown className="size-3" aria-hidden="true" />
                    <span className="font-bold">{stepConvRate}%</span>
                    <span className="text-muted-foreground">{translations.conversionRate}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-500/20">
                    <TrendingDown className="size-3" aria-hidden="true" />
                    <span className="font-bold">{stepDropoff}%</span>
                    <span className="text-muted-foreground">{translations.dropoff}</span>
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
