import type { PayrollLabels, PayrollStatusLabel } from "./types";

export const payrollLabels: PayrollLabels = {
  title: "Nomina",
  subtitle: "Periodos, recibos, deducciones, comisiones y cierre de pago.",
  tabs: {
    receipts: "Nomina por empleado",
    close: "Historial de periodos",
  },
  actions: {
    createPeriod: "Crear periodo",
    preview: "Vista previa",
    export: "Exportar",
    approve: "Aprobar periodo",
    pay: "Enviar a pagos",
    viewReceipt: "Ver recibo",
  },
  filters: {
    searchPlaceholder: "Buscar empleado, puesto o sucursal...",
    status: "Estado",
    branch: "Sucursal",
    allStatuses: "Todos los estados",
    allBranches: "Todas las sucursales",
  },
  metrics: {
    draftPeriods: "Periodos borrador",
    includedEmployees: "Personas en nomina",
    pendingNet: "Total a pagar",
    commissions: "Comisiones",
    deductions: "Deducciones",
    incidents: "Pendientes",
  },
  periods: {
    title: "Periodos recientes",
    description: "Elige el periodo que quieres revisar.",
    employees: "Empleados",
    net: "Neto",
    emptyTitle: "Sin periodos creados",
    emptyDescription: "Crea un periodo para preparar la nomina.",
  },
  receipts: {
    title: "Recibos del periodo",
    description: "Lista simple de pagos calculados para este periodo.",
    employee: "Empleado",
    positionBranch: "Puesto / sucursal",
    base: "Base",
    overtime: "Horas extra",
    commission: "Comision",
    deductions: "Deducciones",
    net: "Neto",
    status: "Estado",
    action: "Accion",
    emptyTitle: "Sin recibos en el periodo",
    emptyDescription: "Usa Vista previa para calcular los recibos antes de cerrar.",
  },
  summary: {
    title: "Totales del periodo",
    base: "Base",
    overtime: "Horas extra",
    commissions: "Comisiones",
    deductions: "Deducciones",
    netTotal: "Neto total",
    alerts: "Antes de cerrar",
    ready: "Listo",
    review: "Revisar",
    missingReceipts: "Empleados sin recibo",
    openAttendances: "Asistencias abiertas",
    draftPeriods: "Periodos en borrador",
  },
  status: {
    DRAFT: "Borrador",
    APPROVED: "Aprobado",
    PAID: "Pagado",
  },
};

export const payrollStatusVariant: Record<PayrollStatusLabel, "default" | "secondary" | "outline"> = {
  DRAFT: "secondary",
  APPROVED: "outline",
  PAID: "default",
};

export const payrollStatusOptions: Array<{ value: PayrollStatusLabel | "all"; label: string }> = [
  { value: "all", label: payrollLabels.filters.allStatuses },
  { value: "DRAFT", label: payrollLabels.status.DRAFT },
  { value: "APPROVED", label: payrollLabels.status.APPROVED },
  { value: "PAID", label: payrollLabels.status.PAID },
];
