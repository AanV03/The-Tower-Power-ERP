import {
  BadgeDollarSign,
  Boxes,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  Dumbbell,
  KeyRound,
  Megaphone,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UsersRound,
  Warehouse,
  Webhook,
  Wrench,
  Home,
} from "lucide-react";
import type { ElementType } from "react";

import type { Locale } from "@/lib/i18n";

export type ModuleId =
  | "dashboard"
  | "memberships"
  | "access"
  | "finance"
  | "pos"
  | "inventory"
  | "hr"
  | "marketing"
  | "specialists"
  | "admin"
  | "catalog"
  | "purchases"
  | "warehouse"
  | "accounting"
  | "payroll"
  | "analytics"
  | "integrations"
  | "maintenance";

export type NavItem = {
  id: ModuleId;
  href: string;
  icon: ElementType;
  labels: Record<Locale, string>;
  description: Record<Locale, string>;
};

export type NavGroup = {
  id: "operations" | "logistics" | "finance" | "people" | "growth" | "platform";
  labels: Record<Locale, string>;
  items: NavItem[];
};

export const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    icon: Home,
    labels: { es: "Panel operativo", en: "Operations board", fr: "Tableau de bord opérationnel" },
    description: {
      es: "KPIs, alertas y actividad por sucursal.",
      en: "KPIs, alerts, and branch activity.",
      fr: "KPI, alertes et activité par succursale.",
    },
  },
  {
    id: "memberships",
    href: "/memberships",
    icon: CreditCard,
    labels: { es: "Suscripciones", en: "Subscriptions", fr: "Abonnements" },
    description: {
      es: "Planes, pausas, renovaciones y cobranza.",
      en: "Plans, pauses, renewals, and billing.",
      fr: "Plans, pauses, renouvellements et facturation.",
    },
  },
  {
    id: "access",
    href: "/access",
    icon: KeyRound,
    labels: { es: "Acceso", en: "Access", fr: "Accès" },
    description: {
      es: "Validación QR, biométricos y torniquetes.",
      en: "QR, biometric, and turnstile validation.",
      fr: "Validation QR, biométrique et portillon.",
    },
  },
  {
    id: "finance",
    href: "/finance",
    icon: BadgeDollarSign,
    labels: { es: "Finanzas", en: "Finance", fr: "Finances" },
    description: {
      es: "Cuentas por cobrar, pagar y flujo.",
      en: "Receivables, payables, and cash flow.",
      fr: "Créances, dettes et flux de trésorerie.",
    },
  },
  {
    id: "pos",
    href: "/pos",
    icon: ShoppingCart,
    labels: { es: "Punto de venta", en: "Point of sale", fr: "Point de vente" },
    description: {
      es: "Caja rápida para suplementos y accesorios.",
      en: "Fast checkout for supplies and accessories.",
      fr: "Caisse rapide pour suppléments et accessoires.",
    },
  },
  {
    id: "inventory",
    href: "/inventory",
    icon: Boxes,
    labels: { es: "Inventario", en: "Inventory", fr: "Inventaire" },
    description: {
      es: "Stock, traspasos y alertas de reposición.",
      en: "Stock, transfers, and restocking alerts.",
      fr: "Stock, transferts et alertes de réapprovisionnement.",
    },
  },
  {
    id: "catalog",
    href: "/catalog",
    icon: Package,
    labels: { es: "Catalogo", en: "Catalog", fr: "Catalogue" },
    description: {
      es: "Productos, categorias, SKU, costos e impuestos.",
      en: "Products, categories, SKUs, costs, and taxes.",
      fr: "Produits, categories, SKU, couts et taxes.",
    },
  },
  {
    id: "purchases",
    href: "/purchases",
    icon: Truck,
    labels: { es: "Compras", en: "Purchases", fr: "Achats" },
    description: {
      es: "Proveedores, facturas por pagar y entradas de stock.",
      en: "Suppliers, payable invoices, and stock receipts.",
      fr: "Fournisseurs, factures a payer et entrees de stock.",
    },
  },
  {
    id: "warehouse",
    href: "/warehouse",
    icon: Warehouse,
    labels: { es: "Almacenes", en: "Warehouse", fr: "Entrepots" },
    description: {
      es: "Stock critico, almacenes y transferencias.",
      en: "Critical stock, warehouses, and transfers.",
      fr: "Stock critique, entrepots et transferts.",
    },
  },
  {
    id: "hr",
    href: "/hr",
    icon: UsersRound,
    labels: { es: "RH y nómina", en: "HR and payroll", fr: "RH et paie" },
    description: {
      es: "Expedientes, asistencias y comisiones.",
      en: "Records, attendance, and commissions.",
      fr: "Dossiers, présences et commissions.",
    },
  },
  {
    id: "payroll",
    href: "/payroll",
    icon: ReceiptText,
    labels: { es: "Nomina", en: "Payroll", fr: "Paie" },
    description: {
      es: "Periodos, contratos, asistencias y pagos netos.",
      en: "Periods, contracts, attendance, and net payouts.",
      fr: "Periodes, contrats, presences et paiements nets.",
    },
  },
  {
    id: "marketing",
    href: "/marketing",
    icon: Megaphone,
    labels: { es: "Marketing", en: "Marketing", fr: "Marketing" },
    description: {
      es: "CRM, campañas y análisis de churn.",
      en: "CRM, campaigns, and churn analysis.",
      fr: "CRM, campagnes et analyse du désabonnement.",
    },
  },
  {
    id: "analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
    labels: { es: "Analytics", en: "Analytics", fr: "Analytics" },
    description: {
      es: "BI, retencion, rentabilidad y comparativos.",
      en: "BI, retention, profitability, and comparisons.",
      fr: "BI, retention, rentabilite et comparatifs.",
    },
  },
  {
    id: "specialists",
    href: "/specialists",
    icon: Dumbbell,
    labels: { es: "Especialistas", en: "Specialists", fr: "Spécialistes" },
    description: {
      es: "Rentas, comisiones y liquidaciones.",
      en: "Rent, commissions, and settlements.",
      fr: "Loyers, commissions et règlements.",
    },
  },
  {
    id: "accounting",
    href: "/accounting",
    icon: Calculator,
    labels: { es: "Contabilidad", en: "Accounting", fr: "Comptabilite" },
    description: {
      es: "Catalogo de cuentas, polizas y partida doble.",
      en: "Chart of accounts, journal entries, and double entry.",
      fr: "Plan comptable, ecritures et partie double.",
    },
  },
  {
    id: "admin",
    href: "/admin",
    icon: ShieldCheck,
    labels: { es: "SaaS Admin", en: "SaaS Admin", fr: "Admin SaaS" },
    description: {
      es: "Tenants, licencias, módulos y white-label.",
      en: "Tenants, licenses, modules, and white-label.",
      fr: "Tenants, licences, modules et blanc-label.",
    },
  },
  {
    id: "integrations",
    href: "/integrations",
    icon: Webhook,
    labels: { es: "Integraciones", en: "Integrations", fr: "Integrations" },
    description: {
      es: "Eventos de pasarela, outbox y auditoria tecnica.",
      en: "Gateway events, outbox, and technical audit.",
      fr: "Evenements passerelle, outbox et audit technique.",
    },
  },
  {
    id: "maintenance",
    href: "/maintenance",
    icon: Wrench,
    labels: { es: "Mantenimiento", en: "Maintenance", fr: "Maintenance" },
    description: {
      es: "Tickets de servicio para equipo e instalaciones.",
      en: "Service tickets for equipment and facilities.",
      fr: "Tickets de service pour equipement et installations.",
    },
  },
];

