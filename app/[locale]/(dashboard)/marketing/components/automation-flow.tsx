"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Clock, Mail, ShieldAlert, ArrowRight, ArrowDown } from "lucide-react";

type FlowStep = {
  id: string;
  type: "trigger" | "delay" | "action" | "condition";
  label: string;
  stats?: string;
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
  const getStepIcon = (type: FlowStep["type"]) => {
    switch (type) {
      case "trigger":
        return <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" aria-hidden="true" />;
      case "delay":
        return <Clock className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      case "action":
        return <Mail className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />;
      case "condition":
        return <ShieldAlert className="w-4 h-4 text-purple-500" aria-hidden="true" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>{translations.description}</CardDescription>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-4">
        {/* Step 1: Trigger */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.02)] min-w-[200px] justify-center shadow-xs">
            {getStepIcon("trigger")}
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Trigger</div>
              <div className="text-sm font-semibold text-foreground">{translations.steps.trigger}</div>
            </div>
          </div>
          <ArrowDown className="w-4 h-4 my-2 text-muted-foreground/50" aria-hidden="true" />
        </div>

        {/* Step 2: Delay */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.02)] min-w-[200px] justify-center shadow-xs">
            {getStepIcon("delay")}
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Delay</div>
              <div className="text-sm font-semibold text-foreground">{translations.steps.delay}</div>
            </div>
          </div>
          <ArrowDown className="w-4 h-4 my-2 text-muted-foreground/50" aria-hidden="true" />
        </div>

        {/* Step 3: Action Email */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.02)] min-w-[200px] justify-center shadow-xs">
            {getStepIcon("action")}
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Action</div>
              <div className="text-sm font-semibold text-foreground">{translations.steps.email}</div>
              <div className="text-[10px] text-emerald-500 font-medium">98.4% delivered</div>
            </div>
          </div>
          <ArrowDown className="w-4 h-4 my-2 text-muted-foreground/50" aria-hidden="true" />
        </div>

        {/* Step 4: Condition */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 min-w-[200px] justify-center shadow-xs">
            {getStepIcon("condition")}
            <div className="text-center">
              <div className="text-xs text-purple-500 uppercase font-bold tracking-wider">Condition</div>
              <div className="text-sm font-semibold text-foreground">{translations.steps.condition}</div>
            </div>
          </div>
        </div>

        {/* Yes / No branches */}
        <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-dashed border-foreground/10 pt-4">
          <div className="flex flex-col items-center">
            <div className="text-xs text-[var(--color-success)] font-semibold mb-1">Yes</div>
            <div className="p-3 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.02)] text-center text-xs w-full max-w-[140px] shadow-xs">
              <div className="font-semibold text-foreground truncate">{translations.steps.yes}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">342 {translations.stats.activeUsers}</div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-[var(--color-danger)] font-semibold mb-1">No</div>
            <div className="p-3 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.02)] text-center text-xs w-full max-w-[140px] shadow-xs">
              <div className="font-semibold text-foreground truncate">{translations.steps.no}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">744 {translations.stats.activeUsers}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
