export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

const dictionaries = {
  es: {
    landing: {
      eyebrow: "ERP multi-sucursal para gimnasios",
      description:
        "Base frontend preparada para una futura landing y para operar módulos SaaS con branding configurable, navegación por idioma y experiencia administrativa responsiva.",
      primaryAction: "Entrar al dashboard",
    },
    common: {
      dashboard: "Dashboard",
      branch: "Sucursal",
      region: "Región",
      consolidated: "Consolidado",
      active: "Activo",
      warning: "Atención",
      critical: "Crítico",
      viewDetails: "Ver detalles",
      quickActions: "Acciones rápidas",
      searchPlaceholder: "Buscar miembro, folio o módulo",
      tenant: "Tenant",
      language: "Idioma",
      account: "Mi cuenta",
      logout: "Cerrar sesión",
      profile: "Perfil",
      settings: "Configuración",
      toggleSidebar: "Alternar panel lateral",
      notifications: "Notificaciones",
      noNotifications: "Sin nuevas notificaciones",
      systemUpdated: "Sistema actualizado correctamente",
    },
    modules: {
      dashboard: "Panel operativo",
      memberships: "Suscripciones",
      access: "Acceso",
      finance: "Finanzas",
      pos: "Punto de venta",
      inventory: "Inventario",
      hr: "RH y nómina",
      marketing: "Marketing",
      specialists: "Especialistas",
      admin: "SaaS Admin",
    },
  },
  en: {
    landing: {
      eyebrow: "Multi-branch ERP for gyms",
      description:
        "Frontend foundation prepared for a future landing page and SaaS operations with configurable branding, locale routing, and responsive administration screens.",
      primaryAction: "Open dashboard",
    },
    common: {
      dashboard: "Dashboard",
      branch: "Branch",
      region: "Region",
      consolidated: "Consolidated",
      active: "Active",
      warning: "Warning",
      critical: "Critical",
      viewDetails: "View details",
      quickActions: "Quick actions",
      searchPlaceholder: "Search member, invoice or module",
      tenant: "Tenant",
      language: "Language",
      account: "My account",
      logout: "Sign out",
      profile: "Profile",
      settings: "Settings",
      toggleSidebar: "Toggle sidebar",
      notifications: "Notifications",
      noNotifications: "No new notifications",
      systemUpdated: "System updated successfully",
    },
    modules: {
      dashboard: "Operations board",
      memberships: "Subscriptions",
      access: "Access",
      finance: "Finance",
      pos: "Point of sale",
      inventory: "Inventory",
      hr: "HR and payroll",
      marketing: "Marketing",
      specialists: "Specialists",
      admin: "SaaS Admin",
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
