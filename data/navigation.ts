import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  CreditCard,
  Dumbbell,
  KeyRound,
  Megaphone,
  ShieldCheck,
  ShoppingCart,
  UsersRound,
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
  | "admin";

export type NavItem = {
  id: ModuleId;
  href: string;
  icon: ElementType;
  labels: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    icon: BarChart3,
    labels: { es: "Panel operativo", en: "Operations board" },
    description: {
      es: "KPIs, alertas y actividad por sucursal.",
      en: "KPIs, alerts, and branch activity.",
    },
  },
  {
    id: "memberships",
    href: "/memberships",
    icon: CreditCard,
    labels: { es: "Suscripciones", en: "Subscriptions" },
    description: {
      es: "Planes, pausas, renovaciones y cobranza.",
      en: "Plans, pauses, renewals, and billing.",
    },
  },
  {
    id: "access",
    href: "/access",
    icon: KeyRound,
    labels: { es: "Acceso", en: "Access" },
    description: {
      es: "Validación QR, biométricos y torniquetes.",
      en: "QR, biometric, and turnstile validation.",
    },
  },
  {
    id: "finance",
    href: "/finance",
    icon: BadgeDollarSign,
    labels: { es: "Finanzas", en: "Finance" },
    description: {
      es: "Cuentas por cobrar, pagar y flujo.",
      en: "Receivables, payables, and cash flow.",
    },
  },
  {
    id: "pos",
    href: "/pos",
    icon: ShoppingCart,
    labels: { es: "Punto de venta", en: "Point of sale" },
    description: {
      es: "Caja rápida para suplementos y accesorios.",
      en: "Fast checkout for supplies and accessories.",
    },
  },
  {
    id: "inventory",
    href: "/inventory",
    icon: Boxes,
    labels: { es: "Inventario", en: "Inventory" },
    description: {
      es: "Stock, traspasos y alertas de reposición.",
      en: "Stock, transfers, and restocking alerts.",
    },
  },
  {
    id: "hr",
    href: "/hr",
    icon: UsersRound,
    labels: { es: "RH y nómina", en: "HR and payroll" },
    description: {
      es: "Expedientes, asistencias y comisiones.",
      en: "Records, attendance, and commissions.",
    },
  },
  {
    id: "marketing",
    href: "/marketing",
    icon: Megaphone,
    labels: { es: "Marketing", en: "Marketing" },
    description: {
      es: "CRM, campañas y análisis de churn.",
      en: "CRM, campaigns, and churn analysis.",
    },
  },
  {
    id: "specialists",
    href: "/specialists",
    icon: Dumbbell,
    labels: { es: "Especialistas", en: "Specialists" },
    description: {
      es: "Rentas, comisiones y liquidaciones.",
      en: "Rent, commissions, and settlements.",
    },
  },
  {
    id: "admin",
    href: "/admin",
    icon: ShieldCheck,
    labels: { es: "SaaS Admin", en: "SaaS Admin" },
    description: {
      es: "Tenants, licencias, módulos y white-label.",
      en: "Tenants, licenses, modules, and white-label.",
    },
  },
];

export const scopeOptions = [
  { id: "consolidated", label: { es: "Consolidado", en: "Consolidated" } },
  { id: "north-region", label: { es: "Región Norte", en: "North Region" } },
  { id: "downtown", label: { es: "Sucursal Centro", en: "Downtown Branch" } },
  { id: "campus", label: { es: "Sucursal Campus", en: "Campus Branch" } },
];

export const tenantOptions = [
  { id: "gerpy-hq", label: "Gerpy HQ" },
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
