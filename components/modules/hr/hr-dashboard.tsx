import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_TIME_ZONE, getDayBoundsForTimeZone } from "@/lib/date/timezone";
import type { Locale } from "@/lib/i18n";
import { HrClient } from "@/components/modules/hr/hr-client";
import type { HrEmployeeRow } from "@/components/modules/hr/employee-table";
import type { HrAttendanceRow } from "@/components/modules/hr/attendance-panel";
import type { HrContractRow } from "@/components/modules/hr/contract-summary";
import type { TimeClockEmployeeOption } from "@/components/modules/hr/time-clock-dialog";

function formatDateTime(value: Date | null | undefined, locale: Locale, timeZone = DEFAULT_TIME_ZONE) {
  if (!value) return "Pendiente";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
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
  const scopedBranch = context.branchId
    ? await prisma.branch.findFirst({
        where: { tenantId: context.tenantId, id: context.branchId },
        select: { timezone: true },
      })
    : null;
  const timeZone = scopedBranch?.timezone ?? DEFAULT_TIME_ZONE;
  const today = getDayBoundsForTimeZone(new Date(), timeZone);
  const todayClockWhere = { ...branchScopedWhere, clockIn: { gte: today.start, lt: today.end } };
  const todayOpenClockWhere = { ...todayClockWhere, clockOut: null };

  const [employees, positions, timeClocks, activeEmployees, attendanceToday, openAttendance] = await Promise.all([
    prisma.employee.findMany({
      where: branchScopedWhere,
      include: {
        branch: true,
        position: true,
        contracts: { orderBy: { startDate: "desc" }, take: 1 },
        timeClocks: { orderBy: { clockIn: "desc" }, take: 1 },
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.position.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { name: "asc" },
      select: { name: true },
    }),
    prisma.timeClock.findMany({
      where: todayClockWhere,
      include: { employee: true, branch: true },
      orderBy: { clockIn: "desc" },
      take: 8,
    }),
    prisma.employee.count({ where: { ...branchScopedWhere, status: "ACTIVE" } }),
    prisma.timeClock.count({ where: todayClockWhere }),
    prisma.timeClock.count({ where: todayOpenClockWhere }),
  ]);

  const employeeRows: HrEmployeeRow[] = employees.map((employee) => {
    const contract = employee.contracts[0];

    return {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email ?? "Sin correo",
      phone: employee.phone ?? "Sin telefono",
      position: employee.position?.name ?? "Sin puesto",
      branch: employee.branch.name,
      contract: contract ? contract.type.replaceAll("_", " ") : "Sin contrato",
      status: employee.user?.status === "INVITED" ? "INVITED" : employee.status,
      lastAttendance: formatDateTime(employee.timeClocks[0]?.clockIn, locale, timeZone),
    };
  });

  const attendanceRows: HrAttendanceRow[] = timeClocks.map((record) => ({
    id: record.id,
    employee: `${record.employee.firstName} ${record.employee.lastName}`,
    branch: record.branch.name,
    clockIn: formatDateTime(record.clockIn, locale, timeZone),
    clockOut: record.clockOut ? formatDateTime(record.clockOut, locale, timeZone) : "Abierta",
    source: record.source,
    status: record.clockOut ? "CLOSED" : "OPEN",
  }));

  const timeClockEmployees: TimeClockEmployeeOption[] = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.firstName} ${employee.lastName}`,
    branchId: employee.branchId,
    branchLabel: employee.branch.name,
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
      timeClockEmployees={timeClockEmployees}
      positionOptions={positions.map((position) => position.name)}
      metrics={{
        activeEmployees,
        attendanceToday,
        openAttendance,
      }}
    />
  );
}
