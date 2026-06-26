import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import type { Locale } from "@/lib/i18n";
import { HrClient } from "@/components/modules/hr/hr-client";
import type { HrEmployeeRow } from "@/components/modules/hr/employee-table";
import type { HrAttendanceRow } from "@/components/modules/hr/attendance-panel";
import type { HrContractRow } from "@/components/modules/hr/contract-summary";

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
    <HrClient
      locale={locale}
      initialEmployees={employeeRows}
      initialAttendances={attendanceRows}
      initialContracts={contractRows}
      metrics={{
        activeEmployees,
        attendanceToday,
        openAttendance,
      }}
    />
  );
}
