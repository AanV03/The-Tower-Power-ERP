import { auditTrail } from "@/data/navigation";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditFeedSkeleton } from "@/components/skeletons";
import { NoDataEmpty } from "@/components/empty-state";

export function AuditFeed({
  locale,
  isLoading = false,
}: {
  locale: Locale;
  isLoading?: boolean;
}) {
  const labels = getDictionary(locale).audit;

  if (isLoading) {
    return (
      <Card className="erp-card min-h-[342px]">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditFeedSkeleton items={4} />
        </CardContent>
      </Card>
    );
  }

  if (!auditTrail || auditTrail.length === 0) {
    return (
      <Card className="erp-card min-h-[342px]">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataEmpty title={labels.noData} description={labels.noDataDesc} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="erp-card min-h-[342px]">
      <CardHeader>
        <CardTitle className="text-white">{labels.title}</CardTitle>
        <CardDescription className="text-zinc-400">{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4" aria-label={labels.listLabel}>
          {auditTrail.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={`${item.actor}-${item.meta}-${idx}`}
                className="flex gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-amber-400/20 hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-amber-400/20 bg-amber-400/10 text-amber-300">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{item.actor}</p>
                  <p className="text-sm text-zinc-400">{item.action}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.meta}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
