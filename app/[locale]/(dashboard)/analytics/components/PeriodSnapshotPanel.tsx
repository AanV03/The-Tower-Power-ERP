"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowRight } from "lucide-react";

type PeriodDelta = {
  label: string;
  current: string;
  previous: string;
  delta: number; // percentage change
  unit?: string;
};

type PeriodSnapshot = {
  period: string;
  range: string;
  metrics: PeriodDelta[];
};

const SNAPSHOTS: PeriodSnapshot[] = [
  {
    period: "Este mes vs. Mes anterior",
    range: "Jun vs. May",
    metrics: [
      { label: "Nuevos miembros", current: "248", previous: "210", delta: 18.1 },
      { label: "Ingresos", current: "$134k", previous: "$118k", delta: 13.6, unit: "" },
      { label: "Retención", current: "87%", previous: "84%", delta: 3.6, unit: "%" },
      { label: "Churn", current: "4.2%", previous: "5.1%", delta: -17.6, unit: "%" },
    ],
  },
  {
    period: "Esta semana vs. Semana anterior",
    range: "Sem 26 vs. Sem 25",
    metrics: [
      { label: "Nuevos miembros", current: "62", previous: "54", delta: 14.8 },
      { label: "Ingresos", current: "$31k", previous: "$28k", delta: 10.7 },
      { label: "Retención", current: "89%", previous: "87%", delta: 2.3 },
      { label: "Churn", current: "3.8%", previous: "4.4%", delta: -13.6 },
    ],
  },
  {
    period: "Hoy vs. Ayer",
    range: "Sáb 28 vs. Vie 27",
    metrics: [
      { label: "Nuevos miembros", current: "9", previous: "11", delta: -18.2 },
      { label: "Ingresos", current: "$4.2k", previous: "$5.1k", delta: -17.6 },
      { label: "Retención", current: "91%", previous: "89%", delta: 2.2 },
      { label: "Churn", current: "3.1%", previous: "4.0%", delta: -22.5 },
    ],
  },
];

function DeltaBadge({ delta, isChurn }: { delta: number; isChurn: boolean }) {
  // For churn: negative delta is good (churn decreased)
  const isPositive = isChurn ? delta < 0 : delta > 0;
  const isNeutral = Math.abs(delta) < 0.5;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Minus className="size-3" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  }

  if (isPositive) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
      <TrendingDown className="size-3" />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export function PeriodSnapshotPanel() {
  return (
    <div className="space-y-4">
      {SNAPSHOTS.map((snapshot, idx) => (
        <Card key={idx} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                {snapshot.period}
              </CardTitle>
              <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/40">
                {snapshot.range}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {snapshot.metrics.map((metric) => {
                const isChurn = metric.label.toLowerCase().includes("churn");
                return (
                  <div
                    key={metric.label}
                    className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-foreground tabular-nums leading-none">
                        {metric.current}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground/60 tabular-nums line-through">
                        {metric.previous}
                      </span>
                      <ArrowRight className="size-2.5 text-muted-foreground/40" />
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
