"use client";

import { Eye, ReceiptText } from "lucide-react";

import type { PayrollReceiptView, PayrollStatusLabel } from "@/components/modules/payroll/payroll-dashboard";
import { PayrollReceiptDialog } from "@/components/modules/payroll/payroll-receipt-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDictionary, type Locale } from "@/lib/i18n";

const statusVariant: Record<PayrollStatusLabel, "default" | "secondary" | "outline"> = {
  DRAFT: "secondary",
  APPROVED: "outline",
  PAID: "default",
};

export function PayrollItemsTable({ receipts, locale }: { receipts: PayrollReceiptView[]; locale: Locale }) {
  const t = getDictionary(locale).payroll;
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <ReceiptText className="size-4" aria-hidden="true" />
          {t.panels.periodReceipts}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">{t.fields.employee}</TableHead>
                <TableHead>{t.fields.positionBranch}</TableHead>
                <TableHead className="text-right">{t.fields.base}</TableHead>
                <TableHead className="text-right">{t.fields.overtime}</TableHead>
                <TableHead className="text-right">{t.fields.commission}</TableHead>
                <TableHead className="text-right">{t.deductions}</TableHead>
                <TableHead className="text-right">{t.fields.net}</TableHead>
                <TableHead>{t.fields.status}</TableHead>
                <TableHead className="pr-6 text-right">{t.fields.action}</TableHead>
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
                    <Badge variant={statusVariant[receipt.status]}>{t.status[receipt.status]}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <PayrollReceiptDialog locale={locale} receipt={receipt}>
                      <Button type="button" variant="outline" size="sm">
                        <Eye className="size-4" aria-hidden="true" />
                        {t.actions.viewReceipt}
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
                <Badge variant={statusVariant[receipt.status]}>{t.status[receipt.status]}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t.fields.commission}</p>
                  <p className="font-medium text-foreground">{receipt.commissionLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t.fields.net}</p>
                  <p className="font-semibold text-foreground">{receipt.netLabel}</p>
                </div>
              </div>
              <PayrollReceiptDialog locale={locale} receipt={receipt}>
                <Button type="button" variant="outline" size="sm" className="w-full">
                  <Eye className="size-4" aria-hidden="true" />
                  {t.actions.viewReceipt}
                </Button>
              </PayrollReceiptDialog>
            </div>
          ))}
          {receipts.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">{t.empty.noReceiptsGenerated}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
