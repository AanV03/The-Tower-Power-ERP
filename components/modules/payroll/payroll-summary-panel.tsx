import { AlertTriangle, CheckCircle2, Sigma } from "lucide-react";

import { payrollLabels } from "@/components/modules/payroll/config";
import type { PayrollReadiness, PayrollSummaryView } from "@/components/modules/payroll/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function PayrollSummaryPanel({
  summary,
  readiness,
}: {
  summary: PayrollSummaryView;
  readiness: PayrollReadiness;
}) {
  const hasAlerts = readiness.incidentCount > 0;

  return (
    <Card className="h-fit">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sigma className="size-4" aria-hidden="true" />
          {payrollLabels.summary.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <SummaryLine label={payrollLabels.summary.base} value={summary.totalBaseLabel} />
          <SummaryLine label={payrollLabels.summary.overtime} value={summary.totalOvertimeLabel} />
          <SummaryLine label={payrollLabels.summary.commissions} value={summary.totalCommissionsLabel} />
          <SummaryLine label={payrollLabels.summary.deductions} value={summary.totalDeductionsLabel} />
          <div className="border-t border-border pt-3">
            <SummaryLine label={payrollLabels.summary.netTotal} value={summary.totalNetLabel} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-3">
            <span className="flex items-center gap-2 text-sm text-foreground">
              {hasAlerts ? <AlertTriangle className="size-4 text-destructive" aria-hidden="true" /> : <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />}
              {payrollLabels.summary.alerts}
            </span>
            <Badge variant={hasAlerts ? "destructive" : "secondary"}>
              {hasAlerts ? payrollLabels.summary.review : payrollLabels.summary.ready}
            </Badge>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-3">
              <span>{payrollLabels.summary.missingReceipts}</span>
              <span>{summary.missingReceipts}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>{payrollLabels.summary.openAttendances}</span>
              <span>{summary.openAttendances}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>{payrollLabels.summary.draftPeriods}</span>
              <span>{summary.draftPeriods}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Button type="button" disabled={!readiness.canApprove}>
            {payrollLabels.actions.approve}
          </Button>
          <Button type="button" variant="outline" disabled>
            {payrollLabels.actions.pay}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
