import { AlertCircle, BadgeDollarSign, Banknote, CalendarDays, ReceiptText } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollActionBar } from "@/components/modules/payroll/payroll-action-bar";
import { PayrollItemsTable } from "@/components/modules/payroll/payroll-items-table";
import { PayrollPeriodsPanel } from "@/components/modules/payroll/payroll-periods-panel";
import { PayrollSummaryPanel } from "@/components/modules/payroll/payroll-summary-panel";
import { requireApiContext } from "@/lib/api/context";
import { formatCurrency } from "@/lib/api/pagination";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_TIME_ZONE, getDayBoundsForTimeZone } from "@/lib/date/timezone";
import type { Locale } from "@/lib/i18n";

export type PayrollStatusLabel = "DRAFT" | "APPROVED" | "PAID";

export type PayrollPeriodView = {
  id: string;
  label: string;
  range: string;
  status: PayrollStatusLabel;
  employeeCount: number;
  netTotal: number;
  netTotalLabel: string;
};

export type PayrollReceiptView = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  position: string;
  branch: string;
  periodLabel: string;
  periodRange: string;
  status: PayrollStatusLabel;
  base: number;
  overtime: number;
  commission: number;
  deductions: number;
  net: number;
  baseLabel: string;
  overtimeLabel: string;
  commissionLabel: string;
  deductionsLabel: string;
  netLabel: string;
};

export type PayrollSummaryView = {
  activePeriodLabel: string;
  totalBaseLabel: string;
  totalOvertimeLabel: string;
  totalCommissionsLabel: string;
  totalDeductionsLabel: string;
  totalNetLabel: string;
  missingReceipts: number;
  openAttendances: number;
  draftPeriods: number;
};

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

  return `${formatter.format(startDate)} · ${formatPeriodRange(startDate, endDate)}`;
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
            endsWith: "@gerpy.demo",
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

  const activePeriod = periods.find((period) => period.id === selectedPeriodId) ?? periods.find((period) => period.status === "DRAFT") ?? periods[0];
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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span>{activePeriodLabel}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            Nómina y comisiones
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Recibos, comisiones, deducciones y cierre operativo del periodo.
          </p>
        </div>
        <PayrollActionBar periods={periodViews} activePeriodId={activePeriod?.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label="Periodos borrador" value={String(draftPeriods)} change="Draft" locale={locale} tone="warning" />
        <MetricCard label="Empleados incluidos" value={String(receiptViews.length)} change="Recibos" locale={locale} tone="success" />
        <MetricCard label="Neto pendiente" value={summary.totalNetLabel} change="MXN" locale={locale} />
        <MetricCard label="Comisiones" value={summary.totalCommissionsLabel} change="Ventas" locale={locale} tone="success" />
        <MetricCard label="Deducciones" value={summary.totalDeductionsLabel} change="Retenciones" locale={locale} />
        <MetricCard label="Incidencias" value={String(openAttendances + missingReceipts)} change="Revisar" locale={locale} tone={openAttendances + missingReceipts > 0 ? "danger" : "success"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <PayrollPeriodsPanel periods={periodViews} activePeriodId={activePeriod?.id} />
        <PayrollItemsTable receipts={receiptViews} />
        <PayrollSummaryPanel summary={summary} />
      </div>

      {receiptViews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-4" aria-hidden="true" />
              Sin recibos para el periodo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Banknote className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Genera una vista previa cuando el backend de cálculo esté disponible.</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <BadgeDollarSign className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Las comisiones se mostrarán desde los recibos existentes.</span>
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
