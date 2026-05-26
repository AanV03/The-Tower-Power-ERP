import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type MetricTone = "default" | "success" | "warning" | "danger";

const toneStyles: Record<MetricTone, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-accent text-accent-foreground",
  warning: "bg-brand-yellow text-brand-ink",
  danger: "bg-destructive text-destructive-foreground",
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
    <Card className="glass-effect">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-normal text-foreground">
            {value}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2",
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