function navItem(id: ModuleId) {
  const item = navigationItems.find((entry) => entry.id === id);
  if (!item) throw new Error(`Navigation item not found: ${id}`);
  return item;
}

export const navigationGroups: NavGroup[] = [
  {
    id: "operations",
    labels: { es: "Operacion", en: "Operations", fr: "Operations" },
    items: [navItem("dashboard"), navItem("pos"), navItem("memberships"), navItem("access")],
  },
  {
    id: "logistics",
    labels: { es: "Logistica", en: "Logistics", fr: "Logistique" },
    items: [navItem("catalog"), navItem("purchases"), navItem("warehouse"), navItem("inventory")],
  },
  {
    id: "finance",
    labels: { es: "Finanzas", en: "Finance", fr: "Finances" },
    items: [navItem("finance"), navItem("accounting")],
  },
  {
    id: "people",
    labels: { es: "Personas", en: "People", fr: "Personnes" },
    items: [navItem("hr"), navItem("payroll"), navItem("specialists")],
  },
  {
    id: "growth",
    labels: { es: "Crecimiento", en: "Growth", fr: "Croissance" },
    items: [navItem("marketing"), navItem("analytics")],
  },
  {
    id: "platform",
    labels: { es: "Plataforma", en: "Platform", fr: "Plateforme" },
    items: [navItem("admin"), navItem("integrations"), navItem("maintenance")],
  },
];

export const scopeOptions = [
  { id: "consolidated", label: { es: "Consolidado", en: "Consolidated", fr: "Consolidé" } },
  { id: "north-region", label: { es: "Región Norte", en: "North Region", fr: "Région Nord" } },
  { id: "downtown", label: { es: "Sucursal Centro", en: "Downtown Branch", fr: "Succursale Centre" } },
  { id: "campus", label: { es: "Sucursal Campus", en: "Campus Branch", fr: "Succursale Campus" } },
];

export const tenantOptions = [
  { id: "tower-power-hq", label: "The Tower Power HQ" },
  { id: "fitlab-pro", label: "FitLab Pro" },
  { id: "urban-gym", label: "Urban Gym" },
];

export const auditTrail = [
  {
    icon: ClipboardList,
    actor: "Branch Manager",
    action: "Pausó membresía anual",
    meta: "Centro · hace 8 min",
  },
  {
    icon: Building2,
    actor: "Super Admin",
    action: "Activó módulo de inventario",
    meta: "FitLab Pro · hace 22 min",
  },
  {
    icon: ShieldCheck,
    actor: "Auditor",
    action: "Exportó bitácora de pagos",
    meta: "Consolidado · hace 41 min",
  },
];
