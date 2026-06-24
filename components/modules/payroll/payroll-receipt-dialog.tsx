"use client";

import type { ReactElement } from "react";
import { CheckCircle, Download, FileText, WalletCards } from "lucide-react";

import type { PayrollReceiptView, PayrollStatusLabel } from "@/components/modules/payroll/payroll-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusLabel: Record<PayrollStatusLabel, string> = {
  DRAFT: "Borrador",
  APPROVED: "Aprobado",
  PAID: "Pagado",
};

const statusVariant: Record<PayrollStatusLabel, "default" | "secondary" | "outline"> = {
  DRAFT: "secondary",
  APPROVED: "outline",
  PAID: "default",
};

function BreakdownRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "text-base font-semibold text-foreground" : "font-medium text-foreground"}>{value}</span>
    </div>
  );
}

export function PayrollReceiptDialog({
  receipt,
  children,
}: {
  receipt: PayrollReceiptView;
  children: ReactElement;
}) {
  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <WalletCards className="size-5 text-muted-foreground" aria-hidden="true" />
            <Badge variant={statusVariant[receipt.status]}>{statusLabel[receipt.status]}</Badge>
          </div>
          <DialogTitle className="text-xl">Recibo de nómina</DialogTitle>
          <DialogDescription>
            {receipt.employeeName} · {receipt.periodLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Colaborador</p>
            <p className="mt-2 font-medium text-foreground">{receipt.employeeName}</p>
            <p className="text-sm text-muted-foreground">{receipt.position}</p>
            <p className="text-sm text-muted-foreground">{receipt.branch}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Periodo</p>
            <p className="mt-2 font-medium text-foreground">{receipt.periodRange}</p>
            <p className="text-sm text-muted-foreground">Estatus: {statusLabel[receipt.status]}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <BreakdownRow label="Base" value={receipt.baseLabel} />
          <BreakdownRow label="Horas extra" value={receipt.overtimeLabel} />
          <BreakdownRow label="Comisión" value={receipt.commissionLabel} />
          <BreakdownRow label="Deducciones" value={`-${receipt.deductionsLabel}`} />
          <div className="mt-2 border-t border-border pt-2">
            <BreakdownRow label="Neto a pagar" value={receipt.netLabel} strong />
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Contrato aplicado, asistencia relacionada y notas de incidencia quedan listos para conectarse cuando exista el flujo de cálculo.
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled>
            <Download className="size-4" aria-hidden="true" />
            Exportar
          </Button>
          <Button type="button" variant="outline" disabled>
            <CheckCircle className="size-4" aria-hidden="true" />
            Aprobar
          </Button>
          <Button type="button" disabled>
            <FileText className="size-4" aria-hidden="true" />
            Marcar pagado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
