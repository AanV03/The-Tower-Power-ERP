"use client";

import { Eye, ReceiptText } from "lucide-react";

import type { PayrollReceiptView, PayrollStatusLabel } from "@/components/modules/payroll/payroll-dashboard";
import { PayrollReceiptDialog } from "@/components/modules/payroll/payroll-receipt-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export function PayrollItemsTable({ receipts }: { receipts: PayrollReceiptView[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <ReceiptText className="size-4" aria-hidden="true" />
          Recibos del periodo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Empleado</TableHead>
                <TableHead>Puesto / sucursal</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Horas extra</TableHead>
                <TableHead className="text-right">Comisión</TableHead>
                <TableHead className="text-right">Deducciones</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-6 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="pl-6">
                    <div>
                      <p className="font-medium text-foreground">{receipt.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{receipt.employeeEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{receipt.position}</p>
                      <p className="text-xs text-muted-foreground">{receipt.branch}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{receipt.baseLabel}</TableCell>
                  <TableCell className="text-right">{receipt.overtimeLabel}</TableCell>
                  <TableCell className="text-right">{receipt.commissionLabel}</TableCell>
                  <TableCell className="text-right">{receipt.deductionsLabel}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{receipt.netLabel}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[receipt.status]}>{statusLabel[receipt.status]}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <PayrollReceiptDialog receipt={receipt}>
                      <Button type="button" variant="outline" size="sm">
                        <Eye className="size-4" aria-hidden="true" />
                        Ver recibo
                      </Button>
                    </PayrollReceiptDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y divide-border lg:hidden">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{receipt.employeeName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {receipt.position} · {receipt.branch}
                  </p>
                </div>
                <Badge variant={statusVariant[receipt.status]}>{statusLabel[receipt.status]}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Comisión</p>
                  <p className="font-medium text-foreground">{receipt.commissionLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Neto</p>
                  <p className="font-semibold text-foreground">{receipt.netLabel}</p>
                </div>
              </div>
              <PayrollReceiptDialog receipt={receipt}>
                <Button type="button" variant="outline" size="sm" className="w-full">
                  <Eye className="size-4" aria-hidden="true" />
                  Ver recibo
                </Button>
              </PayrollReceiptDialog>
            </div>
          ))}
          {receipts.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Sin recibos generados para mostrar.</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
