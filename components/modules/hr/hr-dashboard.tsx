import { CalendarClock, Clock, Download, Plus } from "lucide-react";

import { AttendancePanel, type HrAttendanceRow } from "@/components/modules/hr/attendance-panel";
import { ContractSummary, type HrContractRow } from "@/components/modules/hr/contract-summary";
import { EmployeeFormDialog } from "@/components/modules/hr/employee-form-dialog";
import { EmployeeTable, type HrEmployeeRow } from "@/components/modules/hr/employee-table";
import { AttendanceDialog } from "@/components/modules/hr/attendance-dialog";
import { BranchScopeSelector } from "@/components/shared/branch-scope-selector";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import type { Locale } from "@/lib/i18n";


function formatDateTime(value: Date | null | undefined, locale: Locale) {
  if (!value) return "Pendiente";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatDate(value: Date | null | undefined, locale: Locale) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatMoney(value: unknown) {
  if (!value) return "Sin monto";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value.toString()));
}

export async function HrDashboard({ locale }: { locale: Locale }) {
  const context = await requireApiContext({ moduleId: "hr" });
  const branchScopedWhere = context.branchId
    ? { tenantId: context.tenantId, branchId: context.branchId }
    : { tenantId: context.tenantId };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [employees, attendanceRecords, activeEmployees, attendanceToday, openAttendance] = await Promise.all([
    prisma.employee.findMany({
      where: branchScopedWhere,
      include: {
        branch: true,
        position: true,
        contracts: { orderBy: { startDate: "desc" }, take: 1 },
        attendanceRecords: { orderBy: { clockIn: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.attendanceRecord.findMany({
      where: { ...branchScopedWhere, clockIn: { gte: today } },
      include: { employee: true, branch: true },
      orderBy: { clockIn: "desc" },
      take: 8,
    }),
    prisma.employee.count({ where: { ...branchScopedWhere, status: "ACTIVE" } }),
    prisma.attendanceRecord.count({ where: { ...branchScopedWhere, clockIn: { gte: today } } }),
    prisma.attendanceRecord.count({ where: { ...branchScopedWhere, clockOut: null } }),
  ]);

  const employeeRows: HrEmployeeRow[] = employees.map((employee) => {
    const contract = employee.contracts[0];

    return {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email ?? "Sin correo",
      position: employee.position?.name ?? "Sin puesto",
      branch: employee.branch.name,
      contract: contract ? contract.type.replaceAll("_", " ") : "Sin contrato",
      status: employee.status,
      lastAttendance: formatDateTime(employee.attendanceRecords[0]?.clockIn, locale),
    };
  });

  const attendanceRows: HrAttendanceRow[] = attendanceRecords.map((record) => ({
    id: record.id,
    employee: `${record.employee.firstName} ${record.employee.lastName}`,
    branch: record.branch.name,
    clockIn: formatDateTime(record.clockIn, locale),
    clockOut: record.clockOut ? formatDateTime(record.clockOut, locale) : "Abierta",
    source: record.source,
    status: record.clockOut ? "CLOSED" : "OPEN",
  }));

  const contractRows: HrContractRow[] = employees.map((employee) => {
    const contract = employee.contracts[0];
    const isExpired = Boolean(contract?.endDate && contract.endDate < new Date());

    return {
      id: contract?.id ?? employee.id,
      employee: `${employee.firstName} ${employee.lastName}`,
      type: contract ? contract.type.replaceAll("_", " ") : "Sin contrato",
      compensation: contract?.salary ? formatMoney(contract.salary) : contract?.hourlyRate ? `${formatMoney(contract.hourlyRate)}/h` : "Sin monto",
      startDate: formatDate(contract?.startDate, locale),
      status: !contract ? "SIN_CONTRATO" : isExpired ? "VENCIDO" : "VIGENTE",
    };
  });

  return (
    <section className="erp-section space-y-6" role="main" aria-label="RH y asistencia">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">RH y asistencia</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Plantilla, contratos y asistencia diaria con una vista operativa para sucursales.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BranchScopeSelector locale={locale} />
          <div className="flex gap-2">
            <EmployeeFormDialog
              trigger={
                <Button size="sm">
                  <Plus />
                  Alta empleado
                </Button>
              }
            />
            <AttendanceDialog
              employees={employees.map((emp) => ({
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
              }))}
            />
            <Button size="icon-sm" variant="outline" aria-label="Exportar RH"><Download /></Button>
          </div>
        </div>
      </div>

      <div className="erp-page-grid">
        <MetricCard label="Personal activo" value={String(activeEmployees)} change="Actual" locale={locale} />
        <MetricCard label="Presentes hoy" value={String(attendanceToday)} change="Hoy" tone="success" locale={locale} />
        <MetricCard label="Incidencias" value={String(openAttendance)} change="Abiertas" tone={openAttendance > 0 ? "warning" : "success"} locale={locale} />
        <MetricCard label="Asistencias abiertas" value={String(openAttendance)} change="Clock" tone={openAttendance > 0 ? "warning" : "default"} locale={locale} />
      </div>

      <Card className="rounded-lg">
        <CardContent className="flex flex-wrap gap-2 p-3">
          <a href="#empleados" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Empleados</a>
          <a href="#asistencia" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Asistencia</a>
          <a href="#contratos" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Contratos</a>
        </CardContent>
      </Card>

      <div id="empleados">
        <EmployeeTable employees={employeeRows} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div id="asistencia">
          <AttendancePanel records={attendanceRows} />
        </div>
        <div id="contratos">
          <ContractSummary contracts={contractRows} />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <CalendarClock className="size-4" />
        Acciones de captura y exportacion preparadas para integrarse con endpoints operativos.
      </div>
    </section>
  );
}
