import type {
  CampaignStatus,
  ChurnRisk,
  MarketingChannel,
  MarketingLabels,
  MarketingTab,
  SelectOption,
  StatusVisualConfig,
} from "./types";

export const marketingLabels: MarketingLabels = {
  tabs: {
    overview: "Resumen",
    campaigns: "Campanas",
    audiences: "Audiencias",
    automation: "Automatizacion",
  },
  performanceTitle: "Rendimiento de campanas",
  performanceDescription: "Metricas acumuladas de envios, aperturas y conversiones.",
  performanceSeries: {
    sent: "Enviados",
    opened: "Abiertos",
    converted: "Convertidos",
  },
  funnelTitle: "Embudo de conversion",
  funnelDescription: "Tasa de conversion por etapa del pipeline comercial.",
  conversionRate: "conversion",
  dropoff: "perdida",
  campaignsTitle: "Campanas activas",
  campaignsDescription: "Monitoreo operativo por canal, estado y audiencia.",
  campaignMetrics: {
    sent: "Env.",
    openRate: "Apert.",
    clickRate: "Clics",
    conversion: "Conv.",
  },
  campaignActions: {
    pause: "Pausar",
    resume: "Activar",
  },
  segmentsTitle: "Segmentos de audiencia",
  segmentsDescription: "Grupos listos para activacion comercial o retencion.",
  members: "miembros",
  churnTitle: "Churn e intervenciones",
  churnDescription: "Miembros en riesgo de abandono con acciones de retencion.",
  automationTitle: "Flujo de automatizacion",
  automationDescription: "Secuencia activa con disparadores, condiciones y acciones.",
  activeUsers: "usuarios activos",
  modalTitle: "Crear nueva campana",
  modalDescription: "Configura canal, segmento y contenido para dejar la campana lista.",
  modalFields: {
    name: "Nombre de la campana",
    namePlaceholder: "Ej. Recuperacion inactivos julio",
    channel: "Canal",
    segment: "Segmento",
    segmentPlaceholder: "Todos los miembros",
    content: "Contenido",
    contentPlaceholder: "Escribe el mensaje o plantilla...",
  },
  modalActions: {
    cancel: "Cancelar",
    submit: "Lanzar campana",
  },
  searchPlaceholder: "Buscar campana, segmento o canal...",
  channelFilter: "Canal",
  statusFilter: "Estado",
  allChannels: "Todos los canales",
  allStatuses: "Todos los estados",
  refresh: "Actualizar",
  export: "Exportar",
  preview: "Analizar",
  sendIntervention: "Enviar",
  markContacted: "Contactado",
  contacted: "Contactado",
  critical: "criticos",
  interventionProgress: "Progreso de intervenciones",
  score: "Score",
  live: "Live",
  emptyCampaignsTitle: "Sin campanas para mostrar",
  emptyCampaignsDescription: "Ajusta los filtros o crea una campana para iniciar la operacion.",
  emptyAudiencesTitle: "Sin audiencias configuradas",
  emptyAudiencesDescription: "Cuando existan segmentos, apareceran aqui para activacion directa.",
  emptyAutomationTitle: "Sin flujo activo",
  emptyAutomationDescription: "Conecta disparadores, condiciones y acciones para automatizar retencion.",
  loadingTitle: "Cargando marketing...",
  errorTitle: "No se pudo cargar marketing",
  errorDescription: "Revisa la conexion o intenta actualizar el modulo.",
  retry: "Reintentar",
  formRequiredError: "Completa nombre y contenido antes de lanzar la campana.",
  campaignCreated: "Campana creada en modo demo.",
  campaignPaused: "Campana pausada correctamente.",
  campaignResumed: "Campana reanudada correctamente.",
  interventionSent: "Intervencion enviada al miembro seleccionado.",
  markedContacted: "Miembro marcado como contactado.",
  demoUpdated: "Datos demo actualizados.",
  exportReady: "Exportacion simulada lista.",
};

export const marketingTabOptions: SelectOption<MarketingTab>[] = [
  { value: "overview", label: marketingLabels.tabs.overview },
  { value: "campaigns", label: marketingLabels.tabs.campaigns },
  { value: "audiences", label: marketingLabels.tabs.audiences },
  { value: "automation", label: marketingLabels.tabs.automation },
];

export const channelLabels: Record<MarketingChannel, string> = {
  email: "Email",
  sms: "SMS",
  social: "Social",
};

export const channelOptions: SelectOption<MarketingChannel | "all">[] = [
  { value: "all", label: marketingLabels.allChannels },
  { value: "email", label: channelLabels.email },
  { value: "sms", label: channelLabels.sms },
  { value: "social", label: channelLabels.social },
];

export const campaignStatusConfig: Record<CampaignStatus, StatusVisualConfig> = {
  active: {
    label: "Activa",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
  },
  draft: {
    label: "Borrador",
    className: "border-border text-muted-foreground",
  },
  scheduled: {
    label: "Programada",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  paused: {
    label: "Pausada",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

export const statusOptions: SelectOption<CampaignStatus | "all">[] = [
  { value: "all", label: marketingLabels.allStatuses },
  { value: "active", label: campaignStatusConfig.active.label },
  { value: "draft", label: campaignStatusConfig.draft.label },
  { value: "scheduled", label: campaignStatusConfig.scheduled.label },
  { value: "paused", label: campaignStatusConfig.paused.label },
];

export const churnRiskConfig: Record<ChurnRisk, StatusVisualConfig> = {
  high: {
    label: "Alto riesgo",
    className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
    dotClassName: "border-l-red-500",
  },
  medium: {
    label: "Riesgo medio",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dotClassName: "border-l-amber-500",
  },
  low: {
    label: "Riesgo bajo",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotClassName: "border-l-emerald-500",
  },
};
