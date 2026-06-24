import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/lib/i18n";

type PurchaseStatus = "draft" | "received" | "paid" | "overdue";

type PurchaseLocaleCopy = {
  title: string;
  subtitle: string;
  stepLabel: string;
  vendorTitle: string;
  itemsTitle: string;
  summaryTitle: string;
  impactTitle: string;
  actionTitle: string;
  actionSubtitle: string;
  dashboardTitle: string;
  dashboardDescription: string;
};

const copy: Record<Locale, PurchaseLocaleCopy> = {
  es: {
    title: "Compras y abastecimiento",
    subtitle:
      "Flujo trazable para registrar proveedor, capturar ítems, recibir mercancía y dejar lista la cuenta por pagar.",
    stepLabel: "Etapa actual",
    vendorTitle: "Selección de proveedor",
    itemsTitle: "Detalle de compra y recepción",
    summaryTitle: "Resumen de facturación y CxP",
    impactTitle: "Impacto en inventario",
    actionTitle: "Panel de acciones",
    actionSubtitle: "Decisiones rápidas sin perder trazabilidad contable ni de almacén.",
    dashboardTitle: "Dashboard de compras",
    dashboardDescription:
      "Lectura ejecutiva de lo que vence, lo que llega y lo que todavía está en validación.",
  },
  en: {
    title: "Purchasing and supply",
    subtitle:
      "Traceable flow to select the vendor, capture items, receive goods, and prepare accounts payable.",
    stepLabel: "Current stage",
    vendorTitle: "Vendor selection",
    itemsTitle: "Purchase detail and receiving",
    summaryTitle: "Invoicing and AP summary",
    impactTitle: "Inventory impact",
    actionTitle: "Action panel",
    actionSubtitle: "Quick decisions without losing accounting or warehouse traceability.",
    dashboardTitle: "Purchasing dashboard",
    dashboardDescription:
      "Executive reading of what is due, what is arriving, and what is still under validation.",
  },
  fr: {
    title: "Achats et approvisionnement",
    subtitle:
      "Flux traçable pour choisir le fournisseur, saisir les lignes, réceptionner la marchandise et préparer le compte fournisseur.",
    stepLabel: "Étape actuelle",
    vendorTitle: "Sélection du fournisseur",
    itemsTitle: "Détail d'achat et réception",
    summaryTitle: "Synthèse facturation et dettes",
    impactTitle: "Impact sur le stock",
    actionTitle: "Panneau d'actions",
    actionSubtitle:
      "Décisions rapides sans perdre la traçabilité comptable ni magasin.",
    dashboardTitle: "Tableau de bord des achats",
    dashboardDescription:
      "Lecture exécutive de ce qui est dû, de ce qui arrive et de ce qui reste à valider.",
  },
};

const workflowSteps = [
  {
    id: "supplier",
    label: { es: "Proveedor", en: "Vendor", fr: "Fournisseur" },
    description: {
      es: "Buscar, validar datos fiscales y abrir el contexto de compra.",
      en: "Search, validate tax data, and open the purchase context.",
      fr: "Rechercher, valider les données fiscales et ouvrir le contexte d'achat.",
    },
  },
  {
    id: "items",
    label: { es: "Ítems", en: "Items", fr: "Lignes" },
    description: {
      es: "Registrar cantidades pedidas y recibidas con seguimiento de diferencias.",
      en: "Register ordered and received quantities with variance tracking.",
      fr: "Saisir les quantités commandées et reçues avec suivi des écarts.",
    },
  },
  {
    id: "posting",
    label: { es: "CxP", en: "AP", fr: "Dettes" },
    description: {
      es: "Cerrar la factura, revisar vencimientos y dejar listo el registro contable.",
      en: "Close the invoice, review due dates, and prepare the accounting entry.",
      fr: "Clôturer la facture, revoir les échéances et préparer l'écriture.",
    },
  },
] as const;

