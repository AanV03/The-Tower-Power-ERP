import { AlertCircle, BadgeDollarSign, Banknote, ReceiptText } from "lucide-react";

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
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";

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

function formatPeriodRange(startDate: Date, endDate: Date, locale: Locale) {
  const formatter = new Intl.DateTimeFormat({ es: "es-MX", en: "en-US", fr: "fr-FR" }[locale], {
    day: "2-digit",
    month: "short",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function formatPeriodLabel(startDate: Date, endDate: Date, locale: Locale) {
  const formatter = new Intl.DateTimeFormat({ es: "es-MX", en: "en-US", fr: "fr-FR" }[locale], {
    month: "long",
    year: "numeric",
  });

  return `${formatter.format(startDate)} · ${formatPeriodRange(startDate, endDate, locale)}`;
}

export async function PayrollDashboard({
  locale,
  selectedPeriodId,
}: {
  locale: Locale;
  selectedPeriodId?: string;
}) {
  const t = getDictionary(locale).payroll;
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
      label: index === 0 ? t.recentPeriod : formatMessage(t.period, { number: index + 1 }),
      range: formatPeriodRange(period.startDate, period.endDate, locale),
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
          employeeEmail: item.employee.email ?? t.noEmail,
          position: item.employee.position?.name ?? t.noPosition,
          branch: item.employee.branch.name,
          periodLabel: activePeriod ? formatPeriodLabel(activePeriod.startDate, activePeriod.endDate, locale) : t.noPeriod,
          periodRange: activePeriod ? formatPeriodRange(activePeriod.startDate, activePeriod.endDate, locale) : t.noRange,
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
    ? formatPeriodLabel(activePeriod.startDate, activePeriod.endDate, locale)
    : t.noActivePeriod;

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
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <ReceiptText className="size-7 text-primary" aria-hidden="true" />
            {t.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t.subtitle}
          </p>
        </div>
        <PayrollActionBar locale={locale} periods={periodViews} activePeriodId={activePeriod?.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label={t.draftPeriods} value={String(draftPeriods)} change={t.draft} locale={locale} tone="warning" />
        <MetricCard label={t.employeesIncluded} value={String(receiptViews.length)} change={t.receipts} locale={locale} tone="success" />
        <MetricCard label={t.pendingNet} value={summary.totalNetLabel} change="MXN" locale={locale} />
        <MetricCard label={t.commissions} value={summary.totalCommissionsLabel} change={t.sales} locale={locale} tone="success" />
        <MetricCard label={t.deductions} value={summary.totalDeductionsLabel} change={t.withholdings} locale={locale} />
        <MetricCard label={t.incidents} value={String(openAttendances + missingReceipts)} change={t.review} locale={locale} tone={openAttendances + missingReceipts > 0 ? "danger" : "success"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <PayrollPeriodsPanel locale={locale} periods={periodViews} activePeriodId={activePeriod?.id} />
        <PayrollItemsTable locale={locale} receipts={receiptViews} />
        <PayrollSummaryPanel locale={locale} summary={summary} />
      </div>

      {receiptViews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-4" aria-hidden="true" />
              {t.empty.noReceipts}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Banknote className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">{t.help.preview}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <BadgeDollarSign className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">{t.help.commissions}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">{t.help.incidents}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
