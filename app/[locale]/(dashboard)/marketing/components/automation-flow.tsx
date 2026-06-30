"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Mail, ShieldAlert, ArrowDown, Users } from "lucide-react";

type FlowStep = {
  id: string;
  type: "trigger" | "delay" | "action" | "condition";
  label: string;
  activeUsers?: number;
  subLabel?: string;
  delivered?: string;
};

export function AutomationFlow({
  translations,
}: {
  translations: {
    title: string;
    description: string;
    steps: {
      trigger: string;
      delay: string;
      email: string;
      condition: string;
      yes: string;
      no: string;
    };
    stats: {
      activeUsers: string;
    };
  };
}) {
  const steps: FlowStep[] = [
    { id: "trigger", type: "trigger", label: "Trigger", activeUsers: 1086, subLabel: translations.steps.trigger },
    { id: "delay", type: "delay", label: "Delay", activeUsers: 892, subLabel: translations.steps.delay },
    { id: "action", type: "action", label: "Action", activeUsers: 756, subLabel: translations.steps.email, delivered: "98.4% entregados" },
    { id: "condition", type: "condition", label: "Condition", activeUsers: 420, subLabel: translations.steps.condition },
  ];

  const getStepStyles = (type: FlowStep["type"]) => {
    switch (type) {
      case "trigger":
        return {
          icon: <Sparkles className="size-4 text-amber-500" aria-hidden="true" />,
          border: "border-amber-500/30 bg-amber-500/5",
          labelColor: "text-amber-500",
          pulse: "bg-amber-500",
        };
      case "delay":
        return {
          icon: <Clock className="size-4 text-blue-500" aria-hidden="true" />,
          border: "border-blue-500/30 bg-blue-500/5",
          labelColor: "text-blue-500",
          pulse: "bg-blue-500",
        };
      case "action":
        return {
          icon: <Mail className="size-4 text-primary" aria-hidden="true" />,
          border: "border-primary/30 bg-primary/5",
          labelColor: "text-primary",
          pulse: "bg-primary",
        };
      case "condition":
        return {
          icon: <ShieldAlert className="size-4 text-purple-500" aria-hidden="true" />,
          border: "border-purple-500/30 bg-purple-500/5",
          labelColor: "text-purple-500",
          pulse: "bg-purple-500",
        };
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>{translations.description}</CardDescription>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 gap-1.5 select-none">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-2 gap-0">
        {steps.map((step, idx) => {
          const styles = getStepStyles(step.type);
          return (
            <div key={step.id} className="flex flex-col items-center w-full">
              {/* Step node */}
              <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border w-full max-w-[340px] ${styles.border} shadow-xs`}
              >
                {/* Pulsing active indicator */}
                <div className="relative shrink-0">
                  <div className={`absolute inset-0 rounded-full ${styles.pulse} opacity-20 animate-ping`} />
                  <div className={`relative p-1.5 rounded-lg ${styles.border}`}>
                    {styles.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${styles.labelColor}`}>
                    {step.label}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">{step.subLabel}</div>
                  {step.delivered && (
                    <div className="text-[10px] text-emerald-500 font-medium">{step.delivered}</div>
                  )}
                </div>

                {/* Active users count */}
                {step.activeUsers !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Users className="size-3" />
                    <span className="tabular-nums font-semibold text-foreground">{step.activeUsers.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Arrow connector (except after last) */}
              {idx < steps.length - 1 && (
                <ArrowDown className="size-4 my-2 text-muted-foreground/40" aria-hidden="true" />
              )}
            </div>
          );
        })}

        {/* Yes / No branches */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-[340px] mt-4 border-t border-dashed border-border/40 pt-4">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-emerald-500 font-bold">✓ Sí — Abrió</span>
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center text-xs w-full shadow-xs">
              <div className="font-semibold text-foreground truncate">{translations.steps.yes}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                <Users className="size-2.5" />
                342 {translations.stats.activeUsers}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-red-500 font-bold">✗ No — Ignoró</span>
            <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-xs w-full shadow-xs">
              <div className="font-semibold text-foreground truncate">{translations.steps.no}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                <Users className="size-2.5" />
                744 {translations.stats.activeUsers}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
