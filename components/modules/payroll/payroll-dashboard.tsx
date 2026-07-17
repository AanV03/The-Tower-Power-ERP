import {
  AlertCircle,
  BadgeDollarSign,
  Banknote,
  CalendarRange,
  ReceiptText,
} from "lucide-react";

import { payrollLabels, payrollStatusVariant } from "@/components/modules/payroll/config";
import { getPayrollReadiness } from "@/components/modules/payroll/demo-controller";
import { PayrollActionBar } from "@/components/modules/payroll/payroll-action-bar";
import { PayrollItemsTable } from "@/components/modules/payroll/payroll-items-table";
import { PayrollPeriodsPanel } from "@/components/modules/payroll/payroll-periods-panel";
import { PayrollPeriodDetailPanel } from "@/components/modules/payroll/payroll-summary-panel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  PayrollPeriodView,
  PayrollReceiptView,
  PayrollStatusLabel,
  PayrollSummaryView,
} from "@/components/modules/payroll/types";
import { requireApiContext } from "@/lib/api/context";
import { formatCurrency } from "@/lib/api/pagination";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_TIME_ZONE, getDayBoundsForTimeZone } from "@/lib/date/timezone";
import type { Locale } from "@/lib/i18n";

export type { PayrollPeriodView, PayrollReceiptView, PayrollStatusLabel, PayrollSummaryView };

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  return typeof value === "number" ? value : value?.toNumber() ?? 0;
}

function formatPeriodRange(startDate: Date, endDate: Date) {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function formatPeriodLabel(startDate: Date, endDate: Date) {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  });

  return `${formatter.format(startDate)} / ${formatPeriodRange(startDate, endDate)}`;
}

function payrollSourceLabel(email: string | null) {
  return email?.startsWith("specialist-") && email.endsWith("@towerpower.demo")
    ? "Especialista / comision"
    : "Empleado";
}

