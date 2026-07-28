import type { Locale } from "@/lib/i18n";

export type ModuleFeature = {
  title: string;
  description: string;
};

export type ModuleItem = {
  label: string;
  slug: string;
  category: string;
  description: string;
  features: ModuleFeature[];
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export type ModuleSection = {
  title: string;
  items: ModuleItem[];
};

type LocalizedModuleContent = Omit<ModuleItem, "slug" | "category" | "imageSrc" | "imageWidth" | "imageHeight">;
type SectionKey = "operations" | "logistics" | "finance" | "people" | "growth";

type ModuleDefinition = {
  slug: string;
  section: SectionKey;
  imageSrc: string;
  content: Record<Locale, LocalizedModuleContent>;
};

const sectionLabels = {
  es: { operations: "Operación", logistics: "Logística", finance: "Finanzas", people: "Personas", growth: "Crecimiento" },
  en: { operations: "Operations", logistics: "Logistics", finance: "Finance", people: "People", growth: "Growth" },
  fr: { operations: "Opérations", logistics: "Logistique", finance: "Finance", people: "Équipe", growth: "Croissance" },
} satisfies Record<Locale, Record<SectionKey, string>>;

const imageDimensions = {
  "panel-operativo": [1850, 957], "punto-de-venta": [1860, 948], suscripciones: [1868, 947],
  acceso: [1868, 955], catalogo: [1864, 905], compras: [1863, 914], almacenes: [1864, 840],
  inventario: [1868, 809], finanzas: [1860, 820], contabilidad: [1861, 904], "rh-y-nomina": [1862, 814],
  nomina: [1867, 850], especialistas: [1868, 798], marketing: [1772, 861], analytics: [1767, 805],
} as const;

function content(
  label: string,
  description: string,
  imageAlt: string,
  features: Array<[title: string, description: string]>,
): LocalizedModuleContent {
  return {
    label,
    description,
    imageAlt,
    features: features.map(([title, featureDescription]) => ({ title, description: featureDescription })),
  };
}

const moduleDefinitions = [
  {
    slug: "panel-operativo",
    section: "operations",
    imageSrc: "/Panel Op.png",
    content: {
      es: {
        label: "Panel operativo",
        description: "Visualiza métricas clave, actividad reciente y accesos rápidos desde un solo lugar.",
        imageAlt: "Panel operativo con métricas y actividad reciente",
        features: [{ title: "Resumen general del negocio", description: "Reúne ventas, membresías y actividad diaria en una vista clara." }, { title: "Indicadores importantes", description: "Destaca métricas prioritarias para detectar cambios y actuar a tiempo." }, { title: "Accesos rápidos a módulos", description: "Abre las herramientas más utilizadas sin recorrer menús adicionales." }],
      },
      en: content("Operations dashboard", "See key metrics, recent activity, and shortcuts from one central workspace.", "Operations dashboard with metrics and recent activity", [["Business overview", "Bring sales, memberships, and daily activity into one clear view."], ["Key indicators", "Surface priority metrics to spot changes and respond on time."], ["Module shortcuts", "Open frequently used tools without navigating through additional menus."]]),
      fr: content("Tableau opérationnel", "Consultez les indicateurs clés, l’activité récente et les raccourcis depuis un espace central.", "Tableau opérationnel avec indicateurs et activité récente", [["Vue globale de l’activité", "Réunissez ventes, abonnements et activité quotidienne dans une vue claire."], ["Indicateurs clés", "Mettez en avant les mesures prioritaires pour réagir au bon moment."], ["Raccourcis vers les modules", "Ouvrez les outils fréquents sans parcourir de menus supplémentaires."]]),
    },
  },
  {
    slug: "punto-de-venta", section: "operations", imageSrc: "/POS.png",
    content: {
      es: content("Punto de venta", "Opera ventas, cajas, productos y cobros diarios con una experiencia rápida para recepción.", "Punto de venta con control de caja y transacciones", [["Control de caja", "Supervisa aperturas, cierres y movimientos de cada caja."], ["Ventas sincronizadas", "Registra ventas al instante y mantiene existencias e ingresos alineados."], ["Historial de transacciones", "Consulta cobros, devoluciones y métodos de pago desde un historial ordenado."]]),
      en: content("Point of sale", "Run sales, tills, products, and daily payments through a fast front-desk experience.", "Point of sale with till controls and transactions", [["Till control", "Monitor openings, closings, and movements for every till."], ["Synchronized sales", "Record sales instantly while keeping stock and revenue aligned."], ["Transaction history", "Review payments, refunds, and payment methods in an organized history."]]),
      fr: content("Point de vente", "Gérez les ventes, les caisses, les produits et les paiements quotidiens depuis une interface rapide.", "Point de vente avec gestion de caisse et transactions", [["Gestion de caisse", "Suivez les ouvertures, fermetures et mouvements de chaque caisse."], ["Ventes synchronisées", "Enregistrez les ventes instantanément tout en synchronisant stock et revenus."], ["Historique des transactions", "Consultez paiements, remboursements et moyens de paiement dans un historique clair."]]),
    },
  },
  {
    slug: "suscripciones", section: "operations", imageSrc: "/Gestion Membresias.png",
    content: {
      es: content("Suscripciones", "Administra planes, renovaciones, pagos recurrentes y estados de membresía.", "Gestión de membresías, planes y renovaciones", [["Planes flexibles", "Configura opciones de membresía adaptadas a distintos perfiles y periodos."], ["Renovaciones visibles", "Identifica próximas renovaciones y evita interrupciones en el servicio."], ["Estados de suscripción", "Distingue membresías activas, pausadas, vencidas o pendientes de pago."]]),
      en: content("Memberships", "Manage plans, renewals, recurring payments, and membership status in one place.", "Membership management with plans and renewals", [["Flexible plans", "Configure membership options for different customer profiles and billing periods."], ["Visible renewals", "Identify upcoming renewals and prevent avoidable service interruptions."], ["Membership status", "Distinguish active, paused, expired, and payment-pending memberships."]]),
      fr: content("Abonnements", "Gérez les offres, les renouvellements, les paiements récurrents et le statut des adhésions.", "Gestion des adhésions avec offres et renouvellements", [["Offres flexibles", "Configurez des abonnements adaptés aux différents profils et cycles de facturation."], ["Renouvellements visibles", "Repérez les renouvellements à venir et évitez les interruptions de service."], ["Statut des adhésions", "Distinguez les adhésions actives, suspendues, expirées ou en attente de paiement."]]),
    },
  },
  {
    slug: "acceso", section: "operations", imageSrc: "/Access Control.png",
    content: {
      es: content("Acceso", "Presenta el control de entradas, dispositivos y validaciones de miembros para tu operación.", "Control de acceso con validación de miembros", [["Validación de miembros", "Confirma el estado de la membresía antes de autorizar cada entrada."], ["Dispositivos de acceso", "Supervisa lectores y terminales conectados desde una vista central."], ["Registro de entradas", "Conserva una bitácora consultable de accesos permitidos y rechazados."]]),
      en: content("Access control", "Monitor entries, connected devices, and member validation across the operation.", "Access control with member validation", [["Member validation", "Confirm membership status before authorizing each entry."], ["Access devices", "Monitor connected readers and terminals from one central view."], ["Entry log", "Keep a searchable log of approved and rejected entry attempts."]]),
      fr: content("Contrôle d’accès", "Suivez les entrées, les appareils connectés et la validation des membres.", "Contrôle d’accès avec validation des adhésions", [["Validation des membres", "Confirmez le statut de l’adhésion avant d’autoriser chaque entrée."], ["Appareils d’accès", "Surveillez les lecteurs et terminaux connectés depuis une vue centrale."], ["Journal des entrées", "Conservez un journal consultable des accès acceptés et refusés."]]),
    },
  },
  {
    slug: "catalogo", section: "logistics", imageSrc: "/Product catalog.png",
    content: {
      es: content("Catálogo", "Muestra productos, categorías y precios listos para conectar con ventas e inventario.", "Catálogo de productos con categorías y precios", [["Categorías organizadas", "Agrupa productos de forma consistente para facilitar búsqueda y reportes."], ["Fichas de producto", "Mantén descripción, código e información comercial en una ficha central."], ["Precios y variantes", "Administra precios y opciones sin duplicar productos en el catálogo."]]),
      en: content("Product catalog", "Organize products, categories, prices, and variants for sales and inventory.", "Product catalog with categories and pricing", [["Organized categories", "Group products consistently to simplify search and reporting."], ["Product records", "Keep descriptions, codes, and commercial details in one product record."], ["Prices and variants", "Manage prices and options without duplicating products in the catalog."]]),
      fr: content("Catalogue produits", "Organisez les produits, les catégories, les prix et les variantes pour la vente et le stock.", "Catalogue produits avec catégories et prix", [["Catégories organisées", "Regroupez les produits de façon cohérente pour simplifier recherche et rapports."], ["Fiches produits", "Centralisez descriptions, codes et informations commerciales dans chaque fiche."], ["Prix et variantes", "Gérez prix et options sans dupliquer les produits du catalogue."]]),
    },
  },
  {
    slug: "compras", section: "logistics", imageSrc: "/Purchasing supply.png",
    content: {
      es: content("Compras", "Explica cómo centralizar proveedores, compras, facturas y recepción de mercancía.", "Compras con proveedores y recepción de mercancía", [["Gestión de proveedores", "Centraliza contactos, condiciones y desempeño de cada proveedor."], ["Órdenes de compra", "Da seguimiento a solicitudes, aprobaciones y entregas de cada orden."], ["Recepción trazable", "Confirma cantidades recibidas y conserva evidencia para futuras revisiones."]]),
      en: content("Purchasing", "Centralize suppliers, purchase orders, invoices, and traceable goods receiving.", "Purchasing with suppliers and goods receiving", [["Supplier management", "Centralize contacts, terms, and performance for every supplier."], ["Purchase orders", "Track requests, approvals, and deliveries for each purchase order."], ["Traceable receiving", "Confirm received quantities and retain evidence for future reviews."]]),
      fr: content("Achats", "Centralisez les fournisseurs, les commandes, les factures et la réception traçable des marchandises.", "Achats avec fournisseurs et réception de marchandises", [["Gestion des fournisseurs", "Centralisez contacts, conditions et performance de chaque fournisseur."], ["Commandes d’achat", "Suivez demandes, validations et livraisons de chaque commande."], ["Réception traçable", "Confirmez les quantités reçues et conservez les preuves pour les contrôles."]]),
    },
  },
  {
    slug: "almacenes", section: "logistics", imageSrc: "/Warehouse Management.png",
    content: {
      es: content("Almacenes", "Visualiza ubicaciones, movimientos y existencias por sucursal o almacén.", "Gestión de almacenes con ubicaciones y transferencias", [["Existencias por ubicación", "Consulta stock disponible por almacén, zona o sucursal."], ["Transferencias", "Registra envíos y recepciones entre ubicaciones con seguimiento completo."], ["Movimientos auditables", "Conserva responsables, fechas y motivos de cada movimiento de mercancía."]]),
      en: content("Warehouse management", "Track locations, transfers, movements, and stock by branch or warehouse.", "Warehouse management with locations and transfers", [["Stock by location", "Review available stock by warehouse, zone, or branch."], ["Transfers", "Record shipments and receipts between locations with complete tracking."], ["Auditable movements", "Preserve owners, dates, and reasons for every goods movement."]]),
      fr: content("Gestion des entrepôts", "Suivez les emplacements, les transferts, les mouvements et le stock par site.", "Gestion des entrepôts avec emplacements et transferts", [["Stock par emplacement", "Consultez le stock disponible par entrepôt, zone ou site."], ["Transferts", "Enregistrez expéditions et réceptions entre sites avec un suivi complet."], ["Mouvements auditables", "Conservez responsables, dates et motifs de chaque mouvement de marchandises."]]),
    },
  },
  {
    slug: "inventario", section: "logistics", imageSrc: "/Inventory Stock.png",
    content: {
      es: content("Inventario", "Controla stock, alertas de mínimos y movimientos para evitar faltantes operativos.", "Inventario con stock y alertas de mínimos", [["Alertas de bajo stock", "Detecta productos próximos a agotarse antes de afectar la operación."], ["Entradas y salidas", "Registra cada ajuste, recepción o consumo con su motivo correspondiente."], ["Inventario por sucursal", "Compara existencias entre sucursales desde una vista consolidada."]]),
      en: content("Inventory", "Control stock, minimum-level alerts, and movements to prevent operational shortages.", "Inventory with stock levels and alerts", [["Low-stock alerts", "Detect products approaching depletion before operations are affected."], ["Stock movements", "Record every adjustment, receipt, or consumption with its reason."], ["Branch inventory", "Compare stock across branches from one consolidated view."]]),
      fr: content("Inventaire", "Contrôlez le stock, les seuils minimums et les mouvements pour éviter les ruptures.", "Inventaire avec niveaux de stock et alertes", [["Alertes de stock faible", "Détectez les produits proches de la rupture avant tout impact opérationnel."], ["Mouvements de stock", "Enregistrez chaque ajustement, réception ou consommation avec son motif."], ["Stock par site", "Comparez les stocks des différents sites depuis une vue consolidée."]]),
    },
  },
  {
    slug: "finanzas", section: "finance", imageSrc: "/Finance Module.png",
    content: {
      es: content("Finanzas", "Presenta ingresos, pagos, facturas y saldos para una lectura financiera diaria.", "Módulo financiero con ingresos, pagos y saldos", [["Facturación", "Organiza facturas emitidas y su estado de cobro."], ["Pagos registrados", "Relaciona pagos con clientes, facturas y métodos utilizados."], ["Resumen financiero", "Resume ingresos, saldos y movimientos para una lectura financiera diaria."]]),
      en: content("Finance", "Review revenue, payments, invoices, and balances for daily financial visibility.", "Finance module with revenue, payments, and balances", [["Invoicing", "Organize issued invoices and their collection status."], ["Recorded payments", "Connect payments with customers, invoices, and methods used."], ["Financial overview", "Summarize revenue, balances, and movements for daily financial visibility."]]),
      fr: content("Finance", "Consultez les revenus, les paiements, les factures et les soldes au quotidien.", "Module financier avec revenus, paiements et soldes", [["Facturation", "Organisez les factures émises et leur statut de règlement."], ["Paiements enregistrés", "Reliez paiements, clients, factures et moyens utilisés."], ["Vue financière", "Résumez revenus, soldes et mouvements pour une vision financière quotidienne."]]),
    },
  },
  {
    slug: "contabilidad", section: "finance", imageSrc: "/Accounting.png",
    content: {
      es: content("Contabilidad", "Organiza pólizas, cuentas y registros contables para mantener la operación ordenada.", "Contabilidad con catálogo de cuentas y pólizas", [["Catálogo de cuentas", "Mantén cuentas ordenadas por naturaleza y uso contable."], ["Pólizas contables", "Registra cargos y abonos con referencias y periodos definidos."], ["Trazabilidad financiera", "Sigue cada registro hasta su documento y operación de origen."]]),
      en: content("Accounting", "Organize journals, accounts, and accounting records for a reliable financial operation.", "Accounting with chart of accounts and journals", [["Chart of accounts", "Keep accounts organized by accounting nature and purpose."], ["Accounting journals", "Record debits and credits with defined references and periods."], ["Financial traceability", "Trace every entry back to its source document and operation."]]),
      fr: content("Comptabilité", "Organisez les journaux, les comptes et les écritures pour une gestion financière fiable.", "Comptabilité avec plan comptable et journaux", [["Plan comptable", "Classez les comptes selon leur nature et leur usage comptable."], ["Journaux comptables", "Enregistrez débits et crédits avec références et périodes définies."], ["Traçabilité financière", "Retracez chaque écriture jusqu’à son document et son opération d’origine."]]),
    },
  },
  {
    slug: "rh-y-nomina", section: "people", imageSrc: "/HR attendance.png",
    content: {
      es: content("RH y nómina", "Muestra empleados, asistencia, contratos y datos de nómina en una misma vista.", "Recursos humanos con empleados y asistencia", [["Expedientes de empleados", "Reúne datos laborales, contacto y documentación de cada colaborador."], ["Asistencia", "Consulta entradas, salidas, incidencias y ausencias por periodo."], ["Contratos y turnos", "Organiza condiciones laborales, horarios y vigencia de cada contrato."]]),
      en: content("HR and attendance", "Bring employee records, attendance, contracts, and shifts into one view.", "Human resources with employees and attendance", [["Employee records", "Combine employment, contact, and document data for every team member."], ["Attendance", "Review arrivals, departures, incidents, and absences by period."], ["Contracts and shifts", "Organize employment terms, schedules, and contract validity."]]),
      fr: content("RH et présence", "Réunissez les dossiers, la présence, les contrats et les horaires des employés.", "Ressources humaines avec employés et présence", [["Dossiers des employés", "Réunissez données professionnelles, coordonnées et documents de chaque collaborateur."], ["Présence", "Consultez arrivées, départs, incidents et absences par période."], ["Contrats et horaires", "Organisez conditions d’emploi, horaires et validité de chaque contrat."]]),
    },
  },
  {
    slug: "nomina", section: "people", imageSrc: "/Payroll commissions.png",
    content: {
      es: content("Nómina", "Presenta periodos, recibos y cálculos base para preparar pagos de equipo.", "Nómina con periodos, recibos y comisiones", [["Periodos de pago", "Organiza cada ciclo de pago con fechas y estado claramente visibles."], ["Recibos", "Genera comprobantes con percepciones, deducciones y totales comprensibles."], ["Resumen de nómina", "Revisa importes y variaciones antes de confirmar el pago del equipo."]]),
      en: content("Payroll", "Prepare pay with clear periods, receipts, commissions, and payroll summaries.", "Payroll with periods, receipts, and commissions", [["Pay periods", "Organize every pay cycle with clearly visible dates and status."], ["Receipts", "Generate receipts with understandable earnings, deductions, and totals."], ["Payroll overview", "Review amounts and changes before confirming team payment."]]),
      fr: content("Paie", "Préparez les paiements avec des périodes, reçus, commissions et résumés clairs.", "Paie avec périodes, reçus et commissions", [["Périodes de paie", "Organisez chaque cycle de paie avec dates et statut clairement visibles."], ["Bulletins", "Générez des bulletins présentant gains, retenues et totaux lisibles."], ["Vue de la paie", "Vérifiez montants et variations avant de confirmer le paiement de l’équipe."]]),
    },
  },
  {
    slug: "especialistas", section: "people", imageSrc: "/Period Settlement.png",
    content: {
      es: content("Especialistas", "Administra coaches, sesiones, comisiones y productividad de especialistas.", "Liquidación de periodos para especialistas", [["Sesiones registradas", "Registra servicios realizados y vincúlalos con clientes y horarios."], ["Comisiones", "Calcula comisiones según reglas claras y actividad confirmada."], ["Rendimiento por especialista", "Compara sesiones, ingresos y cumplimiento de cada especialista."]]),
      en: content("Specialists", "Manage coaches, sessions, commissions, settlements, and individual performance.", "Period settlements for specialists", [["Recorded sessions", "Record delivered services and connect them to customers and schedules."], ["Commissions", "Calculate commissions from clear rules and confirmed activity."], ["Specialist performance", "Compare sessions, revenue, and goal completion for every specialist."]]),
      fr: content("Spécialistes", "Gérez les coachs, les séances, les commissions, les règlements et la performance individuelle.", "Règlements de périodes pour spécialistes", [["Séances enregistrées", "Enregistrez les services réalisés et reliez-les aux clients et horaires."], ["Commissions", "Calculez les commissions selon des règles claires et l’activité confirmée."], ["Performance individuelle", "Comparez séances, revenus et objectifs de chaque spécialiste."]]),
    },
  },
  {
    slug: "marketing", section: "growth", imageSrc: "/Marketing retention.png",
    content: {
      es: content("Marketing", "Muestra campañas, segmentos y automatizaciones para retención y crecimiento.", "Marketing con campañas y automatizaciones de retención", [["Campañas", "Planifica acciones con objetivos, canales, fechas y resultados medibles."], ["Segmentos de audiencia", "Agrupa audiencias por comportamiento, estado o características compartidas."], ["Automatizaciones", "Activa comunicaciones recurrentes según eventos del ciclo del cliente."]]),
      en: content("Marketing", "Build campaigns, audience segments, and automations for retention and growth.", "Marketing with retention campaigns and automations", [["Campaigns", "Plan initiatives with measurable goals, channels, dates, and results."], ["Audience segments", "Group audiences by behavior, status, or shared characteristics."], ["Automations", "Trigger recurring communications from events in the customer lifecycle."]]),
      fr: content("Marketing", "Créez des campagnes, des segments et des automatisations pour fidéliser et développer l’activité.", "Marketing avec campagnes et automatisations de fidélisation", [["Campagnes", "Planifiez des actions avec objectifs, canaux, dates et résultats mesurables."], ["Segments d’audience", "Regroupez les audiences par comportement, statut ou caractéristiques communes."], ["Automatisations", "Déclenchez des communications récurrentes selon le cycle de vie client."]]),
    },
  },
  {
    slug: "analytics", section: "growth", imageSrc: "/Analytics Intelligence.png",
    content: {
      es: content("Analytics", "Convierte datos operativos en reportes, tendencias y comparativos para tomar decisiones.", "Analítica con indicadores, tendencias y reportes", [["KPIs por módulo", "Reúne indicadores relevantes de cada área en un tablero consistente."], ["Comparativos", "Contrasta periodos, sucursales o segmentos para entender variaciones."], ["Reportes exportables", "Genera archivos listos para compartir y continuar el análisis."]]),
      en: content("Analytics", "Turn operating data into reports, trends, and comparisons for better decisions.", "Analytics with indicators, trends, and reports", [["Module KPIs", "Bring relevant indicators from every area into one consistent dashboard."], ["Comparisons", "Compare periods, branches, or segments to understand changes."], ["Exportable reports", "Generate shareable files for reporting and continued analysis."]]),
      fr: content("Analytique", "Transformez les données opérationnelles en rapports, tendances et comparaisons utiles.", "Analytique avec indicateurs, tendances et rapports", [["Indicateurs par module", "Réunissez les indicateurs de chaque domaine dans un tableau cohérent."], ["Comparaisons", "Comparez périodes, sites ou segments pour comprendre les variations."], ["Rapports exportables", "Générez des fichiers partageables pour poursuivre l’analyse."]]),
    },
  },
] satisfies ModuleDefinition[];

const sectionOrder: SectionKey[] = ["operations", "logistics", "finance", "people", "growth"];

function resolveModule(definition: ModuleDefinition, locale: Locale): ModuleItem {
  const localizedContent = definition.content[locale];
  const [imageWidth, imageHeight] = imageDimensions[definition.slug as keyof typeof imageDimensions];
  return {
    slug: definition.slug,
    category: sectionLabels[locale][definition.section],
    imageSrc: definition.imageSrc,
    imageWidth,
    imageHeight,
    ...localizedContent,
    features: localizedContent.features.map((feature) => ({
      title: feature.title,
      description: feature.description,
    })),
  };
}

export const moduleSlugs = moduleDefinitions.map(({ slug }) => slug);

export function getMegaMenuSections(locale: Locale): ModuleSection[] {
  return sectionOrder.map((section) => ({
    title: sectionLabels[locale][section],
    items: moduleDefinitions
      .filter((definition) => definition.section === section)
      .map((definition) => resolveModule(definition, locale)),
  }));
}

export function getModules(locale: Locale): ModuleItem[] {
  return moduleDefinitions.map((definition) => resolveModule(definition, locale));
}

export function getModuleBySlug(slug: string, locale: Locale) {
  const definition = moduleDefinitions.find((module) => module.slug === slug);
  return definition ? resolveModule(definition, locale) : undefined;
}
