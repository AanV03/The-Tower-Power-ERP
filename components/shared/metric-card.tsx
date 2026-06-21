import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type MetricTone = "default" | "success" | "warning" | "danger";

const toneStyles: Record<MetricTone, string> = {
  default: "border-zinc-700 bg-zinc-800/80 text-zinc-200",
  success: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
  warning: "border-amber-400/40 bg-amber-400/15 text-amber-100",
  danger: "border-red-400/35 bg-red-400/15 text-red-100",
};

export function MetricCard({
  label,
  value,
  change,
  locale,
  tone = "default",
}: {
  label: string;
  value: string;
  change: string;
  locale: Locale;
  tone?: MetricTone;
}) {
  const dictionary = getDictionary(locale);
  const Icon =
    tone === "success" ? ArrowUpRight : tone === "danger" ? ArrowDownRight : Minus;

  return (
    <Card className="erp-card erp-metric-card">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-black tracking-normal text-white">
            {value}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-offset-2",
              toneStyles[tone],
            )}
            aria-label={formatMessage(dictionary.metricCard.changeLabel, { change })}
            role="status"
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
