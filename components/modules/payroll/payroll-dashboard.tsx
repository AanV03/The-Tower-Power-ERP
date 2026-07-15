import { AlertCircle, BadgeDollarSign, Banknote, CheckCircle2, ReceiptText } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { payrollLabels } from "@/components/modules/payroll/config";
import { getPayrollReadiness } from "@/components/modules/payroll/demo-controller";
import { PayrollActionBar } from "@/components/modules/payroll/payroll-action-bar";
import { PayrollItemsTable } from "@/components/modules/payroll/payroll-items-table";
import { PayrollPeriodsPanel } from "@/components/modules/payroll/payroll-periods-panel";
import { PayrollSummaryPanel } from "@/components/modules/payroll/payroll-summary-panel";
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

function formatPeriodLabel(startDate: Date, endDate: Date) {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  });

  return `${formatter.format(startDate)} / ${formatPeriodRange(startDate, endDate)}`;
}

export async function PayrollDashboard({
  locale,
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
        <PayrollActionBar periods={periodViews} activePeriodId={activePeriod?.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label={payrollLabels.metrics.draftPeriods} value={String(draftPeriods)} change="Draft" locale={locale} tone="warning" />
        <MetricCard label={payrollLabels.metrics.includedEmployees} value={String(receiptViews.length)} change="Recibos" locale={locale} tone="success" />
        <MetricCard label={payrollLabels.metrics.pendingNet} value={summary.totalNetLabel} change="MXN" locale={locale} />
        <MetricCard label={payrollLabels.metrics.commissions} value={summary.totalCommissionsLabel} change="Ventas" locale={locale} tone="success" />
        <MetricCard label={payrollLabels.metrics.deductions} value={summary.totalDeductionsLabel} change="Retenciones" locale={locale} />
        <MetricCard
          label={payrollLabels.metrics.incidents}
          value={String(readiness.incidentCount)}
          change={readiness.canApprove ? payrollLabels.summary.ready : payrollLabels.summary.review}
          locale={locale}
          tone={readiness.severity === "danger" ? "danger" : readiness.severity === "success" ? "success" : "warning"}
        />
      </div>

      <Card className={readiness.canApprove ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {readiness.canApprove ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {readiness.canApprove ? "Periodo listo para aprobacion" : "Periodo con pendientes antes del cierre"}
              </p>
              <p className="text-sm text-muted-foreground">
                {readiness.canApprove
                  ? "Los recibos estan generados y no hay incidencias abiertas para este corte."
                  : "Revisa asistencias abiertas, empleados sin recibo y periodos en borrador antes de aprobar."}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-sm">
            <span className="font-semibold text-foreground">{summary.activePeriodLabel}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <PayrollPeriodsPanel periods={periodViews} activePeriodId={activePeriod?.id} />
        <PayrollItemsTable receipts={receiptViews} />
        <PayrollSummaryPanel summary={summary} readiness={readiness} />
      </div>

      {receiptViews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-4" aria-hidden="true" />
              {payrollLabels.receipts.emptyTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Banknote className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Genera una vista previa cuando el calculo este disponible.</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <BadgeDollarSign className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Las comisiones se mostraran desde los recibos existentes.</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Las incidencias quedan visibles antes del cierre.</span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
