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
    title: { es: "Panel operativo", en: "Operations board", fr: "Tableau de bord opérationnel" },
    subtitle: {
      es: "Vista consolidada de ingresos, acceso, inventario y retención por sucursal.",
      en: "Consolidated view of revenue, access, inventory, and retention by branch.",
      fr: "Vue consolidée des revenus, accès, inventaire et rétention par succursale.",
    },
    primaryAction: { es: "Nueva alerta", en: "New alert", fr: "Nouvelle alerte" },
    metrics: [
      {
        label: { es: "Ingresos mensuales", en: "Monthly revenue", fr: "Revenus mensuels" },
        value: "$1.42M",
        change: "+12.4%",
        tone: "success",
      },
      {
        label: { es: "Miembros activos", en: "Active members", fr: "Membres actifs" },
        value: "8,420",
        change: "+348",
        tone: "default",
      },
      {
        label: { es: "Pagos vencidos", en: "Overdue payments", fr: "Paiements en retard" },
        value: "126",
        change: "-8.2%",
        tone: "warning",
      },
      {
        label: { es: "Riesgo churn", en: "Churn risk", fr: "Risque de désabonnement" },
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
    title: { es: "Suscripciones y membresías", en: "Subscriptions and memberships", fr: "Abonnements et adhésions" },
    subtitle: {
      es: "Gestión de planes, pausas, cancelaciones, renovaciones y cobranza recurrente.",
      en: "Plan, pause, cancellation, renewal, and recurring billing management.",
      fr: "Gestion des plans, pauses, annulations, renouvellements et facturation récurrente.",
    },
    primaryAction: { es: "Nueva membresía", en: "New membership", fr: "Nouvelle adhésion" },
    metrics: [
      { label: { es: "Planes activos", en: "Active plans", fr: "Plans actifs" }, value: "8,420", change: "+4.3%", tone: "success" },
      { label: { es: "Pausas vigentes", en: "Current pauses", fr: "Pauses actuelles" }, value: "214", change: "+18", tone: "warning" },
      { label: { es: "Renovaciones", en: "Renewals", fr: "Renouvellements" }, value: "642", change: "Esta semana", tone: "default" },
      { label: { es: "Cancelaciones", en: "Cancellations", fr: "Annulations" }, value: "38", change: "-12%", tone: "success" },
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
    title: { es: "Control de acceso", en: "Access control", fr: "Contrôle d'accès" },
    subtitle: {
      es: "Validación en tiempo real para QR, biometría y torniquetes por sucursal.",
      en: "Real-time validation for QR, biometric, and turnstile access by branch.",
      fr: "Validation en temps réel pour accès par code QR, biométrique et portillon par succursale.",
    },
    primaryAction: { es: "Registrar acceso", en: "Register access", fr: "Enregistrer l'accès" },
    metrics: [
      { label: { es: "Check-ins hoy", en: "Check-ins today", fr: "Enregistrements aujourd'hui" }, value: "2,918", change: "+16%", tone: "success" },
      { label: { es: "Denegados", en: "Denied", fr: "Refusés" }, value: "47", change: "Pago vencido", tone: "warning" },
      { label: { es: "Dispositivos online", en: "Online devices", fr: "Appareils en ligne" }, value: "31/32", change: "1 alerta", tone: "warning" },
      { label: { es: "Tiempo validación", en: "Validation time", fr: "Temps de validation" }, value: "180ms", change: "p95", tone: "default" },
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
    title: { es: "Finanzas", en: "Finance", fr: "Finances" },
    subtitle: {
      es: "Cuentas por cobrar, cuentas por pagar, conciliación y flujo proyectado.",
      en: "Receivables, payables, reconciliation, and projected cash flow.",
      fr: "Créances, dettes, rapprochement et flux de trésorerie projeté.",
    },
    primaryAction: { es: "Programar pago", en: "Schedule payment", fr: "Planifier le paiement" },
    metrics: [
      { label: { es: "CxC pendiente", en: "Open AR", fr: "Créances ouvertes" }, value: "$284K", change: "-9%", tone: "success" },
      { label: { es: "CxP próxima", en: "Upcoming AP", fr: "Dettes à venir" }, value: "$196K", change: "7 días", tone: "warning" },
      { label: { es: "Conciliado", en: "Reconciled", fr: "Rapproché" }, value: "94%", change: "+3%", tone: "success" },
      { label: { es: "Flujo 30 días", en: "30-day flow", fr: "Flux 30 jours" }, value: "$620K", change: "+11%", tone: "default" },
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
    title: { es: "Punto de venta", en: "Point of sale", fr: "Point de vente" },
    subtitle: {
      es: "Caja rápida para suplementos, bebidas, apparel y accesorios.",
      en: "Fast checkout for supplements, beverages, apparel, and accessories.",
      fr: "Caisse rapide pour suppléments, boissons, vêtements et accessoires.",
    },
    primaryAction: { es: "Abrir caja", en: "Open register", fr: "Ouvrir la caisse" },
    metrics: [
      { label: { es: "Ventas hoy", en: "Sales today", fr: "Ventes aujourd'hui" }, value: "$58.4K", change: "+21%", tone: "success" },
      { label: { es: "Tickets", en: "Tickets", fr: "Tickets" }, value: "342", change: "+47", tone: "default" },
      { label: { es: "Ticket promedio", en: "Average ticket", fr: "Ticket moyen" }, value: "$171", change: "+8%", tone: "success" },
      { label: { es: "Devoluciones", en: "Returns", fr: "Retours" }, value: "5", change: "Bajo", tone: "warning" },
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
    title: { es: "Inventario", en: "Inventory", fr: "Inventaire" },
    subtitle: {
      es: "Control de stock por sucursal, alertas de reposición, mermas y traspasos.",
      en: "Branch stock control, restocking alerts, shrinkage, and transfers.",
      fr: "Contrôle du stock par succursale, alertes de réapprovisionnement, démarques et transferts.",
    },
    primaryAction: { es: "Crear traspaso", en: "Create transfer", fr: "Créer un transfert" },
    metrics: [
      { label: { es: "SKUs activos", en: "Active SKUs", fr: "SKU actifs" }, value: "1,284", change: "+32", tone: "default" },
      { label: { es: "Stock bajo", en: "Low stock", fr: "Stock faible" }, value: "27", change: "Reposición", tone: "warning" },
      { label: { es: "Mermas", en: "Shrinkage", fr: "Démarques" }, value: "$8.2K", change: "-4%", tone: "success" },
      { label: { es: "Traspasos", en: "Transfers", fr: "Transferts" }, value: "18", change: "En curso", tone: "default" },
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
    title: { es: "RH y nómina", en: "HR and payroll", fr: "RH et paie" },
    subtitle: {
      es: "Expedientes digitales, asistencias, horas extra, nómina y comisiones.",
      en: "Digital records, attendance, overtime, payroll, and commissions.",
      fr: "Dossiers numériques, présences, heures supplémentaires, paie et commissions.",
    },
    primaryAction: { es: "Alta empleado", en: "Add employee", fr: "Ajouter employé" },
    metrics: [
      { label: { es: "Personal activo", en: "Active staff", fr: "Personnel actif" }, value: "214", change: "+5", tone: "default" },
      { label: { es: "Asistencia", en: "Attendance", fr: "Présence" }, value: "96%", change: "Hoy", tone: "success" },
      { label: { es: "Horas extra", en: "Overtime", fr: "Heures supplémentaires" }, value: "82h", change: "Semana", tone: "warning" },
      { label: { es: "Comisiones", en: "Commissions", fr: "Commissions" }, value: "$74K", change: "+12%", tone: "success" },
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
    title: { es: "Marketing y retención", en: "Marketing and retention", fr: "Marketing et rétention" },
    subtitle: {
      es: "CRM, embudos, campañas automatizadas y análisis predictivo de churn.",
      en: "CRM, funnels, automated campaigns, and predictive churn analysis.",
      fr: "CRM, entonnoirs, campagnes automatisées et analyse prédictive du désabonnement.",
    },
    primaryAction: { es: "Nueva campaña", en: "New campaign", fr: "Nouvelle campagne" },
    metrics: [
      { label: { es: "Leads abiertos", en: "Open leads", fr: "Prospects ouverts" }, value: "1,086", change: "+18%", tone: "success" },
      { label: { es: "Conversión", en: "Conversion", fr: "Conversion" }, value: "24%", change: "+3%", tone: "success" },
      { label: { es: "Automaciones", en: "Automations", fr: "Automations" }, value: "16", change: "Activas", tone: "default" },
      { label: { es: "Churn alto", en: "High churn", fr: "Churn élevé" }, value: "312", change: "Intervenir", tone: "danger" },
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
    title: { es: "Modelos para especialistas", en: "Specialist business models", fr: "Modèles commerciaux pour spécialistes" },
    subtitle: {
      es: "Rentas fijas, comisiones por sesión y liquidaciones automáticas de cierre.",
      en: "Fixed rent, session commissions, and automatic period settlements.",
      fr: "Loyers fixes, commissions par séance et règlements automatiques de période.",
    },
    primaryAction: { es: "Nueva liquidación", en: "New settlement", fr: "Nouveau règlement" },
    metrics: [
      { label: { es: "Especialistas", en: "Specialists", fr: "Spécialistes" }, value: "78", change: "+4", tone: "default" },
      { label: { es: "Rentas fijas", en: "Fixed rent", fr: "Loyers fixes" }, value: "$124K", change: "Mes", tone: "success" },
      { label: { es: "Comisiones", en: "Commissions", fr: "Commissions" }, value: "$218K", change: "+9%", tone: "success" },
      { label: { es: "Pendiente pago", en: "Pending payout", fr: "Paiement en attente" }, value: "$46K", change: "Cierre", tone: "warning" },
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
    title: { es: "SaaS Admin", en: "SaaS Admin", fr: "Admin SaaS" },
    subtitle: {
      es: "Gestión multi-tenant, licenciamiento, módulos disponibles y white-label.",
      en: "Multi-tenant management, licensing, enabled modules, and white-label.",
      fr: "Gestion multi-locataire, licences, modules activés et blanc-label.",
    },
    primaryAction: { es: "Crear tenant", en: "Create tenant", fr: "Créer tenant" },
    metrics: [
      { label: { es: "Tenants", en: "Tenants", fr: "Tenants" }, value: "18", change: "+2", tone: "success" },
      { label: { es: "Planes Pro", en: "Pro plans", fr: "Plans Pro" }, value: "11", change: "61%", tone: "default" },
      { label: { es: "Suspendidos", en: "Suspended", fr: "Suspendus" }, value: "1", change: "Pago", tone: "warning" },
      { label: { es: "White-label", en: "White-label", fr: "Blanc-label" }, value: "7", change: "Activos", tone: "default" },
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
  catalog: {
    id: "catalog",
    title: { es: "Catalogo de productos", en: "Product catalog", fr: "Catalogue produits" },
    subtitle: {
      es: "Diccionario maestro de productos, categorias, SKU, costos, precios e impuestos.",
      en: "Master product dictionary for categories, SKUs, costs, prices, and taxes.",
      fr: "Dictionnaire maitre des produits, categories, SKU, couts, prix et taxes.",
    },
    primaryAction: { es: "Nuevo producto", en: "New product", fr: "Nouveau produit" },
    metrics: [
      { label: { es: "Productos activos", en: "Active products", fr: "Produits actifs" }, value: "0", change: "Actual", tone: "default" },
      { label: { es: "Categorias", en: "Categories", fr: "Categories" }, value: "0", change: "Catalogo", tone: "default" },
      { label: { es: "SKUs sin stock", en: "SKUs without stock", fr: "SKU sans stock" }, value: "0", change: "Revisar", tone: "warning" },
      { label: { es: "Precio promedio", en: "Average price", fr: "Prix moyen" }, value: "$0", change: "MXN", tone: "default" },
    ],
    chart: [
      { label: "Productos", value: 0 },
      { label: "Categorias", value: 0 },
      { label: "Activos", value: 0 },
    ],
    rows: [
      { name: "Catalogo listo para productos", branch: "Tenant", status: "active", amount: "0 SKUs", owner: "Catalogo" },
    ],
  },
  purchases: {
    id: "purchases",
    title: { es: "Compras a proveedores", en: "Supplier purchases", fr: "Achats fournisseurs" },
    subtitle: {
      es: "Abastecimiento B2B, facturas por pagar y entradas de mercancia a almacenes.",
      en: "B2B procurement, payable invoices, and warehouse stock receipts.",
      fr: "Approvisionnement B2B, factures a payer et receptions en entrepot.",
    },
    primaryAction: { es: "Registrar compra", en: "Register purchase", fr: "Enregistrer achat" },
    metrics: [
      { label: { es: "Facturas por pagar", en: "Payable invoices", fr: "Factures a payer" }, value: "$0", change: "Abiertas", tone: "warning" },
      { label: { es: "Proveedores", en: "Suppliers", fr: "Fournisseurs" }, value: "0", change: "Activos", tone: "default" },
      { label: { es: "Compras recibidas", en: "Received purchases", fr: "Achats recus" }, value: "0", change: "Hoy", tone: "success" },
      { label: { es: "Pendientes", en: "Pending", fr: "En attente" }, value: "0", change: "Recepcion", tone: "default" },
    ],
    chart: [
      { label: "CxP", value: 0 },
      { label: "Recibido", value: 0 },
      { label: "Proveedores", value: 0 },
    ],
    rows: [
      { name: "Flujo de compras listo", branch: "Tenant", status: "active", amount: "$0", owner: "Compras" },
    ],
  },
  warehouse: {
    id: "warehouse",
    title: { es: "Gestion de almacenes", en: "Warehouse management", fr: "Gestion entrepots" },
    subtitle: {
      es: "Stock por sucursal, puntos de reorden, traspasos y movimientos de inventario.",
      en: "Branch stock, reorder points, transfers, and inventory movements.",
      fr: "Stock par succursale, seuils, transferts et mouvements.",
    },
    primaryAction: { es: "Nuevo movimiento", en: "New movement", fr: "Nouveau mouvement" },
    metrics: [
      { label: { es: "Almacenes", en: "Warehouses", fr: "Entrepots" }, value: "0", change: "Activos", tone: "default" },
      { label: { es: "Stock critico", en: "Critical stock", fr: "Stock critique" }, value: "0", change: "Reorden", tone: "warning" },
      { label: { es: "Movimientos hoy", en: "Movements today", fr: "Mouvements jour" }, value: "0", change: "Hoy", tone: "default" },
      { label: { es: "Traspasos", en: "Transfers", fr: "Transferts" }, value: "0", change: "En curso", tone: "default" },
    ],
    chart: [
      { label: "Almacenes", value: 0 },
      { label: "Critico", value: 0 },
      { label: "Movs", value: 0 },
    ],
    rows: [
      { name: "Control de almacenes listo", branch: "Consolidado", status: "active", amount: "0 items", owner: "Warehouse" },
    ],
  },
  accounting: {
    id: "accounting",
    title: { es: "Contabilidad", en: "Accounting", fr: "Comptabilite" },
    subtitle: {
      es: "Catalogo de cuentas, polizas contables, cargos, abonos y cuadre financiero.",
      en: "Chart of accounts, journal entries, debits, credits, and balancing.",
      fr: "Plan comptable, ecritures, debits, credits et equilibre.",
    },
    primaryAction: { es: "Nueva poliza", en: "New journal entry", fr: "Nouvelle ecriture" },
    metrics: [
      { label: { es: "Cuentas", en: "Accounts", fr: "Comptes" }, value: "0", change: "Catalogo", tone: "default" },
      { label: { es: "Polizas borrador", en: "Draft entries", fr: "Ecritures brouillon" }, value: "0", change: "Revisar", tone: "warning" },
      { label: { es: "Polizas posteadas", en: "Posted entries", fr: "Ecritures validees" }, value: "0", change: "Mes", tone: "success" },
      { label: { es: "Balance", en: "Balance", fr: "Balance" }, value: "$0", change: "Debito/credito", tone: "default" },
    ],
    chart: [
      { label: "Cuentas", value: 0 },
      { label: "Borrador", value: 0 },
      { label: "Posteado", value: 0 },
    ],
    rows: [
      { name: "Contabilidad lista para polizas", branch: "Tenant", status: "active", amount: "0", owner: "Contador" },
    ],
  },
  payroll: {
    id: "payroll",
    title: { es: "Nomina y comisiones", en: "Payroll and commissions", fr: "Paie et commissions" },
    subtitle: {
      es: "Periodos de nomina, contratos, asistencias, horas extra, deducciones y netos.",
      en: "Payroll periods, contracts, attendance, overtime, deductions, and net pay.",
      fr: "Periodes de paie, contrats, presences, heures extra, deductions et net.",
    },
    primaryAction: { es: "Crear periodo", en: "Create period", fr: "Creer periode" },
    metrics: [
      { label: { es: "Periodos borrador", en: "Draft periods", fr: "Periodes brouillon" }, value: "0", change: "Revisar", tone: "warning" },
      { label: { es: "Empleados activos", en: "Active employees", fr: "Employes actifs" }, value: "0", change: "Actual", tone: "default" },
      { label: { es: "Asistencias hoy", en: "Attendance today", fr: "Presences jour" }, value: "0", change: "Hoy", tone: "success" },
      { label: { es: "Neto pendiente", en: "Pending net pay", fr: "Net en attente" }, value: "$0", change: "Nomina", tone: "default" },
    ],
    chart: [
      { label: "Periodos", value: 0 },
      { label: "Personal", value: 0 },
      { label: "Asistencia", value: 0 },
    ],
    rows: [
      { name: "Nomina lista para periodos", branch: "Tenant", status: "active", amount: "$0", owner: "RH" },
    ],
  },
  analytics: {
    id: "analytics",
    title: { es: "Analytics e inteligencia", en: "Analytics and intelligence", fr: "Analytics et intelligence" },
    subtitle: {
      es: "BI para flujo de caja, retencion, churn y rentabilidad entre sucursales.",
      en: "BI for cash flow, retention, churn, and branch profitability.",
      fr: "BI pour flux de caisse, retention, churn et rentabilite.",
    },
    primaryAction: { es: "Generar reporte", en: "Generate report", fr: "Generer rapport" },
    metrics: [
      { label: { es: "Snapshots", en: "Snapshots", fr: "Snapshots" }, value: "0", change: "Mongo", tone: "default" },
      { label: { es: "Retencion", en: "Retention", fr: "Retention" }, value: "0%", change: "Actual", tone: "success" },
      { label: { es: "Churn", en: "Churn", fr: "Churn" }, value: "0%", change: "Riesgo", tone: "warning" },
      { label: { es: "Sucursales", en: "Branches", fr: "Succursales" }, value: "0", change: "Comparativo", tone: "default" },
    ],
    chart: [
      { label: "Retencion", value: 0 },
      { label: "Churn", value: 0 },
      { label: "Sucursales", value: 0 },
    ],
    rows: [
      { name: "Analytics listo para snapshots", branch: "Consolidado", status: "active", amount: "0", owner: "BI" },
    ],
  },
  integrations: {
    id: "integrations",
    title: { es: "Integraciones y webhooks", en: "Integrations and webhooks", fr: "Integrations et webhooks" },
    subtitle: {
      es: "Eventos de pasarelas, outbox, reintentos y auditoria tecnica por tenant.",
      en: "Gateway events, outbox, retries, and tenant technical audit.",
      fr: "Evenements passerelle, outbox, reprises et audit technique.",
    },
    primaryAction: { es: "Revisar eventos", en: "Review events", fr: "Reviser evenements" },
    metrics: [
      { label: { es: "Eventos gateway", en: "Gateway events", fr: "Evenements passerelle" }, value: "0", change: "Recibidos", tone: "default" },
      { label: { es: "Outbox pendiente", en: "Pending outbox", fr: "Outbox attente" }, value: "0", change: "Cola", tone: "warning" },
      { label: { es: "Fallidos", en: "Failed", fr: "Echecs" }, value: "0", change: "Reintentar", tone: "danger" },
      { label: { es: "Procesados", en: "Processed", fr: "Traites" }, value: "0", change: "OK", tone: "success" },
    ],
    chart: [
      { label: "Gateway", value: 0 },
      { label: "Outbox", value: 0 },
      { label: "Fallos", value: 0 },
    ],
    rows: [
      { name: "Centro tecnico listo", branch: "Tenant", status: "active", amount: "0 eventos", owner: "Integraciones" },
    ],
  },
  maintenance: {
    id: "maintenance",
    title: { es: "Mantenimiento de instalaciones", en: "Facility maintenance", fr: "Maintenance installations" },
    subtitle: {
      es: "Tickets de servicio para maquinas, equipo, prioridades y resolucion operativa.",
      en: "Service tickets for machines, equipment, priorities, and operations.",
      fr: "Tickets pour machines, equipement, priorites et operations.",
    },
    primaryAction: { es: "Nuevo ticket", en: "New ticket", fr: "Nouveau ticket" },
    metrics: [
      { label: { es: "Tickets abiertos", en: "Open tickets", fr: "Tickets ouverts" }, value: "0", change: "Activos", tone: "warning" },
      { label: { es: "Criticos", en: "Critical", fr: "Critiques" }, value: "0", change: "Prioridad", tone: "danger" },
      { label: { es: "En progreso", en: "In progress", fr: "En cours" }, value: "0", change: "Equipo", tone: "default" },
      { label: { es: "Resueltos", en: "Resolved", fr: "Resolus" }, value: "0", change: "Mes", tone: "success" },
    ],
    chart: [
      { label: "Abiertos", value: 0 },
      { label: "Criticos", value: 0 },
      { label: "Resueltos", value: 0 },
    ],
    rows: [
      { name: "Mantenimiento listo para tickets", branch: "Sucursal", status: "active", amount: "0", owner: "Operaciones" },
    ],
  },
};
