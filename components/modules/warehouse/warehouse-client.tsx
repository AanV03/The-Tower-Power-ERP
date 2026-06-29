"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Warehouse as WarehouseIcon,
  Trash2,
  Edit,
  TrendingUp,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { MetricCard } from "@/components/shared/metric-card";
import { BranchScopeSelector } from "@/components/shared/branch-scope-selector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WarehouseFormDialog } from "./warehouse-form-dialog";
import type { Locale } from "@/lib/i18n";
import { cn, headerPrimaryActionClass } from "@/lib/utils";

type WarehouseItem = {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  uniqueProductsCount: number;
  totalStockCount: number;
  createdAt: string;
};

type BranchItem = {
  id: string;
  name: string;
};

const tLabels = {
  es: {
    title: "Gestión de Almacenes",
    subtitle: "Consolidación de bodegas físicas, capacidad de almacenamiento por sucursal y control logístico.",
    newWarehouse: "Nuevo Almacén",
    editWarehouse: "Editar Almacén",
    deleteWarehouse: "Eliminar Almacén",
    warehouseName: "Nombre de Almacén",
    branch: "Sucursal",
    uniqueProducts: "Productos Únicos",
    totalStock: "Stock Físico Total",
    createdAt: "Fecha de Creación",
    actions: "Acciones",
    noWarehouses: "No hay almacenes registrados.",
    searchPlaceholder: "Buscar almacén por nombre o sucursal...",
    confirmDelete: "¿Estás seguro de que deseas eliminar este almacén?",
    deleteSuccess: "Almacén eliminado correctamente.",
    createSuccess: "Almacén creado correctamente.",
    updateSuccess: "Almacén actualizado correctamente.",
    warehousesCount: "Total Almacenes",
    activeWarehouses: "Almacenes Activos",
    productsCount: "Total Productos Únicos",
    totalStockCount: "Stock Físico Acumulado",
    prev: "Anterior",
    next: "Siguiente",
    chartsTab: "Métricas y Capacidad",
    listTab: "Ver Almacenes",
    recordsPerPage: "Registros por página:",
    uniqueProductsChart: "Productos Únicos por Almacén",
    stockChart: "Stock Físico Acumulado por Almacén",
  },
  en: {
    title: "Warehouse Management",
    subtitle: "Consolidation of physical warehouses, branch storage capacities, and logistical control.",
    newWarehouse: "New Warehouse",
    editWarehouse: "Edit Warehouse",
    deleteWarehouse: "Delete Warehouse",
    warehouseName: "Warehouse Name",
    branch: "Branch",
    uniqueProducts: "Unique Products",
    totalStock: "Total Physical Stock",
    createdAt: "Creation Date",
    actions: "Actions",
    noWarehouses: "No warehouses registered.",
    searchPlaceholder: "Search warehouse by name or branch...",
    confirmDelete: "Are you sure you want to delete this warehouse?",
    deleteSuccess: "Warehouse deleted successfully.",
    createSuccess: "Warehouse created successfully.",
    updateSuccess: "Warehouse updated successfully.",
    warehousesCount: "Total Warehouses",
    activeWarehouses: "Active Warehouses",
    productsCount: "Total Unique Products",
    totalStockCount: "Accumulated Physical Stock",
    prev: "Previous",
    next: "Next",
    chartsTab: "Metrics & Capacity",
    listTab: "View Warehouses",
    recordsPerPage: "Records per page:",
    uniqueProductsChart: "Unique Products per Warehouse",
    stockChart: "Accumulated Physical Stock per Warehouse",
  },
  fr: {
    title: "Gestion des Entrepôts",
    subtitle: "Consolidation des entrepôts physiques, capacités de stockage par succursale et contrôle logistique.",
    newWarehouse: "Nouvel Entrepôt",
    editWarehouse: "Modifier l'Entrepôt",
    deleteWarehouse: "Supprimer l'Entrepôt",
    warehouseName: "Nom de l'Entrepôt",
    branch: "Succursale",
    uniqueProducts: "Produits Uniques",
    totalStock: "Stock Physique Total",
    createdAt: "Date de Création",
    actions: "Actions",
    noWarehouses: "Aucun entrepôt enregistré.",
    searchPlaceholder: "Rechercher un entrepôt par nom ou succursale...",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet entrepôt ?",
    deleteSuccess: "Entrepôt supprimé avec succès.",
    createSuccess: "Entrepôt créé avec succès.",
    updateSuccess: "Entrepôt mis à jour avec succès.",
    warehousesCount: "Total Entrepôts",
    activeWarehouses: "Entrepôts Actifs",
    productsCount: "Total Produits Uniques",
    totalStockCount: "Stock Physique Accumulé",
    prev: "Précédent",
    next: "Suivant",
    chartsTab: "Mesures & Capacité",
    listTab: "Voir les Entrepôts",
    recordsPerPage: "Enregistrements par page:",
    uniqueProductsChart: "Produits Uniques par Entrepôt",
    stockChart: "Stock Physique Accumulé par Entrepôt",
  }
};