export async function PayrollDashboard({
  selectedPeriodId,
}: {
  locale: Locale;
  selectedPeriodId?: string;
}) {
  const context = await requireApiContext({ moduleId: "payroll" });
  const employeeWhere = {
    tenantId: context.tenantId,
    ...(context.branchId ? { branchId: context.branchId } : {}),
  };
  const scopedBranch = context.branchId
    ? await prisma.branch.findFirst({
        where: { tenantId: context.tenantId, id: context.branchId },
        select: { timezone: true },
      })
    : null;
  const today = getDayBoundsForTimeZone(new Date(), scopedBranch?.timezone ?? DEFAULT_TIME_ZONE);

  const [periods, activeEmployees, openAttendances] = await Promise.all([
    prisma.payrollPeriod.findMany({
      where: { tenantId: context.tenantId },
      include: {
        items: {
          where: {
            tenantId: context.tenantId,
            ...(context.branchId
              ? {
                  employee: {
                    branchId: context.branchId,
                  },
                }
              : {}),
          },
          include: {
            employee: {
              include: {
                branch: true,
                position: true,
              },
            },
          },
          orderBy: {
            employee: {
              lastName: "asc",
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
      take: 8,
    }),
    prisma.employee.count({
      where: {
        ...employeeWhere,
        status: "ACTIVE",
        NOT: {
          email: {
            startsWith: "specialist-",
            endsWith: "@towerpower.demo",
          },
        },
      },
    }),
    prisma.timeClock.count({
      where: {
        tenantId: context.tenantId,
        ...(context.branchId ? { branchId: context.branchId } : {}),
        clockIn: { gte: today.start, lt: today.end },
        clockOut: null,
      },
    }),
  ]);

  const activePeriod =
    periods.find((period) => period.id === selectedPeriodId) ??
    periods.find((period) => period.status === "DRAFT") ??
    periods[0];
  const visibleItems =
    activePeriod?.items.filter((item) => !context.branchId || item.employee.branchId === context.branchId) ?? [];

  const totals = visibleItems.reduce(
    (acc, item) => {
      acc.base += toNumber(item.baseAmount);
      acc.overtime += toNumber(item.overtimeAmount);
      acc.commission += toNumber(item.commissionAmount);
      acc.deductions += toNumber(item.deductions);
      acc.net += toNumber(item.netAmount);
      return acc;
    },
    { base: 0, overtime: 0, commission: 0, deductions: 0, net: 0 },
  );

  const periodViews: PayrollPeriodView[] = periods.map((period, index) => {
    const items = period.items.filter((item) => !context.branchId || item.employee.branchId === context.branchId);
    const netTotal = items.reduce((sum, item) => sum + toNumber(item.netAmount), 0);

    return {
      id: period.id,
      label: index === 0 ? "Periodo reciente" : `Periodo ${index + 1}`,
      range: formatPeriodRange(period.startDate, period.endDate),
      startDateValue: dateInputValue(period.startDate),
      endDateValue: dateInputValue(period.endDate),
      status: period.status as PayrollStatusLabel,
      employeeCount: items.length,
      netTotal,
      netTotalLabel: formatCurrency(netTotal),
    };
  });

  const receiptViews: PayrollReceiptView[] =
    activePeriod?.items
      .filter((item) => !context.branchId || item.employee.branchId === context.branchId)
      .map((item) => {
        const base = toNumber(item.baseAmount);
        const overtime = toNumber(item.overtimeAmount);
        const commission = toNumber(item.commissionAmount);
        const deductions = toNumber(item.deductions);
        const net = toNumber(item.netAmount);

        return {
          id: item.id,
          employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
          employeeEmail: item.employee.email ?? "Sin correo",
          sourceLabel: payrollSourceLabel(item.employee.email),
          position: item.employee.position?.name ?? "Sin puesto",
          branch: item.employee.branch.name,
          periodLabel: activePeriod ? formatPeriodLabel(activePeriod.startDate, activePeriod.endDate) : "Sin periodo",
          periodRange: activePeriod ? formatPeriodRange(activePeriod.startDate, activePeriod.endDate) : "Sin rango",
          status: activePeriod?.status as PayrollStatusLabel,
          base,
          overtime,
          commission,
          deductions,
          net,
          baseLabel: formatCurrency(base),
          overtimeLabel: formatCurrency(overtime),
          commissionLabel: formatCurrency(commission),
          deductionsLabel: formatCurrency(deductions),
          netLabel: formatCurrency(net),
        };
      }) ?? [];

  const draftPeriods = periods.filter((period) => period.status === "DRAFT").length;
  const missingReceipts = Math.max(activeEmployees - receiptViews.length, 0);
  const activePeriodLabel = activePeriod
    ? formatPeriodLabel(activePeriod.startDate, activePeriod.endDate)
    : "Sin periodo activo";

  const summary: PayrollSummaryView = {
    activePeriodLabel,
    totalBaseLabel: formatCurrency(totals.base),
    totalOvertimeLabel: formatCurrency(totals.overtime),
    totalCommissionsLabel: formatCurrency(totals.commission),
    totalDeductionsLabel: formatCurrency(totals.deductions),
    totalNetLabel: formatCurrency(totals.net),
    missingReceipts,
    openAttendances,
    draftPeriods,
  };

  const readiness = getPayrollReadiness({
    receiptCount: receiptViews.length,
    missingReceipts,
    openAttendances,
    draftPeriods,
  });

  const activePeriodView = periodViews.find((period) => period.id === activePeriod?.id);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <ReceiptText className="size-7 text-primary" aria-hidden="true" />
            {payrollLabels.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {payrollLabels.subtitle}
          </p>
        </div>
        <PayrollActionBar periods={periodViews} activePeriodId={activePeriod?.id} canApprove={readiness.canApprove} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Periodo activo</p>
          <p className="mt-1 truncate text-base font-semibold text-foreground">
            {summary.activePeriodLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activePeriodView ? (
            <Badge variant={payrollStatusVariant[activePeriodView.status]}>
              {payrollLabels.status[activePeriodView.status]}
            </Badge>
          ) : null}
          <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {activePeriodView?.netTotalLabel ?? summary.totalNetLabel}
          </span>
        </div>
      </div>

      <Tabs defaultValue="periods" className="payroll-tabs space-y-4">
        <TabsList className="grid min-h-11 w-full grid-cols-2 overflow-visible rounded-lg border bg-muted/60 p-1">
          <TabsTrigger
            value="periods"
            className="h-9 gap-2 rounded-md px-3 py-2 text-sm after:hidden hover:bg-background/60 data-active:shadow-sm"
          >
            <CalendarRange className="size-4" aria-hidden="true" />
            {payrollLabels.tabs.close}
          </TabsTrigger>
          <TabsTrigger
            value="employees"
            className="h-9 gap-2 rounded-md px-3 py-2 text-sm after:hidden hover:bg-background/60 data-active:shadow-sm"
          >
            <ReceiptText className="size-4" aria-hidden="true" />
            {payrollLabels.tabs.receipts}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="mt-0">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <PayrollPeriodsPanel
              periods={periodViews}
              activePeriodId={activePeriod?.id}
              className="min-h-[420px]"
            />
            <PayrollPeriodDetailPanel
              period={activePeriodView}
              summary={summary}
              readiness={readiness}
              className="xl:sticky xl:top-4 xl:self-start"
            />
          </div>
        </TabsContent>

        <TabsContent value="employees" className="mt-0">
          <div className="space-y-4">
            <div className="space-y-4">
              <PayrollItemsTable
                receipts={receiptViews}
                periods={periodViews}
                activePeriodId={activePeriod?.id}
              />
              {receiptViews.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <ReceiptText className="size-4" aria-hidden="true" />
                    {payrollLabels.receipts.emptyTitle}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                      <Banknote className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">Genera una vista previa cuando el calculo este disponible.</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                      <BadgeDollarSign className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">Las comisiones se mostraran desde los recibos existentes.</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                      <AlertCircle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground">Las incidencias quedan visibles antes del cierre.</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
