"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Eye, ReceiptText, Search } from "lucide-react";

import { payrollLabels, payrollStatusOptions, payrollStatusVariant } from "@/components/modules/payroll/config";
import { filterPayrollReceipts } from "@/components/modules/payroll/demo-controller";
import { PayrollReceiptDialog } from "@/components/modules/payroll/payroll-receipt-dialog";
import type {
  PayrollPeriodView,
  PayrollReceiptFilters,
  PayrollReceiptView,
  PayrollStatusLabel,
} from "@/components/modules/payroll/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PayrollItemsTable({
  receipts,
  periods,
  activePeriodId,
}: {
  receipts: PayrollReceiptView[];
  periods: PayrollPeriodView[];
  activePeriodId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<PayrollReceiptFilters>({
    query: "",
    branch: "",
    status: "all",
  });
  const visibleReceipts = useMemo(() => filterPayrollReceipts(receipts, filters), [filters, receipts]);

  function handlePeriodChange(periodId: string) {
    if (!periodId) return;

    const href = `${pathname}?payrollPeriodId=${encodeURIComponent(periodId)}` as Parameters<typeof router.replace>[0];
    router.replace(href, { scroll: false });
  }

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="size-4" aria-hidden="true" />
              {payrollLabels.receipts.title}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{payrollLabels.receipts.description}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_minmax(150px,0.7fr)_150px] lg:min-w-[580px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                placeholder={payrollLabels.filters.searchPlaceholder}
                className="pl-8"
              />
            </div>
            <NativeSelect
              value={activePeriodId ?? ""}
              onChange={(event) => handlePeriodChange(event.target.value)}
              disabled={periods.length === 0}
              aria-label="Periodo de nomina"
            >
              {periods.length > 0 ? (
                periods.map((period) => (
                  <NativeSelectOption key={period.id} value={period.id}>
                    {period.range}
                  </NativeSelectOption>
                ))
              ) : (
                <NativeSelectOption value="">Sin periodos</NativeSelectOption>
              )}
            </NativeSelect>
            <NativeSelect
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value as PayrollStatusLabel | "all" })
              }
              aria-label={payrollLabels.filters.status}
            >
              {payrollStatusOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {visibleReceipts.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">{payrollLabels.receipts.employee}</TableHead>
                    <TableHead>{payrollLabels.filters.branch}</TableHead>
                    <TableHead className="text-right">{payrollLabels.receipts.net}</TableHead>
                    <TableHead>{payrollLabels.receipts.status}</TableHead>
                    <TableHead className="pr-6 text-right">{payrollLabels.receipts.action}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="pl-6">
                        <div>
                          <p className="font-medium text-foreground">{receipt.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {receipt.sourceLabel ?? "Empleado"} / {receipt.employeeEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">{receipt.branch}</p>
                          <p className="text-xs text-muted-foreground">{receipt.position}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">{receipt.netLabel}</TableCell>
                      <TableCell>
                        <Badge variant={payrollStatusVariant[receipt.status]}>{payrollLabels.status[receipt.status]}</Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <PayrollReceiptDialog receipt={receipt}>
                          <Button type="button" variant="outline" size="sm">
                            <Eye className="size-4" aria-hidden="true" />
                            {payrollLabels.actions.viewReceipt}
                          </Button>
                        </PayrollReceiptDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-border lg:hidden">
              {visibleReceipts.map((receipt) => (
                <div key={receipt.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{receipt.employeeName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {receipt.sourceLabel ?? "Empleado"} / {receipt.position} / {receipt.branch}
                      </p>
                    </div>
                    <Badge variant={payrollStatusVariant[receipt.status]}>{payrollLabels.status[receipt.status]}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Amount label={payrollLabels.receipts.commission} value={receipt.commissionLabel} />
                    <Amount label={payrollLabels.receipts.net} value={receipt.netLabel} align="right" strong />
                  </div>
                  <PayrollReceiptDialog receipt={receipt}>
                    <Button type="button" variant="outline" size="sm" className="w-full">
                      <Eye className="size-4" aria-hidden="true" />
                      {payrollLabels.actions.viewReceipt}
                    </Button>
                  </PayrollReceiptDialog>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <ReceiptText className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium text-foreground">{payrollLabels.receipts.emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{payrollLabels.receipts.emptyDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Amount({
  label,
  value,
  align = "left",
  strong = false,
}: {
  label: string;
  value: string;
  align?: "left" | "right";
  strong?: boolean;
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={strong ? "font-semibold text-foreground" : "font-medium text-foreground"}>{value}</p>
    </div>
  );
}
