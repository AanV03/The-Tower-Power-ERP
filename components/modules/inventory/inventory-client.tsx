"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Package,
  Layers,
  ArrowRightLeft,
  Warehouse,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  KanbanSquare,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { MetricCard } from "@/components/shared/metric-card";
import { MovementFormDialog } from "./movement-form-dialog";
import type { Locale } from "@/lib/i18n";
import { BranchScopeSelector } from "@/components/shared/branch-scope-selector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SerializedItem = {
  id: string;
  warehouseId: string;
  warehouseName: string;
  branchName: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityOnHand: number;
  reorderPoint: number;
  updatedAt: string;
};

type SerializedMovement = {
  id: string;
  warehouseName: string;
  productName: string;
  productSku: string;
  type: string;
  quantity: number;
  unitCost: number | null;
  sourceType: string;
  sourceId: string;
  createdAt: string;
};

type SerializedWarehouse = {
  id: string;
  name: string;
  branchName: string;
  branchId: string;
  createdAt: string;
};

type SerializedProduct = {
  id: string;
  name: string;
  sku: string;
};

type SerializedBranch = {
  id: string;
  name: string;
};

const inventoryLabels = {
  es: {
    title: "Inventario y Existencias",
    subtitle: "Administra el stock físico de productos, registra movimientos (kardex) y gestiona los almacenes de tus sucursales.",
    totalStock: "Total Existencias",
    totalStockDesc: "Productos en mano",
    warehouses: "Almacenes",
    warehousesDesc: "Bodegas registradas",
    criticalAlerts: "Stock Crítico",
    criticalAlertsDesc: "En o por debajo de reorden",
    
    // Tabs
    stockTab: "Existencias",
    movementsTab: "Movimientos",
    warehousesTab: "Almacenes",
    chartsTab: "Gráficos y Analítica",

    // View modes
    listView: "Lista",
    kanbanView: "Tablero Kanban",

    // Kanban Columns
    stockNormal: "Stock Suficiente",
    stockLow: "Stock Bajo (Reorden)",
    stockEmpty: "Sin Existencias",
    
    // Table/Forms Headers
    product: "Producto",
    sku: "SKU",
    warehouse: "Almacén",
    branch: "Sucursal",
    quantity: "Cantidad",
    reorderPoint: "Punto de Reorden",
    lastUpdated: "Última Actualización",
    status: "Estado",
    action: "Acciones",
    cost: "Costo Unitario",
    date: "Fecha",
    type: "Tipo",
    source: "Origen",
    sourceId: "Referencia",
    createdAt: "Fecha Registro",

    // Movement types labels
    PURCHASE: "Compra",
    SALE: "Venta",
    TRANSFER_IN: "Traspaso Recibido (+)",
    TRANSFER_OUT: "Traspaso Enviado (-)",
    ADJUSTMENT: "Ajuste",
    SHRINKAGE: "Merma / Pérdida",

    // Placeholders/Empty states
    searchPlaceholder: "Buscar por producto, SKU o almacén...",
    filterWarehouse: "Filtrar por Almacén",
    filterProduct: "Filtrar por Producto",
    filterType: "Filtrar por Tipo",
    all: "Todos",
    emptyStock: "No hay productos en stock que coincidan con los filtros.",
    emptyMovements: "No se registran movimientos de inventario.",
    emptyWarehouses: "No hay almacenes registrados.",
    
    // Buttons
    prev: "Anterior",
    next: "Siguiente",
  },
  en: {
    title: "Inventory & Stock",
    subtitle: "Manage physical product stock, record movements (kardex), and configure your branch warehouses.",
    totalStock: "Total Stock",
    totalStockDesc: "Products on hand",
    warehouses: "Warehouses",
    warehousesDesc: "Registered warehouses",
    criticalAlerts: "Critical Stock",
    criticalAlertsDesc: "At or below reorder",
    stockTab: "Stock",
    movementsTab: "Movements",
    warehousesTab: "Warehouses",
    chartsTab: "Analytics & Charts",
    listView: "List",
    kanbanView: "Kanban Board",
    stockNormal: "Sufficient Stock",
    stockLow: "Low Stock (Reorder)",
    stockEmpty: "Out of Stock",
    product: "Product",
    sku: "SKU",
    warehouse: "Warehouse",
    branch: "Branch",
    quantity: "Quantity",
    reorderPoint: "Reorder Point",
    lastUpdated: "Last Updated",
    status: "Status",
    action: "Actions",
    cost: "Unit Cost",
    date: "Date",
    type: "Type",
    source: "Source",
    sourceId: "Reference",
    createdAt: "Created At",
    PURCHASE: "Purchase",
    SALE: "Sale",
    TRANSFER_IN: "Transfer In (+)",
    TRANSFER_OUT: "Transfer Out (-)",
    ADJUSTMENT: "Adjustment",
    SHRINKAGE: "Shrinkage",
    searchPlaceholder: "Search by product, SKU, or warehouse...",
    filterWarehouse: "Filter by Warehouse",
    filterProduct: "Filter by Product",
    filterType: "Filter by Type",
    all: "All",
    emptyStock: "No stock items match the filters.",
    emptyMovements: "No inventory movements recorded.",
    emptyWarehouses: "No warehouses registered.",
    prev: "Previous",
    next: "Next",
  },
  fr: {
    title: "Inventaire et Stocks",
    subtitle: "Gérez le stock de produits physiques, enregistrez les mouvements et configurez vos entrepôts.",
    totalStock: "Stock Total",
    totalStockDesc: "Produits en main",
    warehouses: "Entrepôts",
    warehousesDesc: "Entrepôts enregistrés",
    criticalAlerts: "Stock Critique",
    criticalAlertsDesc: "Au niveau ou sous le réappro",
    stockTab: "Stocks",
    movementsTab: "Mouvements",
    warehousesTab: "Entrepôts",
    chartsTab: "Analyses & Graphiques",
    listView: "Liste",
    kanbanView: "Tableau Kanban",
    stockNormal: "Stock Suffisant",
    stockLow: "Stock Bas (Réappro)",
    stockEmpty: "Rupture de Stock",
    product: "Produit",
    sku: "SKU",
    warehouse: "Entrepôt",
    branch: "Succursale",
    quantity: "Quantité",
    reorderPoint: "Seuil d'Alerte",
    lastUpdated: "Dernière MÀJ",
    status: "Statut",
    action: "Actions",
    cost: "Coût Unitaire",
    date: "Date",
    type: "Type",
    source: "Origine",
    sourceId: "Référence",
    createdAt: "Créé Le",
    PURCHASE: "Achat",
    SALE: "Vente",
    TRANSFER_IN: "Transfert Reçu (+)",
    TRANSFER_OUT: "Transfert Envoyé (-)",
    ADJUSTMENT: "Ajustement",
    SHRINKAGE: "Perte / Déchet",
    searchPlaceholder: "Rechercher par produit, SKU ou entrepôt...",
    filterWarehouse: "Filtrer par Entrepôt",
    filterProduct: "Filtrer par Produit",
    filterType: "Filtrer par Type",
    all: "Tous",
    emptyStock: "Aucun article de stock ne correspond aux filtres.",
    emptyMovements: "Aucun mouvement de stock enregistré.",
    emptyWarehouses: "Aucun entrepôt enregistré.",
    prev: "Précédent",
    next: "Suivant",
  },
};

