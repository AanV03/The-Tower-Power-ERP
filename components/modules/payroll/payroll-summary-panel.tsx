import { AlertTriangle, CheckCircle2, Sigma } from "lucide-react";

import type { PayrollSummaryView } from "@/components/modules/payroll/payroll-dashboard";
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

export function PayrollSummaryPanel({ summary }: { summary: PayrollSummaryView }) {
  const hasAlerts = summary.missingReceipts > 0 || summary.openAttendances > 0 || summary.draftPeriods > 0;

  return (
    <Card className="h-fit">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sigma className="size-4" aria-hidden="true" />
          Resumen de cierre
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <SummaryLine label="Base" value={summary.totalBaseLabel} />
          <SummaryLine label="Horas extra" value={summary.totalOvertimeLabel} />
          <SummaryLine label="Comisiones" value={summary.totalCommissionsLabel} />
          <SummaryLine label="Deducciones" value={summary.totalDeductionsLabel} />
          <div className="border-t border-border pt-3">
            <SummaryLine label="Neto total" value={summary.totalNetLabel} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-3">
            <span className="flex items-center gap-2 text-sm text-foreground">
              {hasAlerts ? <AlertTriangle className="size-4 text-destructive" aria-hidden="true" /> : <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />}
              Alertas
            </span>
            <Badge variant={hasAlerts ? "destructive" : "secondary"}>{hasAlerts ? "Revisar" : "Listo"}</Badge>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-3">
              <span>Empleados sin recibo</span>
              <span>{summary.missingReceipts}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Asistencias abiertas</span>
              <span>{summary.openAttendances}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Periodos en borrador</span>
              <span>{summary.draftPeriods}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Button type="button" disabled>
            Aprobar periodo
          </Button>
          <Button type="button" variant="outline" disabled>
            Enviar a pagos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
