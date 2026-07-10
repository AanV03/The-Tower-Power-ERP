export type ModuleItem = {
  label: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
};

export type ModuleSection = {
  title: string;
  items: ModuleItem[];
};

type ModuleSeed = Omit<ModuleItem, "category">;

const moduleDescriptions: Record<string, Pick<ModuleSeed, "description" | "features">> = {
  "panel-operativo": {
    description: "Visualiza métricas clave, actividad reciente y accesos rápidos desde un solo lugar.",
    features: ["Resumen general del negocio", "Indicadores importantes", "Accesos rápidos a módulos"],
  },
  "punto-de-venta": {
    description: "Opera ventas, cajas, productos y cobros diarios con una experiencia rápida para recepción.",
    features: ["Control de caja", "Ventas sincronizadas", "Historial de transacciones"],
  },
  suscripciones: {
    description: "Administra planes, renovaciones, pagos recurrentes y estados de membresía.",
    features: ["Planes flexibles", "Renovaciones visibles", "Estados de suscripción"],
  },
  acceso: {
    description: "Presenta el control de entradas, dispositivos y validaciones de miembros para tu operación.",
    features: ["Validación de miembros", "Dispositivos de acceso", "Registro de entradas"],
  },
  catalogo: {
    description: "Muestra productos, categorías y precios listos para conectar con ventas e inventario.",
    features: ["Categorías organizadas", "Fichas de producto", "Precios y variantes"],
  },
  compras: {
    description: "Explica cómo centralizar proveedores, compras, facturas y recepción de mercancía.",
    features: ["Gestión de proveedores", "Órdenes de compra", "Recepción trazable"],
  },
  almacenes: {
    description: "Visualiza ubicaciones, movimientos y existencias por sucursal o almacén.",
    features: ["Existencias por ubicación", "Transferencias", "Movimientos auditables"],
  },
  inventario: {
    description: "Controla stock, alertas de mínimos y movimientos para evitar faltantes operativos.",
    features: ["Alertas de bajo stock", "Entradas y salidas", "Inventario por sucursal"],
  },
  finanzas: {
    description: "Presenta ingresos, pagos, facturas y saldos para una lectura financiera diaria.",
    features: ["Facturación", "Pagos registrados", "Resumen financiero"],
  },
  contabilidad: {
    description: "Organiza pólizas, cuentas y registros contables para mantener la operación ordenada.",
    features: ["Catálogo de cuentas", "Pólizas contables", "Trazabilidad financiera"],
  },
  "rh-y-nomina": {
    description: "Muestra empleados, asistencia, contratos y datos de nómina en una misma vista.",
    features: ["Expedientes de empleados", "Asistencia", "Contratos y turnos"],
  },
  nomina: {
    description: "Presenta periodos, recibos y cálculos base para preparar pagos de equipo.",
    features: ["Periodos de pago", "Recibos", "Resumen de nómina"],
  },
  especialistas: {
    description: "Administra coaches, sesiones, comisiones y productividad de especialistas.",
    features: ["Sesiones registradas", "Comisiones", "Rendimiento por especialista"],
  },
  marketing: {
    description: "Muestra campañas, segmentos y automatizaciones para retención y crecimiento.",
    features: ["Campañas", "Segmentos de audiencia", "Automatizaciones"],
  },
  analytics: {
    description: "Convierte datos operativos en reportes, tendencias y comparativos para tomar decisiones.",
    features: ["KPIs por módulo", "Comparativos", "Reportes exportables"],
  },
};

const sections = [
  {
    title: "Operación",
    items: [
      { label: "Panel operativo", slug: "panel-operativo" },
      { label: "Punto de venta", slug: "punto-de-venta" },
      { label: "Suscripciones", slug: "suscripciones" },
      { label: "Acceso", slug: "acceso" },
    ],
  },
  {
    title: "Logística",
    items: [
      { label: "Catálogo", slug: "catalogo" },
      { label: "Compras", slug: "compras" },
      { label: "Almacenes", slug: "almacenes" },
      { label: "Inventario", slug: "inventario" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { label: "Finanzas", slug: "finanzas" },
      { label: "Contabilidad", slug: "contabilidad" },
    ],
  },
  {
    title: "Personas",
    items: [
      { label: "RH y nómina", slug: "rh-y-nomina" },
      { label: "Nómina", slug: "nomina" },
      { label: "Especialistas", slug: "especialistas" },
    ],
  },
  {
    title: "Crecimiento",
    items: [
      { label: "Marketing", slug: "marketing" },
      { label: "Analytics", slug: "analytics" },
    ],
  },
] as const;

export const megaMenuSections: ModuleSection[] = sections.map((section) => ({
  title: section.title,
  items: section.items.map((item) => ({
    ...item,
    category: section.title,
    ...moduleDescriptions[item.slug],
  })),
}));

export const modules: ModuleItem[] = megaMenuSections.flatMap((section) => section.items);

export function getModuleBySlug(slug: string) {
  return modules.find((module) => module.slug === slug);
}