export function InventoryClient({
  locale,
  initialItems,
  initialMovements,
  initialWarehouses,
  products,
  metrics,
}: {
  locale: Locale;
  initialItems: SerializedItem[];
  initialMovements: SerializedMovement[];
  initialWarehouses: SerializedWarehouse[];
  products: SerializedProduct[];
  metrics: {
    totalStock: number;
    warehousesCount: number;
    criticalAlerts: number;
  };
}) {
  const t = inventoryLabels[locale] ?? inventoryLabels.es;
  const router = useRouter();

  // Local state for stock items (to support optimistic updates on Kanban drag-and-drop)
  const [items, setItems] = useState<SerializedItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleCardDrop = async (itemId: string, targetStatus: "empty" | "low" | "normal") => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    let originalStatus: "empty" | "low" | "normal" = "normal";
    if (item.quantityOnHand === 0) {
      originalStatus = "empty";
    } else if (item.quantityOnHand <= item.reorderPoint) {
      originalStatus = "low";
    }

    if (originalStatus === targetStatus) return;

    let targetQuantity = 0;
    if (targetStatus === "empty") {
      targetQuantity = 0;
    } else if (targetStatus === "low") {
      targetQuantity = item.reorderPoint > 0 ? item.reorderPoint : 1;
    } else {
      targetQuantity = item.reorderPoint > 0 ? item.reorderPoint + 10 : 10;
    }

    const diff = targetQuantity - item.quantityOnHand;
    if (diff === 0) return;

    const movementType = diff > 0 ? "ADJUSTMENT" : "SHRINKAGE";
    const adjustQty = Math.abs(diff);

    // Optimistic Update
    const previousItems = [...items];
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantityOnHand: targetQuantity } : i))
    );

    const toastId = toast.loading("Actualizando existencias...");

    try {
      const res = await fetch("/api/warehouse/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          warehouseId: item.warehouseId,
          type: movementType,
          quantity: adjustQty,
          unitCost: 0,
          sourceType: "Ajuste por arrastre (Kanban)",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al registrar movimiento");
      }

      toast.success("Existencias actualizadas correctamente", { id: toastId });
      router.refresh();
    } catch (err: any) {
      setItems(previousItems);
      toast.error(err.message || "Error al actualizar existencias", { id: toastId });
    }
  };

  // Search & Navigation States
  const [activeTab, setActiveTab] = useState("stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [mounted, setMounted] = useState(false);

  // Mobile Pagination states
  const [stockPage, setStockPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [warehousePage, setWarehousePage] = useState(1);

  // Mount logic for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset pagination on search query or tab change
  useEffect(() => {
    setStockPage(1);
    setMovementPage(1);
    setWarehousePage(1);
  }, [searchQuery, selectedWarehouse, selectedProduct, selectedType, activeTab]);

  // Filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWarehouse = !selectedWarehouse || item.warehouseId === selectedWarehouse;
      const matchesProduct = !selectedProduct || item.productId === selectedProduct;
      return matchesSearch && matchesWarehouse && matchesProduct;
    });
  }, [items, searchQuery, selectedWarehouse, selectedProduct]);

  const filteredMovements = useMemo(() => {
    return initialMovements.filter((m) => {
      const matchesSearch =
        m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWarehouse =
        !selectedWarehouse ||
        m.warehouseName === initialWarehouses.find((w) => w.id === selectedWarehouse)?.name;
      const matchesProduct =
        !selectedProduct || m.productSku === products.find((p) => p.id === selectedProduct)?.sku;
      const matchesType = !selectedType || m.type === selectedType;
      return matchesSearch && matchesWarehouse && matchesProduct && matchesType;
    });
  }, [initialMovements, searchQuery, selectedWarehouse, selectedProduct, selectedType, initialWarehouses, products]);

  const filteredWarehouses = useMemo(() => {
    return initialWarehouses.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.branchName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWarehouse = !selectedWarehouse || w.id === selectedWarehouse;
      return matchesSearch && matchesWarehouse;
    });
  }, [initialWarehouses, searchQuery, selectedWarehouse]);

  // Pagination Calculations
  const [stockPageSize, setStockPageSize] = useState(5);
  const [movementPageSize, setMovementPageSize] = useState(5);

  const totalStockPages = Math.ceil(filteredItems.length / stockPageSize);
  const paginatedItems = useMemo(() => {
    const startIndex = (stockPage - 1) * stockPageSize;
    return filteredItems.slice(startIndex, startIndex + stockPageSize);
  }, [filteredItems, stockPage, stockPageSize]);

  const totalMovementPages = Math.ceil(filteredMovements.length / movementPageSize);
  const paginatedMovements = useMemo(() => {
    const startIndex = (movementPage - 1) * movementPageSize;
    return filteredMovements.slice(startIndex, startIndex + movementPageSize);
  }, [filteredMovements, movementPage, movementPageSize]);

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    pageSize: number,
    onPageChange: (page: number) => void,
    onPageSizeChange: (size: number) => void
  ) => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-4">
        {/* Selector de registros por página */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
          <span>Registros por página:</span>
          <NativeSelect
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1); // Reset a primera página
            }}
            size="sm"
            className="w-16 h-8 !w-16"
          >
            <NativeSelectOption value="5">5</NativeSelectOption>
            <NativeSelectOption value="10">10</NativeSelectOption>
            <NativeSelectOption value="25">25</NativeSelectOption>
          </NativeSelect>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-8 text-xs px-2.5"
          >
            <ChevronLeft className="size-4 mr-1" />
            {t.prev}
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            Pág. {currentPage} de {totalPages || 1}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 text-xs px-2.5"
          >
            {t.next}
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  // Kanban Columns grouping
  const kanbanColumns = useMemo(() => {
    const empty: SerializedItem[] = [];
    const low: SerializedItem[] = [];
    const normal: SerializedItem[] = [];

    filteredItems.forEach((item) => {
      if (item.quantityOnHand === 0) {
        empty.push(item);
      } else if (item.quantityOnHand <= item.reorderPoint) {
        low.push(item);
      } else {
        normal.push(item);
      }
    });

    return { empty, low, normal };
  }, [filteredItems]);

  // Chart Data calculations
  const warehouseChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredItems.forEach((item) => {
      map[item.warehouseName] = (map[item.warehouseName] || 0) + item.quantityOnHand;
    });
    return Object.entries(map).map(([name, stock]) => ({ name, stock }));
  }, [filteredItems]);

  const movementChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMovements.forEach((m) => {
      map[m.type] = (map[m.type] || 0) + 1;
    });
    const colors: Record<string, string> = {
      PURCHASE: "#10b981",
      SALE: "#ef4444",
      ADJUSTMENT: "#f59e0b",
      TRANSFER_IN: "#3b82f6",
      TRANSFER_OUT: "#6366f1",
      SHRINKAGE: "#8b5cf6",
    };
    return Object.entries(map).map(([type, value]) => ({
      name: t[type as keyof typeof t] || type,
      value,
      color: colors[type] || "#6b7280",
    }));
  }, [filteredMovements, t]);

  const formatDateTime = (isoString: string) => {
    return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  };

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      {/* Cabecera y Acciones Rápidas */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground"><Package className="size-7 text-primary" aria-hidden="true" />{t.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap justify-start sm:justify-end w-full lg:w-auto">
          <div className="shrink-0 w-full sm:w-auto">
            <BranchScopeSelector locale={locale} />
          </div>
          <div className="shrink-0">
            <MovementFormDialog products={products} warehouses={initialWarehouses} />
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <MetricCard label={t.totalStock} value={String(metrics.totalStock)} change={t.totalStockDesc} locale={locale} />
        <MetricCard
          label={t.warehouses}
          value={String(metrics.warehousesCount)}
          change={t.warehousesDesc}
          locale={locale}
        />
        <MetricCard
          label={t.criticalAlerts}
          value={String(metrics.criticalAlerts)}
          change={t.criticalAlertsDesc}
          tone={metrics.criticalAlerts > 0 ? "danger" : "success"}
          locale={locale}
        />
      </div>

      {/* Contenedor Principal de Pestañas */}
      <Card className="rounded-lg">
        <Tabs
          value={activeTab}
          onValueChange={(next) => {
            setActiveTab(next);
            setSearchQuery("");
            setSelectedWarehouse("");
            setSelectedProduct("");
            setSelectedType("");
          }}
          className="flex flex-col gap-0"
        >
          {/* Cabecera del Control de Pestañas */}
          <div className="border-b border-border p-4 flex flex-col gap-4">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 !h-auto sm:!h-10 bg-muted/60 p-1 rounded-lg border gap-1 sm:gap-0">
              <TabsTrigger
                value="stock"
                className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <Package className="size-4 mr-1.5" />
                <span>{t.stockTab}</span>
              </TabsTrigger>
              <TabsTrigger
                value="movements"
                className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <ArrowRightLeft className="size-4 mr-1.5" />
                <span>{t.movementsTab}</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <TrendingUp className="size-4 mr-1.5" />
                <span>{t.chartsTab}</span>
              </TabsTrigger>
            </TabsList>

            {/* Panel de Búsqueda y Filtros de Entrada (Ancho Completo) */}
            {activeTab !== "charts" && (
              <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-8 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Alternancia de Vista (Sólo para stock) */}
                {activeTab === "stock" && (
                  <div className="flex border rounded-md p-1 bg-muted/40 gap-1 h-9 shrink-0 w-full md:w-auto justify-center">
                    <Button
                      size="sm"
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      onClick={() => setViewMode("list")}
                      className="h-full px-3 flex-1 md:flex-initial"
                    >
                      <LayoutGrid className="size-4" />
                      <span className="ml-1 text-xs">{t.listView}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "kanban" ? "secondary" : "ghost"}
                      onClick={() => setViewMode("kanban")}
                      className="h-full px-3 flex-1 md:flex-initial"
                    >
                      <KanbanSquare className="size-4" />
                      <span className="ml-1 text-xs">{t.kanbanView}</span>
                    </Button>
                  </div>
                )}

                {/* Filtros Dropdowns (Ancho Completo y Auto-adaptable) */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center w-full md:w-auto md:flex-1">
                  <NativeSelect
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    size="sm"
                    className="h-9 w-full !w-full"
                  >
                    <NativeSelectOption value="">{t.filterWarehouse}</NativeSelectOption>
                    {initialWarehouses.map((wh) => (
                      <NativeSelectOption key={wh.id} value={wh.id}>
                        {wh.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>

                  {activeTab === "movements" && (
                    <>
                      <NativeSelect
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        size="sm"
                        className="h-9 w-full !w-full"
                      >
                        <NativeSelectOption value="">{t.filterProduct}</NativeSelectOption>
                        {products.map((p) => (
                          <NativeSelectOption key={p.id} value={p.id}>
                            {p.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>

                      <NativeSelect
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        size="sm"
                        className="h-9 w-full !w-full"
                      >
                        <NativeSelectOption value="">{t.filterType}</NativeSelectOption>
                        {Object.entries(t).map(([key, label]) => {
                          if (["PURCHASE", "SALE", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT", "SHRINKAGE"].includes(key)) {
                            return (
                              <NativeSelectOption key={key} value={key}>
                                {label}
                              </NativeSelectOption>
                            );
                          }
                          return null;
                        })}
                      </NativeSelect>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cuerpo Principal de Contenidos */}
          <div className="p-4 pt-0">
            {/* Existencias (Stock) Tab */}
            <TabsContent value="stock">
              {filteredItems.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.emptyStock}
                </div>
              ) : viewMode === "kanban" ? (
                /* Tablero Kanban */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                  {/* Columna 1: Sin existencias */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-red-500" />
                        <h3 className="font-semibold text-sm text-red-500">{t.stockEmpty}</h3>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400">
                        {kanbanColumns.empty.length}
                      </Badge>
                    </div>
                    <div
                      className="flex flex-col gap-3 min-h-[300px] bg-muted/20 p-2 rounded-lg border"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData("text/plain");
                        handleCardDrop(itemId, "empty");
                      }}
                    >
                      {kanbanColumns.empty.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", item.id);
                          }}
                          className="p-3 bg-card border rounded-lg shadow-xs hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
                        >
                          <p className="font-semibold text-xs text-foreground truncate">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold mt-0.5">{item.productSku}</p>
                          <div className="mt-2 pt-2 border-t text-[11px] text-muted-foreground space-y-1">
                            <p>{t.warehouse}: {item.warehouseName}</p>
                            <div className="flex justify-between items-center pt-1">
                              <span className="font-bold text-red-500">0 / {item.reorderPoint}</span>
                              <MovementFormDialog
                                products={products}
                                warehouses={initialWarehouses}
                                defaultProductId={item.productId}
                                defaultWarehouseId={item.warehouseId}
                                trigger={
                                  <Button size="xs" variant="outline" className="h-6 px-1.5 text-[10px]">
                                    + Stock
                                  </Button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Columna 2: Stock bajo */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-500" />
                        <h3 className="font-semibold text-sm text-amber-500">{t.stockLow}</h3>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400">
                        {kanbanColumns.low.length}
                      </Badge>
                    </div>
                    <div
                      className="flex flex-col gap-3 min-h-[300px] bg-muted/20 p-2 rounded-lg border"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData("text/plain");
                        handleCardDrop(itemId, "low");
                      }}
                    >
                      {kanbanColumns.low.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", item.id);
                          }}
                          className="p-3 bg-card border rounded-lg shadow-xs hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
                        >
                          <p className="font-semibold text-xs text-foreground truncate">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold mt-0.5">{item.productSku}</p>
                          <div className="mt-2 pt-2 border-t text-[11px] text-muted-foreground space-y-1">
                            <p>{t.warehouse}: {item.warehouseName}</p>
                            <div className="flex justify-between items-center pt-1">
                              <span className="font-bold text-amber-500">{item.quantityOnHand} / {item.reorderPoint}</span>
                              <MovementFormDialog
                                products={products}
                                warehouses={initialWarehouses}
                                defaultProductId={item.productId}
                                defaultWarehouseId={item.warehouseId}
                                trigger={
                                  <Button size="xs" variant="outline" className="h-6 px-1.5 text-[10px]">
                                    + Stock
                                  </Button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Columna 3: Stock normal */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-emerald-500" />
                        <h3 className="font-semibold text-sm text-emerald-500">{t.stockNormal}</h3>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400">
                        {kanbanColumns.normal.length}
                      </Badge>
                    </div>
                    <div
                      className="flex flex-col gap-3 min-h-[300px] bg-muted/20 p-2 rounded-lg border"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const itemId = e.dataTransfer.getData("text/plain");
                        handleCardDrop(itemId, "normal");
                      }}
                    >
                      {kanbanColumns.normal.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", item.id);
                          }}
                          className="p-3 bg-card border rounded-lg shadow-xs hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
                        >
                          <p className="font-semibold text-xs text-foreground truncate">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold mt-0.5">{item.productSku}</p>
                          <div className="mt-2 pt-2 border-t text-[11px] text-muted-foreground space-y-1">
                            <p>{t.warehouse}: {item.warehouseName}</p>
                            <div className="flex justify-between items-center pt-1">
                              <span className="font-bold text-emerald-600">{item.quantityOnHand} / {item.reorderPoint}</span>
                              <MovementFormDialog
                                products={products}
                                warehouses={initialWarehouses}
                                defaultProductId={item.productId}
                                defaultWarehouseId={item.warehouseId}
                                trigger={
                                  <Button size="xs" variant="outline" className="h-6 px-1.5 text-[10px]">
                                    Ajustar
                                  </Button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Vista de Lista */
                <div className="flex flex-col gap-4">
                  {/* Desktop View Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.product}</TableHead>
                          <TableHead>{t.sku}</TableHead>
                          <TableHead>{t.warehouse}</TableHead>
                          <TableHead>{t.branch}</TableHead>
                          <TableHead className="text-right">{t.quantity}</TableHead>
                          <TableHead className="text-right">{t.reorderPoint}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead className="text-right">{t.action}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-semibold">{item.productName}</TableCell>
                            <TableCell>{item.productSku}</TableCell>
                            <TableCell>{item.warehouseName}</TableCell>
                            <TableCell>{item.branchName}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {item.quantityOnHand}
                            </TableCell>
                            <TableCell className="text-right">{item.reorderPoint}</TableCell>
                            <TableCell>
                              {item.quantityOnHand === 0 ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400">
                                  Sin Stock
                                </Badge>
                              ) : item.quantityOnHand <= item.reorderPoint ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400">
                                  Bajo Stock
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400">
                                  Normal
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <MovementFormDialog
                                products={products}
                                warehouses={initialWarehouses}
                                defaultProductId={item.productId}
                                defaultWarehouseId={item.warehouseId}
                                trigger={
                                  <Button size="sm" variant="ghost">
                                    Ajustar
                                  </Button>
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View: Cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedItems.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm truncate">{item.productName}</p>
                            <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold mt-0.5">{item.productSku}</p>
                          </div>
                          {item.quantityOnHand === 0 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Sin Stock
                            </Badge>
                          ) : item.quantityOnHand <= item.reorderPoint ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Bajo Stock
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Normal
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.warehouse}</p>
                            <p className="font-medium text-foreground mt-0.5">{item.warehouseName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.branch}</p>
                            <p className="font-medium text-foreground mt-0.5">{item.branchName}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.quantity}</p>
                            <p className="font-bold text-sm text-foreground mt-0.5">{item.quantityOnHand}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.reorderPoint}</p>
                            <p className="font-medium text-foreground mt-0.5">{item.reorderPoint}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-muted-foreground">MÁJ: {formatDateTime(item.updatedAt)}</span>
                          <MovementFormDialog
                            products={products}
                            warehouses={initialWarehouses}
                            defaultProductId={item.productId}
                            defaultWarehouseId={item.warehouseId}
                            trigger={
                              <Button size="xs" variant="outline" className="h-7">
                                Ajustar Stock
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ))}

                  {renderPagination(
                    stockPage,
                    totalStockPages,
                    stockPageSize,
                    setStockPage,
                    setStockPageSize
                  )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Movimientos (Kardex) Tab */}
            <TabsContent value="movements">
              {filteredMovements.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.emptyMovements}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.date}</TableHead>
                          <TableHead>{t.product}</TableHead>
                          <TableHead>{t.sku}</TableHead>
                          <TableHead>{t.warehouse}</TableHead>
                          <TableHead>{t.type}</TableHead>
                          <TableHead className="text-right">{t.quantity}</TableHead>
                          <TableHead className="text-right">{t.cost}</TableHead>
                          <TableHead>{t.source}</TableHead>
                          <TableHead>{t.sourceId}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMovements.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell>{formatDateTime(m.createdAt)}</TableCell>
                            <TableCell className="font-semibold">{m.productName}</TableCell>
                            <TableCell>{m.productSku}</TableCell>
                            <TableCell>{m.warehouseName}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  m.type === "PURCHASE" || m.type === "TRANSFER_IN" || (m.type === "ADJUSTMENT" && m.quantity > 0)
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                                )}
                              >
                                {t[m.type as keyof typeof t] || m.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{m.quantity}</TableCell>
                            <TableCell className="text-right font-medium text-muted-foreground">
                              {m.unitCost ? `$${m.unitCost.toFixed(2)}` : "-"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{m.sourceType}</TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">{m.sourceId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedMovements.map((m) => (
                      <div key={m.id} className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm truncate">{m.productName}</p>
                            <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold mt-0.5">{m.productSku}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              m.type === "PURCHASE" || m.type === "TRANSFER_IN"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {t[m.type as keyof typeof t] || m.type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.warehouse}</p>
                            <p className="font-medium text-foreground mt-0.5">{m.warehouseName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.date}</p>
                            <p className="font-medium text-foreground mt-0.5">{formatDateTime(m.createdAt)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.quantity}</p>
                            <p className="font-bold text-sm text-foreground mt-0.5">{m.quantity}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.cost}</p>
                            <p className="font-medium text-foreground mt-0.5">
                              {m.unitCost ? `$${m.unitCost.toFixed(2)}` : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between pt-1 text-[11px] text-muted-foreground">
                          <span>{t.source}: {m.sourceType}</span>
                          <span className="font-mono">REF: {m.sourceId}</span>
                        </div>
                      </div>
                    ))}

                  {renderPagination(
                    movementPage,
                    totalMovementPages,
                    movementPageSize,
                    setMovementPage,
                    setMovementPageSize
                  )}
                  </div>
                </div>
              )}
            </TabsContent>



            {/* Gráficos y Analítica Tab */}
            <TabsContent value="charts">
              {mounted ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  {/* Gráfico 1: Existencias por Almacén */}
                  <div className="border p-4 rounded-xl shadow-xs space-y-3 bg-muted/10">
                    <h3 className="font-semibold text-sm text-foreground">Distribución de Existencias por Almacén</h3>
                    <div className="h-80 w-full">
                      {warehouseChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          Sin datos de existencias
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={warehouseChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                background: "var(--background)",
                                borderColor: "var(--border)",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Gráfico 2: Flujo de Movimientos */}
                  <div className="border p-4 rounded-xl shadow-xs space-y-3 bg-muted/10">
                    <h3 className="font-semibold text-sm text-foreground">Kardex por Tipo de Movimiento</h3>
                    <div className="h-80 w-full">
                      {movementChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          Sin datos de movimientos
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={movementChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {movementChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "var(--background)",
                                borderColor: "var(--border)",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Cargando analítica...
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </section>
  );
}
