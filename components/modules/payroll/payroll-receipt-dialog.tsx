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
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";

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
  locale,
  receipt,
  children,
}: {
  locale: Locale;
  receipt: PayrollReceiptView;
  children: ReactElement;
}) {
  const t = getDictionary(locale).payroll;
  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <WalletCards className="size-5 text-muted-foreground" aria-hidden="true" />
            <Badge variant={statusVariant[receipt.status]}>{t.status[receipt.status]}</Badge>
          </div>
          <DialogTitle className="text-xl">{t.receipt.title}</DialogTitle>
          <DialogDescription>
            {receipt.employeeName} · {receipt.periodLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">{t.fields.collaborator}</p>
            <p className="mt-2 font-medium text-foreground">{receipt.employeeName}</p>
            <p className="text-sm text-muted-foreground">{receipt.position}</p>
            <p className="text-sm text-muted-foreground">{receipt.branch}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">{t.fields.period}</p>
            <p className="mt-2 font-medium text-foreground">{receipt.periodRange}</p>
            <p className="text-sm text-muted-foreground">{formatMessage(t.receipt.status, { status: t.status[receipt.status] })}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <BreakdownRow label={t.fields.base} value={receipt.baseLabel} />
          <BreakdownRow label={t.fields.overtime} value={receipt.overtimeLabel} />
          <BreakdownRow label={t.fields.commission} value={receipt.commissionLabel} />
          <BreakdownRow label={t.deductions} value={`-${receipt.deductionsLabel}`} />
          <div className="mt-2 border-t border-border pt-2">
            <BreakdownRow label={t.receipt.netPay} value={receipt.netLabel} strong />
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          {t.receipt.note}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled>
            <Download className="size-4" aria-hidden="true" />
            {t.actions.export}
          </Button>
          <Button type="button" variant="outline" disabled>
            <CheckCircle className="size-4" aria-hidden="true" />
            {t.actions.approve}
          </Button>
          <Button type="button" disabled>
            <FileText className="size-4" aria-hidden="true" />
            {t.actions.markPaid}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