export function WarehouseClient({
  initialWarehouses,
  branches,
  locale,
}: {
  initialWarehouses: WarehouseItem[];
  branches: BranchItem[];
  locale: Locale;
}) {
  const t = tLabels[locale] ?? tLabels.es;
  const router = useRouter();

  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(initialWarehouses);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setWarehouses(initialWarehouses);
  }, [initialWarehouses]);

  // Reset pagination page on search
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Filtered warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.branchName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [warehouses, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredWarehouses.length / pageSize);
  const paginatedWarehouses = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredWarehouses.slice(startIndex, startIndex + pageSize);
  }, [filteredWarehouses, page, pageSize]);

  // KPIs
  const kpis = useMemo(() => {
    const totalCount = warehouses.length;
    const totalUniqueProducts = warehouses.reduce((acc, w) => acc + w.uniqueProductsCount, 0);
    const accumulatedStock = warehouses.reduce((acc, w) => acc + w.totalStockCount, 0);
    return {
      totalCount,
      totalUniqueProducts,
      accumulatedStock,
    };
  }, [warehouses]);

  // Recharts Chart Data
  const chartData = useMemo(() => {
    return warehouses.map((w) => ({
      name: w.name,
      uniqueProducts: w.uniqueProductsCount,
      stock: w.totalStockCount,
    }));
  }, [warehouses]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    const toastId = toast.loading("Eliminando almacén...");

    try {
      const res = await fetch(`/api/inventory/warehouses/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al eliminar almacén");
      }

      toast.success(t.deleteSuccess, { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar almacén", { id: toastId });
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  };

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      {/* Header y Acciones */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground"><WarehouseIcon className="size-7 text-primary" aria-hidden="true" />{t.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap justify-start sm:justify-end w-full lg:w-auto">
          <div className="shrink-0 w-full sm:w-auto">
            <BranchScopeSelector locale={locale} />
          </div>
          <div className="shrink-0">
            <WarehouseFormDialog
              branches={branches}
              trigger={
                <Button className={cn(headerPrimaryActionClass, "w-full sm:w-auto")}>
                  <WarehouseIcon className="size-4 mr-2" />
                  {t.newWarehouse}
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <MetricCard
          label={t.warehousesCount}
          value={String(kpis.totalCount)}
          change={t.activeWarehouses}
          locale={locale}
        />
        <MetricCard
          label={t.productsCount}
          value={String(kpis.totalUniqueProducts)}
          change="Productos únicos en stock"
          tone="default"
          locale={locale}
        />
        <MetricCard
          label={t.totalStockCount}
          value={String(kpis.accumulatedStock)}
          change="Piezas físicas totales"
          tone={kpis.accumulatedStock > 0 ? "success" : "default"}
          locale={locale}
        />
      </div>

      {/* Tabs list view / charts view */}
      <Card className="rounded-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-0">
          <div className="border-b border-border p-4 flex flex-col gap-4">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-2 !h-auto sm:!h-10 bg-muted/60 p-1 rounded-lg border gap-1 sm:gap-0">
              <TabsTrigger
                value="list"
                className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <WarehouseIcon className="size-4 mr-1.5" />
                <span>{t.listTab}</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <TrendingUp className="size-4 mr-1.5" />
                <span>{t.chartsTab}</span>
              </TabsTrigger>
            </TabsList>

            {/* Búsqueda (Sólo en pestaña de listado) */}
            {activeTab === "list" && (
              <div className="w-full flex items-center gap-3">
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
              </div>
            )}
          </div>

          <div className="p-4 pt-0">
            {/* List tab content */}
            <TabsContent value="list" className="mt-0">
              {filteredWarehouses.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md mt-4">
                  {t.noWarehouses}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  {/* Desktop view */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.warehouseName}</TableHead>
                          <TableHead>{t.branch}</TableHead>
                          <TableHead className="text-right">{t.uniqueProducts}</TableHead>
                          <TableHead className="text-right">{t.totalStock}</TableHead>
                          <TableHead>{t.createdAt}</TableHead>
                          <TableHead className="text-right">{t.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedWarehouses.map((w) => (
                          <TableRow key={w.id}>
                            <TableCell className="font-semibold">{w.name}</TableCell>
                            <TableCell>{w.branchName}</TableCell>
                            <TableCell className="text-right font-medium">{w.uniqueProductsCount}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">
                              {w.totalStockCount}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{formatDateTime(w.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <WarehouseFormDialog
                                  branches={branches}
                                  warehouse={w}
                                  trigger={
                                    <Button size="sm" variant="ghost">
                                      <Edit className="size-4" />
                                    </Button>
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(w.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile view */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedWarehouses.map((w) => (
                      <div key={w.id} className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-foreground text-sm">{w.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{w.branchName}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <WarehouseFormDialog
                              branches={branches}
                              warehouse={w}
                              trigger={
                                <Button size="xs" variant="outline">
                                  Editar
                                </Button>
                              }
                            />
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleDelete(w.id)}
                              className="text-red-500"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                              {t.uniqueProducts}
                            </p>
                            <p className="font-medium text-foreground mt-0.5">{w.uniqueProductsCount}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                              {t.totalStock}
                            </p>
                            <p className="font-bold text-emerald-600 mt-0.5">{w.totalStockCount}</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-1">
                          {t.createdAt}: {formatDateTime(w.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación unificada */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
                      <span>{t.recordsPerPage}</span>
                      <NativeSelect
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        size="sm"
                        className="w-16 h-8 !w-16"
                      >
                        <NativeSelectOption value="5">5</NativeSelectOption>
                        <NativeSelectOption value="10">10</NativeSelectOption>
                        <NativeSelectOption value="25">25</NativeSelectOption>
                      </NativeSelect>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="h-8 text-xs px-2.5"
                      >
                        <ChevronLeft className="size-4 mr-1" />
                        {t.prev}
                      </Button>
                      <span className="text-xs text-muted-foreground font-medium">
                        Pág. {page} de {totalPages || 1}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="h-8 text-xs px-2.5"
                      >
                        {t.next}
                        <ChevronRight className="size-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Charts tab content */}
            <TabsContent value="charts" className="mt-0 pt-4">
              {warehouses.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.noWarehouses}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Unique Products */}
                  <Card className="p-4 border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">{t.uniqueProductsChart}</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                          <Bar dataKey="uniqueProducts" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t.uniqueProducts} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Chart 2: Total Stock */}
                  <Card className="p-4 border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">{t.stockChart}</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                          <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} name={t.totalStock} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </section>
  );
}