const supplierCards = [
  {
    name: "Distribuidora Atlas",
    category: "Nutrición y suplementos",
    contact: "ventas@atlas.mx · +52 55 4100 1290",
    taxId: "RFC: ALA-980421-9Z3",
    history: "124 compras · 98.2% entregas a tiempo",
  },
  {
    name: "Norte Industrial",
    category: "Embalaje y consumibles",
    contact: "compras@norteind.com · +52 81 2201 4410",
    taxId: "RFC: NIN-140217-FR5",
    history: "47 compras · 3 incidencias abiertas",
  },
];

const purchaseRows = [
  {
    sku: "SUP-2048",
    item: "Proteína whey 2 kg",
    ordered: "120",
    received: "96",
    unit: "$1,290",
    line: "Recibido parcial",
    impact: "+96 stock",
  },
  {
    sku: "ACC-1155",
    item: "Botellas shaker",
    ordered: "300",
    received: "300",
    unit: "$48",
    line: "Recibido completo",
    impact: "+300 stock",
  },
  {
    sku: "CON-0302",
    item: "Cajas de cartón",
    ordered: "80",
    received: "0",
    unit: "$24",
    line: "Pendiente recepción",
    impact: "Sin impacto",
  },
];

const pendingInvoices = [
  {
    vendor: "Distribuidora Atlas",
    amount: "$184,200",
    due: "Vence en 4 días",
    status: "overdue" as const,
  },
  {
    vendor: "Norte Industrial",
    amount: "$63,480",
    due: "Vence mañana",
    status: "draft" as const,
  },
  {
    vendor: "Distribuciones Delta",
    amount: "$91,730",
    due: "Vence en 12 días",
    status: "received" as const,
  },
];

const receivingQueue = [
  {
    label: "Camión de nutrientes",
    detail: "Recepción prevista 14:30 · Andén 02",
  },
  {
    label: "Pedido de accesorios",
    detail: "Recepción prevista hoy · Validación de empaque",
  },
  {
    label: "Material de oficina",
    detail: "Recepción prevista mañana · Orden parcial",
  },
];

const impactRows = [
  { label: "Almacén Centro", value: "+396 unidades" },
  { label: "Almacén Norte", value: "+80 unidades" },
  { label: "Reservas en tránsito", value: "24 unidades" },
];

function statusTone(status: PurchaseStatus) {
  switch (status) {
    case "draft":
      return "outline" as const;
    case "received":
      return "secondary" as const;
    case "paid":
      return "default" as const;
    case "overdue":
      return "destructive" as const;
  }
}

function StatusBadge({ status, locale }: { status: PurchaseStatus; locale: Locale }) {
  const labels: Record<Locale, Record<PurchaseStatus, string>> = {
    es: {
      draft: "Borrador",
      received: "Recibida",
      paid: "Pagada",
      overdue: "Vencida",
    },
    en: {
      draft: "Draft",
      received: "Received",
      paid: "Paid",
      overdue: "Overdue",
    },
    fr: {
      draft: "Brouillon",
      received: "Reçue",
      paid: "Payée",
      overdue: "En retard",
    },
  };

  return <Badge variant={statusTone(status)}>{labels[locale][status]}</Badge>;
}

