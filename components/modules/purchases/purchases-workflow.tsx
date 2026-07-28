"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, Users, PackageOpen, CreditCard, Truck, Eye, RefreshCw, AlertTriangle } from "lucide-react";
import type { Locale } from "@/lib/i18n";

// Sub-components
import { DashboardView } from "./dashboard-view";
import { VendorsView } from "./vendors-view";
import { OrdersView } from "./orders-view";
import { InvoicingView } from "./invoicing-view";

// Types
import type { 
  DashboardStats, 
  Vendor, 
  PurchaseOrder, 
  PendingInvoice, 
  ReceivingQueueItem, 
  InventoryImpact 
} from "./types";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ==========================================
// MOCK DATA SCHEMAS (Decoupled & Configurable)
// ==========================================
const mockStats: DashboardStats = {
  upcomingInvoices: 18,
  pendingReceipts: 7,
  activeVendors: 24,
  criticalReceipts: 3,
};

const mockVendors: Vendor[] = [
  {
    id: "v1",
    name: "Distribuidora Atlas S.A. de C.V.",
    category: "Nutrición y suplementos",
    contact: "Lic. Carlos Mendoza",
    taxId: "RFC: ALA-980421-9Z3",
    email: "ventas@atlas.mx",
    phone: "+52 55 4100 1290",
    history: "124 compras · 98.2% entregas a tiempo",
    otdRate: 98.2,
    activeIncidents: 0,
    purchaseCount: 124,
    paymentTerms: "PPD - 30 días",
  },
  {
    id: "v2",
    name: "Norte Industrial Consumibles",
    category: "Embalaje y consumibles",
    contact: "Ing. Sofia Perez",
    taxId: "RFC: NIN-140217-FR5",
    email: "compras@norteind.com",
    phone: "+52 81 2201 4410",
    history: "47 compras · 3 incidencias abiertas",
    otdRate: 88.5,
    activeIncidents: 3,
    purchaseCount: 47,
    paymentTerms: "PUE - Contado",
  },
  {
    id: "v3",
    name: "Distribuciones Delta S.A.",
    category: "Mantenimiento y Equipo",
    contact: "Roberto Ruiz",
    taxId: "RFC: DDE-160810-AB2",
    email: "soporte@delta.com",
    phone: "+52 33 1092 3840",
    history: "89 compras · 1 incidencia abierta",
    otdRate: 94.8,
    activeIncidents: 1,
    purchaseCount: 89,
    paymentTerms: "PPD - 15 días",
  },
];

const mockOrders: PurchaseOrder[] = [
  {
    id: "o1",
    poNumber: "OC-2026-001",
    vendorId: "v1",
    vendorName: "Distribuidora Atlas S.A. de C.V.",
    status: "received",
    date: "2026-07-08",
    itemsCount: 3,
    totalAmount: 172920,
    items: [
      {
        sku: "SUP-2048",
        item: "Proteína whey 2 kg",
        ordered: 120,
        received: 96,
        unitPrice: 1290,
        status: "partial",
        impact: "+96 stock",
      },
      {
        sku: "ACC-1155",
        item: "Botellas shaker",
        ordered: 300,
        received: 300,
        unitPrice: 48,
        status: "completed",
        impact: "+300 stock",
      },
      {
        sku: "CON-0302",
        item: "Cajas de cartón",
        ordered: 80,
        received: 0,
        unitPrice: 24,
        status: "pending",
        impact: "Sin impacto",
      },
    ],
  },
  {
    id: "o2",
    poNumber: "OC-2026-002",
    vendorId: "v2",
    vendorName: "Norte Industrial Consumibles",
    status: "draft",
    date: "2026-07-09",
    itemsCount: 1,
    totalAmount: 1750,
    items: [
      {
        sku: "PKG-9901",
        item: "Cinta de embalaje industrial",
        ordered: 50,
        received: 50,
        unitPrice: 35,
        status: "completed",
        impact: "+50 stock",
      },
    ],
  },
];

const mockInvoices: PendingInvoice[] = [
  {
    id: "i1",
    vendorName: "Distribuidora Atlas S.A. de C.V.",
    amount: 184200,
    due: "Vence en 4 días",
    status: "overdue",
  },
  {
    id: "i2",
    vendorName: "Norte Industrial Consumibles",
    amount: 63480,
    due: "Vence mañana",
    status: "draft",
  },
  {
    id: "i3",
    vendorName: "Distribuciones Delta S.A.",
    amount: 91730,
    due: "Vence en 12 días",
    status: "received",
  },
];

