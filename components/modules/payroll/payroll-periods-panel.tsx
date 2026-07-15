import { CalendarRange } from "lucide-react";

import { payrollLabels, payrollStatusVariant } from "@/components/modules/payroll/config";
import type { PayrollPeriodView } from "@/components/modules/payroll/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PayrollPeriodsPanel({
  periods,
  activePeriodId,
}: {
  periods: PayrollPeriodView[];
  activePeriodId?: string;
}) {
  return (
    <Card className="h-fit">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="size-4" aria-hidden="true" />
          {payrollLabels.periods.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{payrollLabels.periods.description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {periods.length > 0 ? (
          periods.map((period) => (
            <div
              key={period.id}
              className={cn(
                "rounded-lg border border-border p-3 transition-colors",
                period.id === activePeriodId ? "bg-primary/5 ring-1 ring-primary/25" : "bg-muted/20",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{period.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{period.range}</p>
                </div>
                <Badge variant={payrollStatusVariant[period.status]}>{payrollLabels.status[period.status]}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">{payrollLabels.periods.employees}</p>
                  <p className="font-medium text-foreground">{period.employeeCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">{payrollLabels.periods.net}</p>
                  <p className="font-medium text-foreground">{period.netTotalLabel}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4">
            <p className="text-sm font-medium text-foreground">{payrollLabels.periods.emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{payrollLabels.periods.emptyDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
