import { CheckCircle, Download, FileText, Filter, Plus } from "lucide-react";

import { PayrollPeriods, type PayrollPeriodRow } from "@/components/modules/payroll/payroll-periods";
import { PayrollSummary, type PayrollSummaryData } from "@/components/modules/payroll/payroll-summary";
import { PayrollTable, type PayrollItemRow } from "@/components/modules/payroll/payroll-table";
import { BranchScopeSelector } from "@/components/shared/branch-scope-selector";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";

function formatMoney(value: unknown) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value?.toString() ?? 0));
}

function formatRange(startDate: Date, endDate: Date, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function sum(items: { toString(): string }[]) {
  return items.reduce<number>((total, item) => total + Number(item.toString()), 0);
}

export async function PayrollDashboard({ locale }: { locale: Locale }) {
  const context = await requireApiContext({ moduleId: "payroll" });
  const branchScopedEmployeeWhere = context.branchId
    ? { tenantId: context.tenantId, branchId: context.branchId }
    : { tenantId: context.tenantId };

  const [periods, activeEmployees, attendanceOpen] = await Promise.all([
    prisma.payrollPeriod.findMany({
      where: { tenantId: context.tenantId },
      include: {
        items: {
          include: { employee: { include: { position: true, branch: true } } },
        },
      },
      orderBy: { startDate: "desc" },
      take: 8,
    }),
    prisma.employee.count({ where: { ...branchScopedEmployeeWhere, status: "ACTIVE" } }),
    prisma.attendanceRecord.count({ where: { ...branchScopedEmployeeWhere, clockOut: null } }),
  ]);

  const activePeriod = periods.find((period) => period.status === "DRAFT") ?? periods[0];
  const activeItems = activePeriod?.items.filter((item) => {
    if (!context.branchId) return true;
    return item.employee.branchId === context.branchId;
  }) ?? [];

  const periodRows: PayrollPeriodRow[] = periods.map((period, index) => ({
    id: period.id,
    label: index === 0 ? "Periodo reciente" : `Periodo ${periods.length - index}`,
    range: formatRange(period.startDate, period.endDate, locale),
    status: period.status,
    employees: period.items.length,
    net: formatMoney(sum(period.items.map((item) => item.netAmount))),
  }));

  const payrollRows: PayrollItemRow[] = activeItems.map((item) => ({
    id: item.id,
    employee: `${item.employee.firstName} ${item.employee.lastName}`,
    position: item.employee.position?.name ?? item.employee.branch.name,
    base: formatMoney(item.baseAmount),
    overtime: formatMoney(item.overtimeAmount),
    commissions: formatMoney(item.commissionAmount),
    deductions: formatMoney(item.deductions),
    net: formatMoney(item.netAmount),
    status: activePeriod?.status ?? "DRAFT",
  }));

  const summary: PayrollSummaryData = {
    gross: formatMoney(sum(activeItems.map((item) => item.baseAmount))),
    overtime: formatMoney(sum(activeItems.map((item) => item.overtimeAmount))),
    commissions: formatMoney(sum(activeItems.map((item) => item.commissionAmount))),
    deductions: formatMoney(sum(activeItems.map((item) => item.deductions))),
    net: formatMoney(sum(activeItems.map((item) => item.netAmount))),
    incidents: attendanceOpen,
    activeStatus: activePeriod?.status ?? "EMPTY",
  };

  return (
    <section className="erp-section space-y-6" role="main" aria-label="Nomina y comisiones">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">Nomina y comisiones</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Periodos, recibos, variables y aprobacion operativa de pagos internos.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BranchScopeSelector locale={locale} />
          <div className="flex gap-2">
            <Button size="sm"><Plus /> Crear periodo</Button>
            <Button size="sm" variant="outline"><FileText /> Vista previa</Button>
            <Button size="icon-sm" variant="outline" aria-label="Exportar nomina"><Download /></Button>
          </div>
        </div>
      </div>

      <div className="erp-page-grid">
        <MetricCard label="Periodos borrador" value={String(periods.filter((period) => period.status === "DRAFT").length)} change="Revisar" tone="warning" locale={locale} />
        <MetricCard label="Empleados incluidos" value={String(activeItems.length || activeEmployees)} change="Periodo" locale={locale} />
        <MetricCard label="Neto pendiente" value={summary.net} change="MXN" tone="success" locale={locale} />
        <MetricCard label="Incidencias" value={String(attendanceOpen)} change="Asistencia" tone={attendanceOpen > 0 ? "warning" : "success"} locale={locale} />
      </div>

      <Card className="rounded-lg">
        <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <a href="#periodos" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Periodos</a>
            <a href="#recibos" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Recibos</a>
            <a href="#resumen" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Resumen</a>
          </div>
          <div className="flex items-center gap-2">
            <NativeSelect aria-label="Periodo visible" defaultValue={activePeriod?.id ?? "none"} size="sm">
              <option value="none">Sin periodo</option>
              {periodRows.map((period) => (
                <option key={period.id} value={period.id}>{period.range}</option>
              ))}
            </NativeSelect>
            <Button size="icon-sm" variant="outline" aria-label="Filtrar nomina"><Filter /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div id="periodos">
          <PayrollPeriods periods={periodRows} activePeriodId={activePeriod?.id} />
        </div>
        <div id="recibos">
          <PayrollTable items={payrollRows} />
        </div>
        <div id="resumen">
          <PayrollSummary summary={summary} />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <CheckCircle className="size-4" />
        Aprobacion, pago y detalle quedan bloqueados visualmente cuando aun no hay flujo backend disponible.
      </div>
    </section>
  );
}
