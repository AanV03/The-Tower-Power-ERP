import { CheckCircle, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PayrollSummaryData = {
  gross: string;
  overtime: string;
  commissions: string;
  deductions: string;
  net: string;
  incidents: number;
  activeStatus: "DRAFT" | "APPROVED" | "PAID" | "EMPTY";
};

export function PayrollSummary({ summary }: { summary: PayrollSummaryData }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Resumen</CardTitle>
            <p className="text-sm text-muted-foreground">Totales del periodo seleccionado.</p>
          </div>
          <Badge variant={summary.activeStatus === "PAID" ? "secondary" : summary.activeStatus === "APPROVED" ? "outline" : "destructive"}>
            {summary.activeStatus === "EMPTY" ? "Sin periodo" : summary.activeStatus === "PAID" ? "Pagado" : summary.activeStatus === "APPROVED" ? "Aprobado" : "Borrador"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Base</span><span className="font-medium">{summary.gross}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Horas extra</span><span className="font-medium">{summary.overtime}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Comisiones</span><span className="font-medium">{summary.commissions}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Deducciones</span><span className="font-medium">{summary.deductions}</span></div>
          <div className="flex justify-between gap-4 border-t pt-3 text-base"><span className="font-medium">Neto</span><span className="font-semibold">{summary.net}</span></div>
        </div>
        <div className="rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Incidencias</p>
          <p className="mt-1 text-2xl font-semibold">{summary.incidents}</p>
        </div>
        <div className="grid gap-2">
          <Button disabled={summary.activeStatus !== "DRAFT"}><CheckCircle /> Aprobar</Button>
          <Button variant="outline" disabled={summary.activeStatus === "EMPTY"}><FileText /> Ver detalle</Button>
        </div>
      </CardContent>
    </Card>
  );
}
