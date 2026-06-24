"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function KpiCardInteractive({
  label,
  value,
  change,
  tone,
  locale,
}: {
  label: string;
  value: string | number;
  change?: number;
  tone?: string;
  locale: Locale | string;
}) {
  const [expanded, setExpanded] = useState(false);
  const dictionary = getDictionary(locale as Locale);

  return (
    <Card className="min-h-[140px] flex flex-col justify-between p-4">
      <CardHeader className="flex items-start justify-between gap-2 p-0">
        <CardTitle className="text-base font-medium">{label}</CardTitle>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {typeof change === "number" ? (
              change >= 0 ? (
                <TrendingUp className="text-green-500 w-5 h-5" />
              ) : (
                <TrendingDown className="text-red-500 w-5 h-5" />
              )
            ) : null}
            <div className="text-sm">{change ?? "–"}%</div>
            <div className="text-xs text-muted-foreground">{dictionary.common.last7Days}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setExpanded((s) => !s)}>
              {expanded ? dictionary.common.collapse : dictionary.common.drillDown}
            </Button>
            <Button size="sm" variant="ghost">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {expanded ? <div className="mt-4 text-sm text-muted-foreground">{dictionary.moduleChart.description}</div> : null}
      </CardContent>
    </Card>
  );
}
