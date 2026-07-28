import Link from "next/link";
import { ArrowRight, CalendarRange } from "lucide-react";

import { payrollLabels, payrollStatusVariant } from "@/components/modules/payroll/config";
import type { PayrollPeriodView } from "@/components/modules/payroll/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PayrollPeriodsPanel({
  periods,
  activePeriodId,
  className,
}: {
  periods: PayrollPeriodView[];
  activePeriodId?: string;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b border-border">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="size-4" aria-hidden="true" />
            {payrollLabels.periods.title}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{payrollLabels.periods.description}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {periods.length > 0 ? (
          <div>
            <div className="hidden border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium uppercase text-muted-foreground md:grid md:grid-cols-[minmax(180px,1fr)_120px_120px_140px_40px] md:items-center md:gap-3">
              <span>Periodo</span>
              <span>{payrollLabels.receipts.status}</span>
              <span>{payrollLabels.periods.employees}</span>
              <span className="text-right">{payrollLabels.periods.net}</span>
              <span className="sr-only">Abrir</span>
            </div>
            <div className="divide-y divide-border">
              {periods.map((period) => (
                <Link
                  key={period.id}
                  href={`?payrollPeriodId=${encodeURIComponent(period.id)}`}
                  scroll={false}
                  aria-current={period.id === activePeriodId ? "true" : undefined}
                  className={cn(
                    "block px-4 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid md:grid-cols-[minmax(180px,1fr)_120px_120px_140px_40px] md:items-center md:gap-3",
                    period.id === activePeriodId
                      ? "bg-primary/5"
                      : "bg-card hover:bg-muted/20",
                  )}
                >
                  <div className="flex items-start justify-between gap-3 md:block">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{period.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{period.range}</p>
                    </div>
                    <Badge className="md:hidden" variant={payrollStatusVariant[period.status]}>
                      {payrollLabels.status[period.status]}
                    </Badge>
                  </div>
                  <div className="hidden md:block">
                    <Badge variant={payrollStatusVariant[period.status]}>
                      {payrollLabels.status[period.status]}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:mt-0 md:block">
                    <div>
                      <p className="text-xs text-muted-foreground md:hidden">{payrollLabels.periods.employees}</p>
                      <p className="font-medium tabular-nums text-foreground">{period.employeeCount}</p>
                    </div>
                    <div className="text-right md:hidden">
                      <p className="text-xs text-muted-foreground">{payrollLabels.periods.net}</p>
                      <p className="font-medium tabular-nums text-foreground">{period.netTotalLabel}</p>
                    </div>
                  </div>
                  <div className="hidden text-right text-sm font-semibold tabular-nums text-foreground md:block">
                    {period.netTotalLabel}
                  </div>
                  <div className="hidden justify-end md:flex">
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium text-foreground">{payrollLabels.periods.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{payrollLabels.periods.emptyDescription}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
