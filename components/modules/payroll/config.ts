import type { PayrollLabels, PayrollStatusLabel } from "./types";

export const payrollLabels: PayrollLabels = {
  title: "Nomina y comisiones",
  subtitle: "Recibos, comisiones, deducciones y cierre operativo del periodo.",
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
    includedEmployees: "Empleados incluidos",
    pendingNet: "Neto pendiente",
    commissions: "Comisiones",
    deductions: "Deducciones",
    incidents: "Incidencias",
  },
  periods: {
    title: "Periodos recientes",
    description: "Ciclos de nomina disponibles para revisar y cerrar.",
    employees: "Empleados",
    net: "Neto",
    emptyTitle: "Sin periodos creados",
    emptyDescription: "Crea un periodo para preparar la nomina.",
  },
  receipts: {
    title: "Recibos del periodo",
    description: "Base, variables, deducciones y neto por empleado.",
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
    emptyDescription: "Genera una vista previa para incluir empleados.",
  },
  summary: {
    title: "Resumen de cierre",
    base: "Base",
    overtime: "Horas extra",
    commissions: "Comisiones",
    deductions: "Deducciones",
    netTotal: "Neto total",
    alerts: "Alertas",
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
