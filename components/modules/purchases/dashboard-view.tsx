"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCardSkeleton } from "@/components/skeletons";
import { 
  Truck, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckSquare, 
  Calendar, 
  ArrowRight
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DashboardStats, PendingInvoice, ReceivingQueueItem } from "./types";
import { toast } from "sonner";

interface DashboardViewProps {
  locale: Locale;
  stats: DashboardStats;
  pendingInvoices: PendingInvoice[];
  receivingQueue: ReceivingQueueItem[];
  isLoading?: boolean;
  onActionClick: (action: "register" | "search" | "reconcile") => void;
}

export function DashboardView({
  locale,
  stats,
  pendingInvoices,
  receivingQueue,
  isLoading = false,
  onActionClick,
}: DashboardViewProps) {
  const dictionary = {
    es: {
      quickActions: "Acciones Rápidas",
      quickActionsDesc: "Flujos operativos críticos accesibles con un solo clic.",
      actionRegister: "Nueva Orden de Compra",
      actionRegisterDesc: "Registrar un pedido y seleccionar proveedor.",
      actionSearch: "Consultar Catálogos",
      actionSearchDesc: "Buscar proveedores o revisar ítems de inventario.",
      actionReconcile: "Conciliar CxP",
      actionReconcileDesc: "Validar facturas contra material recibido.",
      metricsTitle: "Métricas Clave",
      metricsDesc: "Estado operativo y financiero del periodo actual.",
      invoicesMetric: "Facturas Próximas",
      invoicesDesc: "CxP en ventana de pago",
      receiptsMetric: "Recepciones",
      receiptsDesc: "Pedidos en tránsito",
      vendorsMetric: "Proveedores",
      vendorsDesc: "Activos en el periodo",
      criticalMetric: "Recepción Crítica",
      criticalDesc: "Diferencias por conciliar",
      pendingInvoicesTitle: "Datos Fiscales y Vencimientos",
      pendingInvoicesDesc: "Programación financiera e incidencias de cuentas por pagar.",
      receivingTitle: "Recepción en Almacén",
      receivingDesc: "Lista táctica para validación de ingresos físicos.",
      noInvoices: "No hay facturas pendientes",
      noReceiving: "No hay entregas programadas",
      viewAll: "Ver todo",
    },
    en: {
      quickActions: "Quick Actions",
      quickActionsDesc: "Critical operational workflows accessible with a single click.",
      actionRegister: "New Purchase Order",
      actionRegisterDesc: "Register a purchase order and select a vendor.",
      actionSearch: "Search Catalogs",
      actionSearchDesc: "Search vendors or check inventory items.",
      actionReconcile: "Reconcile AP",
      actionReconcileDesc: "Validate invoices against received materials.",
      metricsTitle: "Key Metrics",
      metricsDesc: "Operational and financial status for the current period.",
      invoicesMetric: "Upcoming Invoices",
      invoicesDesc: "AP in payment window",
      receiptsMetric: "Receiving",
      receiptsDesc: "Orders in transit",
      vendorsMetric: "Vendors",
      vendorsDesc: "Active in period",
      criticalMetric: "Critical Receipts",
      criticalDesc: "Variances to reconcile",
      pendingInvoicesTitle: "Tax Data and Due Dates",
      pendingInvoicesDesc: "Financial scheduling and accounts payable alerts.",
      receivingTitle: "Warehouse Receiving",
      receivingDesc: "Tactical checklist for physical warehouse validation.",
      noInvoices: "No pending invoices",
      noReceiving: "No scheduled deliveries",
      viewAll: "View all",
    },
    fr: {
      quickActions: "Actions Rapides",
      quickActionsDesc: "Flux opérationnels critiques accessibles en un clic.",
      actionRegister: "Nouveau Bon d'Achat",
      actionRegisterDesc: "Créer un bon de commande et choisir un fournisseur.",
      actionSearch: "Consulter Catalogues",
      actionSearchDesc: "Rechercher des fournisseurs ou des articles.",
      actionReconcile: "Rapprocher Factures",
      actionReconcileDesc: "Valider les factures face aux marchandises reçues.",
      metricsTitle: "Indicateurs Clés",
      metricsDesc: "Statut opérationnel et financier pour la période active.",
      invoicesMetric: "Factures à Venir",
      invoicesDesc: "Dettes dans la fenêtre de paiement",
      receiptsMetric: "Réceptions",
      receiptsDesc: "Commandes en transit",
      vendorsMetric: "Fournisseurs",
      vendorsDesc: "Actifs sur la période",
      criticalMetric: "Réception Critique",
      criticalDesc: "Écarts à rapprocher",
      pendingInvoicesTitle: "Données Fiscales et Échéances",
      pendingInvoicesDesc: "Calendrier financier et alertes de comptes fournisseurs.",
      receivingTitle: "Réceptions Magasin",
      receivingDesc: "Suivi tactique pour valider les entrées physiques.",
      noInvoices: "Aucune facture en attente",
      noReceiving: "Aucune livraison prévue",
      viewAll: "Voir tout",
    },
  };

  const t = dictionary[locale] || dictionary.es;

  const handleQuickAction = (action: "register" | "search" | "reconcile", label: string) => {
    toast.info(`Iniciando flujo: ${label}`);
    onActionClick(action);
  };

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN DE ACCIONES PRINCIPALES (UX de alta conversión sin saturar) */}
      <Card className="border-border/60 bg-card/65 glass-effect shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold tracking-tight">{t.quickActions}</CardTitle>
          <CardDescription>{t.quickActionsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Acción 1: Registrar */}
            <button
              onClick={() => handleQuickAction("register", t.actionRegister)}
              className="group relative flex flex-col items-start rounded-2xl border border-border/70 bg-background/50 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm cursor-pointer"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                <Plus className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{t.actionRegister}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">{t.actionRegisterDesc}</p>
              <span className="absolute bottom-4 right-4 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowRight className="size-4" />
              </span>
            </button>

            {/* Acción 2: Buscar */}
            <button
              onClick={() => handleQuickAction("search", t.actionSearch)}
              className="group relative flex flex-col items-start rounded-2xl border border-border/70 bg-background/50 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm cursor-pointer"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                <Search className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{t.actionSearch}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">{t.actionSearchDesc}</p>
              <span className="absolute bottom-4 right-4 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowRight className="size-4" />
              </span>
            </button>

            {/* Acción 3: Conciliar */}
            <button
              onClick={() => handleQuickAction("reconcile", t.actionReconcile)}
              className="group relative flex flex-col items-start rounded-2xl border border-border/70 bg-background/50 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm cursor-pointer"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                <CheckSquare className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{t.actionReconcile}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">{t.actionReconcileDesc}</p>
              <span className="absolute bottom-4 right-4 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowRight className="size-4" />
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. TABLERO DE MÉTRICAS (Con soporte para Loading Skeleton) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            {/* Facturas Próximas */}
            <Card className="border-border/60 bg-card/65 glass-effect transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.invoicesMetric}</p>
                  <p className="text-3xl font-bold text-foreground">{stats.upcomingInvoices}</p>
                  <p className="text-[11px] text-muted-foreground">{t.invoicesDesc}</p>
                </div>
                <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <CreditCard className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Recepciones en Tránsito */}
            <Card className="border-border/60 bg-card/65 glass-effect transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.receiptsMetric}</p>
                  <p className="text-3xl font-bold text-foreground">{stats.pendingReceipts}</p>
                  <p className="text-[11px] text-muted-foreground">{t.receiptsDesc}</p>
                </div>
                <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Truck className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Proveedores Activos */}
            <Card className="border-border/60 bg-card/65 glass-effect transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.vendorsMetric}</p>
                  <p className="text-3xl font-bold text-foreground">{stats.activeVendors}</p>
                  <p className="text-[11px] text-muted-foreground">{t.vendorsDesc}</p>
                </div>
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Users className="size-6" />
                </div>
              </CardContent>
            </Card>

            {/* Recepciones Críticas */}
            <Card className="border-border/60 bg-card/65 glass-effect transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.criticalMetric}</p>
                  <p className="text-3xl font-bold text-destructive">{stats.criticalReceipts}</p>
                  <p className="text-[11px] text-muted-foreground">{t.criticalDesc}</p>
                </div>
                <div className="size-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 animate-pulse">
                  <AlertTriangle className="size-6" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 3. PANELES DE CONTROL ADICIONALES (Vencimientos y Recepciones) */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Cuentas por pagar / Vencimientos */}
        <Card className="border-border/60 bg-card/65 glass-effect shadow-md flex flex-col justify-between">
          <div>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{t.pendingInvoicesTitle}</CardTitle>
              <CardDescription>{t.pendingInvoicesDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInvoices.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">{t.noInvoices}</div>
              ) : (
                <div className="space-y-3">
                  {pendingInvoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="group flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-4 transition-all duration-200 hover:bg-background/80 hover:shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{invoice.vendorName}</span>
                          <Badge 
                            variant={
                              invoice.status === "overdue" 
                                ? "destructive" 
                                : invoice.status === "paid"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px] py-0 px-2"
                          >
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {invoice.due}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(invoice.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
          <CardContent className="pt-0 border-t border-border/30 mt-4">
            <div className="flex justify-end pt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-semibold text-primary hover:bg-primary/5 cursor-pointer"
                onClick={() => onActionClick("reconcile")}
              >
                {t.viewAll} <ArrowRight className="ml-1 size-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recepción física en Almacén */}
        <Card className="border-border/60 bg-card/65 glass-effect shadow-md flex flex-col justify-between">
          <div>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{t.receivingTitle}</CardTitle>
              <CardDescription>{t.receivingDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {receivingQueue.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">{t.noReceiving}</div>
              ) : (
                <div className="space-y-3">
                  {receivingQueue.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 transition-all duration-200 hover:bg-background/80 hover:shadow-xs"
                    >
                      <div className="mt-0.5 rounded-lg bg-blue-500/10 p-2 text-blue-500">
                        <Truck className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground leading-normal">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
          <CardContent className="pt-0 border-t border-border/30 mt-4">
            <div className="flex justify-end pt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-semibold text-primary hover:bg-primary/5 cursor-pointer"
                onClick={() => onActionClick("register")}
              >
                {t.viewAll} <ArrowRight className="ml-1 size-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
