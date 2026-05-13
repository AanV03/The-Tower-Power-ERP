import type { ModuleId } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";

export type MetricTone = "default" | "success" | "warning" | "danger";

export type ModuleMetric = {
  label: Record<Locale, string>;
  value: string;
  change: string;
  tone: MetricTone;
};

export type ModuleRow = {
  name: string;
  branch: string;
  status: "active" | "warning" | "critical";
  amount: string;
  owner: string;
};

export type ModuleConfig = {
  id: ModuleId;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  primaryAction: Record<Locale, string>;
  metrics: ModuleMetric[];
  rows: ModuleRow[];
  chart: { label: string; value: number }[];
};

export const moduleConfigs: Record<ModuleId, ModuleConfig> = {
  dashboard: {
    id: "dashboard",
    title: { es: "Panel operativo", en: "Operations board" },
    subtitle: {
      es: "Vista consolidada de ingresos, acceso, inventario y retención por sucursal.",
      en: "Consolidated view of revenue, access, inventory, and retention by branch.",
    },
    primaryAction: { es: "Nueva alerta", en: "New alert" },
    metrics: [
      {
        label: { es: "Ingresos mensuales", en: "Monthly revenue" },
        value: "$1.42M",
        change: "+12.4%",
        tone: "success",
      },
      {
        label: { es: "Miembros activos", en: "Active members" },
        value: "8,420",
        change: "+348",
        tone: "default",
      },
      {
        label: { es: "Pagos vencidos", en: "Overdue payments" },
        value: "126",
        change: "-8.2%",
        tone: "warning",
      },
      {
        label: { es: "Riesgo churn", en: "Churn risk" },
        value: "7.8%",
        change: "+1.1%",
        tone: "danger",
      },
    ],
    chart: [
      { label: "Lun", value: 78 },
      { label: "Mar", value: 86 },
      { label: "Mié", value: 91 },
      { label: "Jue", value: 84 },
      { label: "Vie", value: 98 },
      { label: "Sáb", value: 74 },
      { label: "Dom", value: 64 },
    ],
    rows: [
      {
        name: "Centro · cierre de caja",
        branch: "Centro",
        status: "active",
        amount: "$84,220",
        owner: "Caja 01",
      },
      {
        name: "Campus · stock bajo",
        branch: "Campus",
        status: "warning",
        amount: "18 SKUs",
        owner: "Inventario",
      },
      {
        name: "Norte · cobranza vencida",
        branch: "Norte",
        status: "critical",
        amount: "$46,100",
        owner: "Finanzas",
      },
    ],
  },
  memberships: {
    id: "memberships",
    title: { es: "Suscripciones y membresías", en: "Subscriptions and memberships" },
    subtitle: {
      es: "Gestión de planes, pausas, cancelaciones, renovaciones y cobranza recurrente.",
      en: "Plan, pause, cancellation, renewal, and recurring billing management.",
    },
    primaryAction: { es: "Nueva membresía", en: "New membership" },
    metrics: [
      { label: { es: "Planes activos", en: "Active plans" }, value: "8,420", change: "+4.3%", tone: "success" },
      { label: { es: "Pausas vigentes", en: "Current pauses" }, value: "214", change: "+18", tone: "warning" },
      { label: { es: "Renovaciones", en: "Renewals" }, value: "642", change: "Esta semana", tone: "default" },
      { label: { es: "Cancelaciones", en: "Cancellations" }, value: "38", change: "-12%", tone: "success" },
    ],
    chart: [
      { label: "Ene", value: 62 },
      { label: "Feb", value: 71 },
      { label: "Mar", value: 74 },
      { label: "Abr", value: 82 },
      { label: "May", value: 88 },
      { label: "Jun", value: 94 },
    ],
    rows: [
      { name: "Plan anual corporativo", branch: "Centro", status: "active", amount: "$18,000", owner: "Ana Torres" },
      { name: "Plan familiar", branch: "Campus", status: "warning", amount: "$2,800", owner: "Luis Meyer" },
      { name: "Plan mensual vencido", branch: "Norte", status: "critical", amount: "$690", owner: "Rita Soto" },
    ],
  },
  access: {
    id: "access",
    title: { es: "Control de acceso", en: "Access control" },
    subtitle: {
      es: "Validación en tiempo real para QR, biometría y torniquetes por sucursal.",
      en: "Real-time validation for QR, biometric, and turnstile access by branch.",
    },
    primaryAction: { es: "Registrar acceso", en: "Register access" },
    metrics: [
      { label: { es: "Check-ins hoy", en: "Check-ins today" }, value: "2,918", change: "+16%", tone: "success" },
      { label: { es: "Denegados", en: "Denied" }, value: "47", change: "Pago vencido", tone: "warning" },
      { label: { es: "Dispositivos online", en: "Online devices" }, value: "31/32", change: "1 alerta", tone: "warning" },
      { label: { es: "Tiempo validación", en: "Validation time" }, value: "180ms", change: "p95", tone: "default" },
    ],
    chart: [
      { label: "06h", value: 54 },
      { label: "09h", value: 88 },
      { label: "12h", value: 63 },
      { label: "15h", value: 71 },
      { label: "18h", value: 96 },
      { label: "21h", value: 78 },
    ],
    rows: [
      { name: "QR móvil aceptado", branch: "Centro", status: "active", amount: "08:42", owner: "M. Ávila" },
      { name: "Biométrico sin pago", branch: "Campus", status: "warning", amount: "09:14", owner: "J. Cano" },
      { name: "Torniquete offline", branch: "Norte", status: "critical", amount: "09:31", owner: "Puerta 02" },
    ],
  },
  finance: {
    id: "finance",
    title: { es: "Finanzas", en: "Finance" },
    subtitle: {
      es: "Cuentas por cobrar, cuentas por pagar, conciliación y flujo proyectado.",
      en: "Receivables, payables, reconciliation, and projected cash flow.",
    },
    primaryAction: { es: "Programar pago", en: "Schedule payment" },
    metrics: [
      { label: { es: "CxC pendiente", en: "Open AR" }, value: "$284K", change: "-9%", tone: "success" },
      { label: { es: "CxP próxima", en: "Upcoming AP" }, value: "$196K", change: "7 días", tone: "warning" },
      { label: { es: "Conciliado", en: "Reconciled" }, value: "94%", change: "+3%", tone: "success" },
      { label: { es: "Flujo 30 días", en: "30-day flow" }, value: "$620K", change: "+11%", tone: "default" },
    ],
    chart: [
      { label: "S1", value: 58 },
      { label: "S2", value: 72 },
      { label: "S3", value: 68 },
      { label: "S4", value: 86 },
      { label: "S5", value: 91 },
    ],
    rows: [
      { name: "Factura mantenimiento máquinas", branch: "Centro", status: "warning", amount: "$42,300", owner: "Proveedor MX" },
      { name: "Cobro membresías Stripe", branch: "Consolidado", status: "active", amount: "$312,900", owner: "Pasarela" },
      { name: "Renta vencida", branch: "Norte", status: "critical", amount: "$28,000", owner: "Administración" },
    ],
  },
  pos: {
    id: "pos",
    title: { es: "Punto de venta", en: "Point of sale" },
    subtitle: {
      es: "Caja rápida para suplementos, bebidas, apparel y accesorios.",
      en: "Fast checkout for supplements, beverages, apparel, and accessories.",
    },
    primaryAction: { es: "Abrir caja", en: "Open register" },
    metrics: [
      { label: { es: "Ventas hoy", en: "Sales today" }, value: "$58.4K", change: "+21%", tone: "success" },
      { label: { es: "Tickets", en: "Tickets" }, value: "342", change: "+47", tone: "default" },
      { label: { es: "Ticket promedio", en: "Average ticket" }, value: "$171", change: "+8%", tone: "success" },
      { label: { es: "Devoluciones", en: "Returns" }, value: "5", change: "Bajo", tone: "warning" },
    ],
    chart: [
      { label: "08h", value: 28 },
      { label: "10h", value: 44 },
      { label: "12h", value: 51 },
      { label: "14h", value: 46 },
      { label: "16h", value: 63 },
      { label: "18h", value: 81 },
    ],
    rows: [
      { name: "Proteína Whey 2kg", branch: "Centro", status: "active", amount: "$1,290", owner: "Caja 01" },
      { name: "Bebidas isotónicas", branch: "Campus", status: "active", amount: "$1,840", owner: "Caja 02" },
      { name: "Corte pendiente", branch: "Norte", status: "warning", amount: "$12,400", owner: "Caja 01" },
    ],
  },
  inventory: {
    id: "inventory",
    title: { es: "Inventario", en: "Inventory" },
    subtitle: {
      es: "Control de stock por sucursal, alertas de reposición, mermas y traspasos.",
      en: "Branch stock control, restocking alerts, shrinkage, and transfers.",
    },
    primaryAction: { es: "Crear traspaso", en: "Create transfer" },
    metrics: [
      { label: { es: "SKUs activos", en: "Active SKUs" }, value: "1,284", change: "+32", tone: "default" },
      { label: { es: "Stock bajo", en: "Low stock" }, value: "27", change: "Reposición", tone: "warning" },
      { label: { es: "Mermas", en: "Shrinkage" }, value: "$8.2K", change: "-4%", tone: "success" },
      { label: { es: "Traspasos", en: "Transfers" }, value: "18", change: "En curso", tone: "default" },
    ],
    chart: [
      { label: "Proteína", value: 76 },
      { label: "Bebidas", value: 92 },
      { label: "Ropa", value: 58 },
      { label: "Acc.", value: 64 },
      { label: "Limpieza", value: 83 },
    ],
    rows: [
      { name: "Whey vainilla 2kg", branch: "Centro", status: "warning", amount: "8 pzas", owner: "Almacén" },
      { name: "Toallas premium", branch: "Campus", status: "active", amount: "64 pzas", owner: "Retail" },
      { name: "Guantes entrenamiento", branch: "Norte", status: "critical", amount: "0 pzas", owner: "Retail" },
    ],
  },
  hr: {
    id: "hr",
    title: { es: "RH y nómina", en: "HR and payroll" },
    subtitle: {
      es: "Expedientes digitales, asistencias, horas extra, nómina y comisiones.",
      en: "Digital records, attendance, overtime, payroll, and commissions.",
    },
    primaryAction: { es: "Alta empleado", en: "Add employee" },
    metrics: [
      { label: { es: "Personal activo", en: "Active staff" }, value: "214", change: "+5", tone: "default" },
      { label: { es: "Asistencia", en: "Attendance" }, value: "96%", change: "Hoy", tone: "success" },
      { label: { es: "Horas extra", en: "Overtime" }, value: "82h", change: "Semana", tone: "warning" },
      { label: { es: "Comisiones", en: "Commissions" }, value: "$74K", change: "+12%", tone: "success" },
    ],
    chart: [
      { label: "Lun", value: 91 },
      { label: "Mar", value: 94 },
      { label: "Mié", value: 89 },
      { label: "Jue", value: 96 },
      { label: "Vie", value: 93 },
    ],
    rows: [
      { name: "Entrenador personal", branch: "Centro", status: "active", amount: "$8,400", owner: "Nómina" },
      { name: "Recepción turno tarde", branch: "Campus", status: "warning", amount: "2 faltas", owner: "RH" },
      { name: "Comisión pendiente", branch: "Norte", status: "active", amount: "$3,200", owner: "Trainer" },
    ],
  },
  marketing: {
    id: "marketing",
    title: { es: "Marketing y retención", en: "Marketing and retention" },
    subtitle: {
      es: "CRM, embudos, campañas automatizadas y análisis predictivo de churn.",
      en: "CRM, funnels, automated campaigns, and predictive churn analysis.",
    },
    primaryAction: { es: "Nueva campaña", en: "New campaign" },
    metrics: [
      { label: { es: "Leads abiertos", en: "Open leads" }, value: "1,086", change: "+18%", tone: "success" },
      { label: { es: "Conversión", en: "Conversion" }, value: "24%", change: "+3%", tone: "success" },
      { label: { es: "Automaciones", en: "Automations" }, value: "16", change: "Activas", tone: "default" },
      { label: { es: "Churn alto", en: "High churn" }, value: "312", change: "Intervenir", tone: "danger" },
    ],
    chart: [
      { label: "Lead", value: 94 },
      { label: "Tour", value: 61 },
      { label: "Prueba", value: 42 },
      { label: "Pago", value: 27 },
    ],
    rows: [
      { name: "Recordatorio renovación", branch: "Consolidado", status: "active", amount: "2,104 envíos", owner: "Email" },
      { name: "Bajo uso 21 días", branch: "Centro", status: "warning", amount: "86 usuarios", owner: "CRM" },
      { name: "Lead sin contacto", branch: "Campus", status: "critical", amount: "42 leads", owner: "Ventas" },
    ],
  },
  specialists: {
    id: "specialists",
    title: { es: "Modelos para especialistas", en: "Specialist business models" },
    subtitle: {
      es: "Rentas fijas, comisiones por sesión y liquidaciones automáticas de cierre.",
      en: "Fixed rent, session commissions, and automatic period settlements.",
    },
    primaryAction: { es: "Nueva liquidación", en: "New settlement" },
    metrics: [
      { label: { es: "Especialistas", en: "Specialists" }, value: "78", change: "+4", tone: "default" },
      { label: { es: "Rentas fijas", en: "Fixed rent" }, value: "$124K", change: "Mes", tone: "success" },
      { label: { es: "Comisiones", en: "Commissions" }, value: "$218K", change: "+9%", tone: "success" },
      { label: { es: "Pendiente pago", en: "Pending payout" }, value: "$46K", change: "Cierre", tone: "warning" },
    ],
    chart: [
      { label: "Sem 1", value: 44 },
      { label: "Sem 2", value: 58 },
      { label: "Sem 3", value: 63 },
      { label: "Sem 4", value: 79 },
    ],
    rows: [
      { name: "Nutrición · renta mensual", branch: "Centro", status: "active", amount: "$12,000", owner: "Dra. Ruiz" },
      { name: "Fisioterapia · comisión", branch: "Campus", status: "warning", amount: "$18,700", owner: "Clínica Move" },
      { name: "Cierre pendiente", branch: "Norte", status: "critical", amount: "$9,800", owner: "Coach Max" },
    ],
  },
  admin: {
    id: "admin",
    title: { es: "SaaS Admin", en: "SaaS Admin" },
    subtitle: {
      es: "Gestión multi-tenant, licenciamiento, módulos disponibles y white-label.",
      en: "Multi-tenant management, licensing, enabled modules, and white-label.",
    },
    primaryAction: { es: "Crear tenant", en: "Create tenant" },
    metrics: [
      { label: { es: "Tenants", en: "Tenants" }, value: "18", change: "+2", tone: "success" },
      { label: { es: "Planes Pro", en: "Pro plans" }, value: "11", change: "61%", tone: "default" },
      { label: { es: "Suspendidos", en: "Suspended" }, value: "1", change: "Pago", tone: "warning" },
      { label: { es: "White-label", en: "White-label" }, value: "7", change: "Activos", tone: "default" },
    ],
    chart: [
      { label: "Basic", value: 6 },
      { label: "Pro", value: 11 },
      { label: "Ent.", value: 1 },
    ],
    rows: [
      { name: "FitLab Pro", branch: "Tenant", status: "active", amount: "Pro", owner: "fitlab.mx" },
      { name: "Urban Gym", branch: "Tenant", status: "warning", amount: "Basic", owner: "Pago pendiente" },
      { name: "Titan Wellness", branch: "Tenant", status: "active", amount: "Enterprise", owner: "Dominio custom" },
    ],
  },
};