function StepIndicator({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {workflowSteps.map((step, index) => {
        const isLast = index === workflowSteps.length - 1;

        return (
          <div
            key={step.id}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xs ring-1 ring-foreground/5"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{step.label[locale]}</p>
                <p className="text-xs leading-5 text-muted-foreground">{step.description[locale]}</p>
              </div>
            </div>
            {!isLast ? <div className="absolute right-0 top-1/2 hidden h-px w-8 bg-border md:block" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function VendorCard({ name, category, contact, taxId, history }: (typeof supplierCards)[number]) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xs ring-1 ring-foreground/5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
        <Badge variant="outline">Proveedor</Badge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Contacto</dt>
          <dd className="text-foreground">{contact}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Fiscal</dt>
          <dd className="text-foreground">{taxId}</dd>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Historial</dt>
          <dd className="text-foreground">{history}</dd>
        </div>
      </dl>
    </article>
  );
}

function VendorSearchPanel({ locale }: { locale: Locale }) {
  const labels = {
    es: { search: "Buscar proveedor", hint: "Nombre, RFC o correo" },
    en: { search: "Search vendor", hint: "Name, tax ID, or email" },
    fr: { search: "Rechercher un fournisseur", hint: "Nom, numéro fiscal ou email" },
  };

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>{copy[locale].vendorTitle}</CardTitle>
        <CardDescription>
          {labels[locale].search} · {labels[locale].hint}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.95fr)]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground shadow-xs">
              {labels[locale].search}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">RFC</Badge>
              <Badge variant="secondary">Contacto</Badge>
              <Badge variant="secondary">Condición de pago</Badge>
              <Badge variant="secondary">Última compra</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{copy[locale].stepLabel}</p>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-xs">
              {workflowSteps[0].label[locale]}
            </div>
            <div className="text-sm text-muted-foreground">{workflowSteps[0].description[locale]}</div>
          </div>
        </div>

        <div className="grid gap-3">
          {supplierCards.map((supplier) => (
            <VendorCard key={supplier.name} {...supplier} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PurchaseItemsList({ locale }: { locale: Locale }) {
  const labels = {
    es: {
      ordered: "Pedida",
      received: "Recibida",
      unit: "Costo unitario",
      line: "Estado de línea",
      impact: "Impacto",
    },
    en: {
      ordered: "Ordered",
      received: "Received",
      unit: "Unit cost",
      line: "Line status",
      impact: "Impact",
    },
    fr: {
      ordered: "Commandée",
      received: "Reçue",
      unit: "Coût unitaire",
      line: "Statut",
      impact: "Impact",
    },
  };

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>{copy[locale].itemsTitle}</CardTitle>
        <CardDescription>
          Edita visualmente la diferencia entre cantidad pedida y cantidad recibida.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Ítem</TableHead>
                <TableHead>{labels[locale].ordered}</TableHead>
                <TableHead>{labels[locale].received}</TableHead>
                <TableHead>{labels[locale].unit}</TableHead>
                <TableHead>{labels[locale].line}</TableHead>
                <TableHead>{labels[locale].impact}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseRows.map((row) => (
                <TableRow key={row.sku}>
                  <TableCell className="font-medium text-foreground">{row.sku}</TableCell>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>
                    <div className="min-w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs">
                      {row.ordered}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs">
                      {row.received}
                    </div>
                  </TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.line}</Badge>
                  </TableCell>
                  <TableCell>{row.impact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {purchaseRows.map((row) => (
            <div key={row.sku} className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{row.item}</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {row.ordered} pedidas · {row.received} recibidas
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{row.line}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InvoicingSummary({ locale }: { locale: Locale }) {
  const lines = [
    { label: { es: "Subtotal base", en: "Base subtotal", fr: "Sous-total base" }, value: "$238,900" },
    { label: { es: "Impuestos", en: "Taxes", fr: "Taxes" }, value: "$38,224" },
    { label: { es: "Descuentos", en: "Discounts", fr: "Remises" }, value: "-$9,120" },
    { label: { es: "Retenciones", en: "Withholdings", fr: "Retenues" }, value: "$3,420" },
  ] as const;

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>{copy[locale].summaryTitle}</CardTitle>
        <CardDescription>
          Panel de lectura rápida para cerrar la orden y registrar la cuenta por pagar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
          {lines.map((line) => (
            <div key={line.label.es} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{line.label[locale]}</span>
              <span className="font-medium text-foreground">{line.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
            <span className="text-foreground">Total a pagar</span>
            <span className="text-foreground">$271,424</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">CxP</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Pendiente de aprobación</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vencimiento</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Próxima semana</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Documento</p>
            <p className="mt-2 text-sm font-semibold text-foreground">Factura proveedor</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockImpactView({ locale }: { locale: Locale }) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>{copy[locale].impactTitle}</CardTitle>
        <CardDescription>
          Vista previa de cómo la compra afectará existencias y reservas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {impactRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-sm"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium text-foreground">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TaxInvoicePanel() {
  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>Datos fiscales y vencimientos</CardTitle>
        <CardDescription>
          Concentrado de CxP y programación financiera para tesorería.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {pendingInvoices.map((invoice) => (
            <div key={invoice.vendor} className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{invoice.vendor}</p>
                  <p className="text-xs text-muted-foreground">{invoice.due}</p>
                </div>
                <StatusBadge status={invoice.status} locale="es" />
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">{invoice.amount}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Calendario de pago</p>
          <div className="mt-3 space-y-2 text-sm text-foreground">
            <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 shadow-xs">
              <span>Lunes</span>
              <span>$84,200</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 shadow-xs">
              <span>Miércoles</span>
              <span>$63,480</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 shadow-xs">
              <span>Viernes</span>
              <span>$91,730</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReceivingTable() {
  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>Recepción en almacén</CardTitle>
        <CardDescription>
          Lista táctica para validar recepción física, ubicación y faltantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          {receivingQueue.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSummary({ locale }: { locale: Locale }) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2">
        <CardTitle>{copy[locale].dashboardTitle}</CardTitle>
        <CardDescription>{copy[locale].dashboardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Facturas próximas</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">18</p>
          <p className="mt-1 text-sm text-muted-foreground">CxP en ventana de pago</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recepciones</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">7</p>
          <p className="mt-1 text-sm text-muted-foreground">Pedidos en tránsito</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Proveedores</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">24</p>
          <p className="mt-1 text-sm text-muted-foreground">Activos en el periodo</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recepción crítica</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">3</p>
          <p className="mt-1 text-sm text-muted-foreground">Con diferencia pendiente</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PurchasesWorkflow({ locale }: { locale: Locale }) {
  return (
    <section className="erp-section space-y-6" role="main" aria-label={copy[locale].title}>
      <div className="overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(2,48,71,0.06),rgba(251,133,0,0.08),rgba(255,255,255,0.78))] p-6 shadow-sm ring-1 ring-foreground/5 dark:bg-[linear-gradient(135deg,rgba(2,48,71,0.22),rgba(251,133,0,0.16),rgba(15,23,42,0.88))] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Supply Chain</Badge>
              <Badge variant="outline">CxP</Badge>
              <Badge variant="outline">Recepción</Badge>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {copy[locale].title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {copy[locale].subtitle}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3 shadow-xs backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy[locale].stepLabel}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {workflowSteps[0].label[locale]} → {workflowSteps[1].label[locale]} → {workflowSteps[2].label[locale]}
            </p>
          </div>
        </div>
      </div>

      <DashboardSummary locale={locale} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <StepIndicator locale={locale} />
          <VendorSearchPanel locale={locale} />
          <PurchaseItemsList locale={locale} />
          <ReceivingTable />
          <StockImpactView locale={locale} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
            <CardHeader className="space-y-2">
              <CardTitle>{copy[locale].actionTitle}</CardTitle>
              <CardDescription>{copy[locale].actionSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button type="button" className="w-full rounded-xl bg-primary px-4 py-3 text-left text-sm font-medium text-primary-foreground shadow-xs">
                Guardar borrador
              </button>
              <button type="button" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground shadow-xs">
                Marcar recepción
              </button>
              <button type="button" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground shadow-xs">
                Finalizar compra
              </button>
            </CardContent>
          </Card>

          <InvoicingSummary locale={locale} />
          <TaxInvoicePanel />

          <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
            <CardHeader className="space-y-2">
              <CardTitle>Perfil del proveedor</CardTitle>
              <CardDescription>Historial, trazabilidad fiscal y contacto en una sola vista.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
                <p className="text-sm font-semibold text-foreground">Distribuidora Atlas</p>
                <p className="mt-1 text-sm text-muted-foreground">RFC ALA-980421-9Z3 · ventas@atlas.mx</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Compras</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">124</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">OTD</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">98.2%</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-xs">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Incidencias</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </section>
  );
}