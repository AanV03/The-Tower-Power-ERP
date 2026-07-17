import { AlertTriangle, CalendarRange, CheckCircle2 } from "lucide-react";

import { payrollLabels } from "@/components/modules/payroll/config";
import type {
  PayrollPeriodView,
  PayrollReadiness,
  PayrollSummaryView,
} from "@/components/modules/payroll/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm">
      <span className="min-w-0 text-muted-foreground">{label}</span>
      <span className="shrink-0 font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function PayrollPeriodDetailPanel({
  period,
  summary,
  readiness,
  className,
}: {
  period?: PayrollPeriodView;
  summary: PayrollSummaryView;
  readiness: PayrollReadiness;
  className?: string;
}) {
  const hasAlerts = readiness.incidentCount > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="size-4 shrink-0" aria-hidden="true" />
              Detalle del periodo
            </CardTitle>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {period?.range ?? summary.activePeriodLabel}
            </p>
          </div>
          {period ? (
            <Badge className="shrink-0" variant={period.status === "DRAFT" ? "secondary" : "outline"}>
              {payrollLabels.status[period.status]}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <DetailRow label={payrollLabels.periods.employees} value={period?.employeeCount ?? 0} />
          <DetailRow label={payrollLabels.summary.base} value={summary.totalBaseLabel} />
          <DetailRow label={payrollLabels.summary.commissions} value={summary.totalCommissionsLabel} />
          <DetailRow label={payrollLabels.summary.deductions} value={summary.totalDeductionsLabel} />
          <DetailRow label={payrollLabels.summary.netTotal} value={summary.totalNetLabel} />
        </div>

        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              {hasAlerts ? (
                <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              )}
              <span className="text-sm font-semibold text-foreground">{payrollLabels.summary.alerts}</span>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {readiness.incidentCount}
            </span>
          </div>
          <div className="grid gap-2 p-3">
            <DetailRow label={payrollLabels.summary.missingReceipts} value={summary.missingReceipts} />
            <DetailRow label={payrollLabels.summary.openAttendances} value={summary.openAttendances} />
          </div>
        </div>

        <div className="grid gap-2">
          <Button type="button" className="w-full" disabled={!readiness.canApprove}>
            {payrollLabels.actions.approve}
          </Button>
          <Button type="button" className="w-full" variant="outline" disabled>
            {payrollLabels.actions.pay}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