const mockReceivingQueue: ReceivingQueueItem[] = [
  {
    id: "q1",
    label: "Camión de nutrientes (Atlas)",
    detail: "Recepción prevista 14:30 · Andén 02 · Custodia de andén",
  },
  {
    id: "q2",
    label: "Pedido de accesorios (Norte Ind.)",
    detail: "Recepción prevista hoy · Validación de empaquetado secundario",
  },
  {
    id: "q3",
    label: "Material de oficina (Delta)",
    detail: "Recepción prevista mañana · Orden parcial de insumos",
  },
];

const mockStockImpact: InventoryImpact[] = [
  { label: "Almacén Centro", value: "+396 unidades" },
  { label: "Almacén Norte", value: "+80 unidades" },
  { label: "Reservas en tránsito", value: "24 unidades" },
];

export function PurchasesWorkflow({ locale }: { locale: Locale }) {
  // ==========================================
  // CONFIGURACIÓN DE ESTADOS SIMULADOS DE UI
  // ==========================================
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // ==========================================
  // ESTADOS MOCK INTERACTIVOS (Para que la vista sea funcional)
  // ==========================================
  const [vendorsList, setVendorsList] = useState<Vendor[]>(mockVendors);
  const [vendorSearchQuery, setVendorSearchQuery] = useState<string>("");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const [ordersList, setOrdersList] = useState<PurchaseOrder[]>(mockOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("o1");

  const [invoicesList, setInvoicesList] = useState<PendingInvoice[]>(mockInvoices);

  // ==========================================
  // GUÍA DE INYECCIÓN DE LÓGICA
  // ==========================================
  /*
    // TODO: Conectar aquí con el hook usePurchasesData
    // Ejemplo:
    const { 
      data: purchasesData, 
      isLoading: isFetching, 
      error, 
      refetch 
    } = usePurchasesData({ locale, queryParams });
    
    // TODO: Conectar aquí con las mutaciones de API
    // Ejemplo:
    const updateReceivedQtyMutation = useMutation({
      mutationFn: ({ sku, qty }) => patchReceivedQuantity(sku, qty),
      onSuccess: () => refetch()
    });
  */

  // Handler for updating received quantities in real-time
  const handleItemReceivedQtyChange = (sku: string, qty: number) => {
    // Local update to keep UI interactive
    setOrdersList((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== selectedOrderId) return order;
        return {
          ...order,
          items: order.items.map((item) => {
            if (item.sku !== sku) return item;
            return {
              ...item,
              received: qty,
              status: qty === item.ordered ? "completed" : "partial",
            };
          }),
        };
      })
    );

    // TODO: Inyectar mutación de API aquí
    // updateReceivedQtyMutation.mutate({ sku, qty });
  };

  // Actions trigger simulated state modifications
  const handleApproveInvoice = (invoiceId: string) => {
    setInvoicesList((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv))
    );
    // TODO: Conectar con API para aprobar la CxP (Accounts Payable approval call)
  };

  const handleRegisterPayment = (invoiceId: string) => {
    setInvoicesList((prev) => prev.filter((inv) => inv.id !== invoiceId));
    // TODO: Conectar con API para registrar pago (Post cashflow outcome)
  };

  const handleDashboardActionClick = (action: "register" | "search" | "reconcile") => {
    if (action === "register") {
      setActiveTab("orders");
    } else if (action === "search") {
      setActiveTab("vendors");
    } else if (action === "reconcile") {
      setActiveTab("invoicing");
    }
  };

  // UI state toggles for development demo
  const triggerDevToast = (state: string) => {
    toast.success(`Estado visual cambiado: ${state}`);
  };

  return (
    <section className="erp-section space-y-6" role="main" aria-label="Módulo de Compras">
      {/* Dev Controller Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Eye className="size-4 animate-pulse" />
          <span>CONTROLES DE ARQUITECTO (DEMO DE ESTADOS VISUALES)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="xs"
            variant={isLoading ? "default" : "outline"}
            className="text-[10px] h-7 font-bold cursor-pointer"
            onClick={() => {
              setIsLoading(!isLoading);
              triggerDevToast(`isLoading = ${!isLoading}`);
            }}
          >
            <RefreshCw className={`mr-1 size-3 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Cargando (ON)" : "Simular Carga"}
          </Button>

          <Button
            size="xs"
            variant={isEmpty ? "default" : "outline"}
            className="text-[10px] h-7 font-bold cursor-pointer"
            onClick={() => {
              setIsEmpty(!isEmpty);
              triggerDevToast(`isEmpty = ${!isEmpty}`);
            }}
          >
            {isEmpty ? "Sin Datos (ON)" : "Simular Vacío"}
          </Button>

          <Button
            size="xs"
            variant={isError ? "default" : "outline"}
            className="text-[10px] h-7 font-bold border-rose-500/40 hover:bg-rose-500/5 text-rose-500 cursor-pointer"
            onClick={() => {
              setIsError(!isError);
              triggerDevToast(`isError = ${!isError}`);
            }}
          >
            <AlertTriangle className="mr-1 size-3" />
            {isError ? "Error (ON)" : "Simular Error"}
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {isError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-600 dark:text-rose-400 shadow-sm">
          <AlertTriangle className="size-5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <h4 className="font-bold">Error de Conexión en Base de Datos de Abastecimiento</h4>
            <p className="leading-relaxed">No se pudo restablecer la sincronización con el servidor de inventario consolidado. Los datos mostrados corresponden al almacenamiento local en caché.</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4">
        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-foreground">
          <Truck className="size-8 text-primary" aria-hidden="true" />
          {locale === "es" ? "Compras y Abastecimiento" : locale === "fr" ? "Achats et Approvisionnement" : "Purchasing & Supply"}
        </h1>
        <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
          Flujo trazable para registrar proveedores, conciliar recepciones físicas de mercancía contra órdenes de compra y validar facturación fiscal para cuentas por pagar (CxP).
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 !h-auto sm:!h-11 bg-muted/50 p-1.5 rounded-2xl border border-border/60">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold cursor-pointer transition-all duration-200"
          >
            <LayoutDashboard className="size-4 shrink-0" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="vendors" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold cursor-pointer transition-all duration-200"
          >
            <Users className="size-4 shrink-0" />
            <span>Proveedores</span>
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold cursor-pointer transition-all duration-200"
          >
            <PackageOpen className="size-4 shrink-0" />
            <span>Órdenes & Almacén</span>
          </TabsTrigger>
          <TabsTrigger 
            value="invoicing" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold cursor-pointer transition-all duration-200"
          >
            <CreditCard className="size-4 shrink-0" />
            <span>Facturación (CxP)</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Dashboard View */}
        <TabsContent value="dashboard" className="space-y-4 focus-visible:outline-none">
          <DashboardView
            locale={locale}
            stats={isEmpty ? { upcomingInvoices: 0, pendingReceipts: 0, activeVendors: 0, criticalReceipts: 0 } : mockStats}
            pendingInvoices={isEmpty ? [] : invoicesList}
            receivingQueue={isEmpty ? [] : mockReceivingQueue}
            isLoading={isLoading}
            onActionClick={handleDashboardActionClick}
          />
        </TabsContent>

        {/* TAB 2: Vendors View */}
        <TabsContent value="vendors" className="space-y-4 focus-visible:outline-none">
          <VendorsView
            locale={locale}
            vendors={isEmpty ? [] : vendorsList}
            searchQuery={vendorSearchQuery}
            onSearchChange={setVendorSearchQuery}
            selectedVendorId={selectedVendorId}
            onSelectVendor={setSelectedVendorId}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* TAB 3: Orders & Stock View */}
        <TabsContent value="orders" className="space-y-4 focus-visible:outline-none">
          <OrdersView
            locale={locale}
            orders={isEmpty ? [] : ordersList}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            onItemReceivedQtyChange={handleItemReceivedQtyChange}
            onRegisterReceipt={() => toast.success("Se envió registro físico a Inventarios")}
            stockImpact={isEmpty ? [] : mockStockImpact}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* TAB 4: Invoicing & AP View */}
        <TabsContent value="invoicing" className="space-y-4 focus-visible:outline-none">
          <InvoicingView
            locale={locale}
            invoices={isEmpty ? [] : invoicesList}
            subtotal={isEmpty ? 0 : 238900}
            taxRate={0.16}
            discounts={isEmpty ? 0 : 9120}
            withholdings={isEmpty ? 0 : 3420}
            onApproveInvoice={handleApproveInvoice}
            onRegisterPayment={handleRegisterPayment}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}