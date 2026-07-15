import type {
  AnalyticsLabels,
  AnalyticsRange,
  AnalyticsRowStatus,
  SelectOption,
} from "./types";

export const analyticsLabels: AnalyticsLabels = {
  tabs: {
    overview: "Resumen",
    branches: "Sucursales",
    reports: "Reportes",
  },
  actions: {
    filter: "Filtrar",
    export: "Exportar reporte",
    refresh: "Actualizar",
    compare: "Comparar",
  },
  filters: {
    range: "Rango",
    branch: "Sucursal",
    status: "Estado",
    searchPlaceholder: "Buscar metrica, sucursal o responsable...",
    allBranches: "Consolidado",
    allStatuses: "Todos los estados",
  },
  charts: {
    mainTitle: "Retencion y churn",
    mainDescription: "Lectura ejecutiva de salud comercial por periodo.",
    retention: "Retencion",
    churn: "Churn",
    branchTitle: "Comparativa por sucursal",
    branchDescription: "Miembros activos, retencion e ingresos mensuales por sucursal.",
    members: "Miembros",
    revenue: "Ingresos $k",
  },
  table: {
    title: "Actividad analitica",
    description: "Senales operativas priorizadas por impacto.",
    item: "Indicador",
    branch: "Sucursal",
    status: "Estado",
    amount: "Valor",
    owner: "Responsable",
  },
  export: {
    title: "Configurar exportacion",
    description: "Define formato y contenido del reporte antes de generarlo.",
    format: "Formato",
    pdf: "Documento PDF",
    csv: "Archivo CSV",
    includeCharts: "Incluir graficas",
    includeMetadata: "Incluir metadata de auditoria",
    cancel: "Cancelar",
    submit: "Exportar",
    success: "Reporte exportado en modo demo.",
  },
  empty: {
    overviewTitle: "Sin datos para graficar",
    overviewDescription: "Ajusta filtros o espera a que existan datos del periodo.",
    branchesTitle: "Sin comparativa por sucursal",
    branchesDescription: "Cuando existan sucursales con actividad, se mostraran aqui.",
    reportsTitle: "Sin snapshots disponibles",
    reportsDescription: "Los cortes periodicos apareceran al cerrar periodos operativos.",
  },
  error: {
    title: "No se pudo cargar analytics",
    description: "Revisa la conexion o intenta actualizar el modulo.",
    retry: "Reintentar",
  },
  status: {
    active: "Activo",
    warning: "Alerta",
    critical: "Critico",
  },
};

export const analyticsRangeOptions: SelectOption<AnalyticsRange>[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "Ultimos 7 dias" },
  { value: "30d", label: "Ultimos 30 dias" },
  { value: "90d", label: "Ultimos 90 dias" },
  { value: "all", label: "Todo el tiempo" },
];

export const analyticsStatusOptions: SelectOption<AnalyticsRowStatus | "all">[] = [
  { value: "all", label: analyticsLabels.filters.allStatuses },
  { value: "active", label: analyticsLabels.status.active },
  { value: "warning", label: analyticsLabels.status.warning },
  { value: "critical", label: analyticsLabels.status.critical },
];
