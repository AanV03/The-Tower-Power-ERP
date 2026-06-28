"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  FolderOpen,
  TrendingUp,
  Image as ImageIcon,
  Trash2,
  Edit,
  LayoutGrid,
  List,
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { MetricCard } from "@/components/shared/metric-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductFormDialog } from "./product-form-dialog";
import { CategoryFormDialog } from "./category-form-dialog";
import type { Locale } from "@/lib/i18n";

type ProductItem = {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  categoryName: string;
  price: number;
  cost: number;
  taxRate: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
};

type CategoryItem = {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string;
  status: string;
  createdAt: string;
};

const tLabels = {
  es: {
    title: "Catálogo de Productos",
    subtitle: "Definición y administración de productos, listas de precios, asignación de impuestos y categorías.",
    newProduct: "Nuevo Producto",
    editProduct: "Editar Producto",
    deleteProduct: "Eliminar Producto",
    productName: "Nombre de Producto",
    sku: "SKU",
    price: "Precio de Venta",
    cost: "Costo",
    taxRate: "Tasa de Impuesto",
    category: "Categoría",
    status: "Estado",
    actions: "Acciones",
    noProducts: "No hay productos registrados.",
    searchPlaceholder: "Buscar por nombre, SKU o categoría...",
    confirmDeleteProduct: "¿Estás seguro de que deseas eliminar este producto?",
    deleteSuccess: "Producto eliminado correctamente.",
    createSuccess: "Producto creado correctamente.",
    updateSuccess: "Producto actualizado correctamente.",
    productsTab: "Productos",
    categoriesTab: "Categorías",
    chartsTab: "Métricas",
    newCategory: "Nueva Categoría",
    editCategory: "Editar Categoría",
    deleteCategory: "Eliminar Categoría",
    categoryName: "Nombre de Categoría",
    parentCategory: "Categoría Padre",
    confirmDeleteCategory: "¿Estás seguro de que deseas eliminar esta categoría?",
    deleteCategorySuccess: "Categoría eliminada correctamente.",
    createCategorySuccess: "Categoría creada correctamente.",
    updateCategorySuccess: "Categoría actualizada correctamente.",
    noCategories: "No hay categorías registradas.",
    totalProducts: "Total Productos",
    activeProducts: "Productos Activos",
    totalCategories: "Total Categorías",
    avgPrice: "Precio Promedio",
    avgCost: "Costo Promedio",
    recordsPerPage: "Registros por página:",
    prev: "Anterior",
    next: "Siguiente",
    productsByCategory: "Cantidad de Productos por Categoría",
    priceVsCost: "Comparativa de Precio vs Costo por Producto",
    listView: "Vista de Lista",
    gridView: "Catálogo Visual",
    filterCategory: "Filtrar por Categoría",
    filterStatus: "Filtrar por Estado",
  },
  en: {
    title: "Product Catalog",
    subtitle: "Definition and administration of products, price lists, tax assignment, and categories.",
    newProduct: "New Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    productName: "Product Name",
    sku: "SKU",
    price: "Selling Price",
    cost: "Cost",
    taxRate: "Tax Rate",
    category: "Category",
    status: "Status",
    actions: "Actions",
    noProducts: "No products registered.",
    searchPlaceholder: "Search by name, SKU, or category...",
    confirmDeleteProduct: "Are you sure you want to delete this product?",
    deleteSuccess: "Product deleted successfully.",
    createSuccess: "Product created successfully.",
    updateSuccess: "Product updated successfully.",
    productsTab: "Products",
    categoriesTab: "Categories",
    chartsTab: "Metrics",
    newCategory: "New Category",
    editCategory: "Edit Category",
    deleteCategory: "Delete Category",
    categoryName: "Category Name",
    parentCategory: "Parent Category",
    confirmDeleteCategory: "Are you sure you want to delete this category?",
    deleteCategorySuccess: "Category deleted successfully.",
    createCategorySuccess: "Category created successfully.",
    updateCategorySuccess: "Category updated successfully.",
    noCategories: "No categories registered.",
    totalProducts: "Total Products",
    activeProducts: "Active Products",
    totalCategories: "Total Categories",
    avgPrice: "Average Price",
    avgCost: "Average Cost",
    recordsPerPage: "Records per page:",
    prev: "Previous",
    next: "Next",
    productsByCategory: "Product Count by Category",
    priceVsCost: "Selling Price vs Cost comparison per Product",
    listView: "List View",
    gridView: "Visual Catalog",
    filterCategory: "Filter by Category",
    filterStatus: "Filter by Status",
  },
  fr: {
    title: "Catalogue de Produits",
    subtitle: "Définition et administration des produits, listes de prix, attribution des taxes et catégories.",
    newProduct: "Nouveau Produit",
    editProduct: "Modifier le Produit",
    deleteProduct: "Supprimer le Produit",
    productName: "Nom du Produit",
    sku: "SKU",
    price: "Prix de Vente",
    cost: "Coût",
    taxRate: "Taux de Taxe",
    category: "Catégorie",
    status: "Statut",
    actions: "Actions",
    noProducts: "Aucun produit enregistré.",
    searchPlaceholder: "Rechercher par nom, SKU ou catégorie...",
    confirmDeleteProduct: "Êtes-vous sûr de vouloir supprimer ce produit ?",
    deleteSuccess: "Produit supprimé avec succès.",
    createSuccess: "Produit créé avec succès.",
    updateSuccess: "Produit mis à jour avec succès.",
    productsTab: "Produits",
    categoriesTab: "Catégories",
    chartsTab: "Mesures",
    newCategory: "Nouvelle Catégorie",
    editCategory: "Modifier la Catégorie",
    deleteCategory: "Supprimer la Catégorie",
    categoryName: "Nom de la Catégorie",
    parentCategory: "Catégorie Parente",
    confirmDeleteCategory: "Êtes-vous sûr de vouloir supprimer cette catégorie ?",
    deleteCategorySuccess: "Catégorie supprimée avec succès.",
    createCategorySuccess: "Catégorie créée avec succès.",
    updateCategorySuccess: "Catégorie mise à jour avec succès.",
    noCategories: "Aucune catégorie enregistrée.",
    totalProducts: "Total Produits",
    activeProducts: "Produits Actifs",
    totalCategories: "Total Catégories",
    avgPrice: "Prix Moyen",
    avgCost: "Coût Moyen",
    recordsPerPage: "Enregistrements par page:",
    prev: "Précédent",
    next: "Suivant",
    productsByCategory: "Nombre de Produits par Catégorie",
    priceVsCost: "Comparaison Prix de Vente vs Coût par Produit",
    listView: "Vue de Liste",
    gridView: "Catalogue Visuel",
    filterCategory: "Filtrer par Catégorie",
    filterStatus: "Filtrer par Statut",
  }
};

export function CatalogClient({
  initialProducts,
  initialCategories,
  locale,
}: {
  initialProducts: ProductItem[];
  initialCategories: CategoryItem[];
  locale: Locale;
}) {
  const t = tLabels[locale] ?? tLabels.es;
  const router = useRouter();

  // Local lists states
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // States
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // visual catalog by default
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [prodPageSize, setProdPageSize] = useState(10);
  const [prodPage, setProdPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);
  const [catPage, setCatPage] = useState(1);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Reset page sizes on tab or search queries
  useEffect(() => {
    setProdPage(1);
    setCatPage(1);
  }, [searchQuery, categoryFilter, statusFilter, activeTab]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = !categoryFilter || p.categoryId === categoryFilter;
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [categories, searchQuery]);

  // Product Pagination
  const totalProdPages = Math.ceil(filteredProducts.length / prodPageSize);
  const paginatedProducts = useMemo(() => {
    const start = (prodPage - 1) * prodPageSize;
    return filteredProducts.slice(start, start + prodPageSize);
  }, [filteredProducts, prodPage, prodPageSize]);

  // Category Pagination
  const totalCatPages = Math.ceil(filteredCategories.length / catPageSize);
  const paginatedCategories = useMemo(() => {
    const start = (catPage - 1) * catPageSize;
    return filteredCategories.slice(start, start + catPageSize);
  }, [filteredCategories, catPage, catPageSize]);

  // KPIs
  const kpis = useMemo(() => {
    const totalProdCount = products.length;
    const activeProdCount = products.filter((p) => p.status === "ACTIVE").length;
    const totalCatCount = categories.length;
    const sumPrice = products.reduce((acc, p) => acc + p.price, 0);
    const sumCost = products.reduce((acc, p) => acc + p.cost, 0);
    const avgPrice = totalProdCount > 0 ? sumPrice / totalProdCount : 0;
    const avgCost = totalProdCount > 0 ? sumCost / totalProdCount : 0;
    return {
      totalProdCount,
      activeProdCount,
      totalCatCount,
      avgPrice,
      avgCost,
    };
  }, [products, categories]);

  // Charts data
  const chartsData = useMemo(() => {
    // 1. Products count by category
    const catMap: Record<string, number> = {};
    products.forEach((p) => {
      catMap[p.categoryName || "Sin Categoría"] = (catMap[p.categoryName || "Sin Categoría"] || 0) + 1;
    });
    const categoryChartData = Object.entries(catMap).map(([name, count]) => ({
      name,
      count,
    }));

    // 2. Pricing comparisons
    const priceCostData = products.slice(0, 10).map((p) => ({
      name: p.name,
      precio: p.price,
      costo: p.cost,
    }));

    return {
      categoryChartData,
      priceCostData,
    };
  }, [products]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t.confirmDeleteProduct)) return;
    const toastId = toast.loading("Eliminando producto...");
    try {
      const res = await fetch(`/api/catalog/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar producto");
      }
      toast.success(t.deleteSuccess, { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar producto", { id: toastId });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t.confirmDeleteCategory)) return;
    const toastId = toast.loading("Eliminando categoría...");
    try {
      const res = await fetch(`/api/catalog/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar categoría");
      }
      toast.success(t.deleteCategorySuccess, { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar categoría", { id: toastId });
    }
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    pageSize: number,
    onPageChange: (page: number) => void,
    onPageSizeChange: (size: number) => void
  ) => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-4">
        {/* Registros por página */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
          <span>{t.recordsPerPage}</span>
          <NativeSelect
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
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

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">{t.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t.subtitle}
          </p>
        </div>
        <div className="flex justify-end gap-3 w-full lg:w-auto">
          {activeTab === "products" ? (
            <ProductFormDialog
              categories={categories}
              trigger={
                <Button className="w-full sm:w-auto">
                  <Package className="size-4 mr-2" />
                  {t.newProduct}
                </Button>
              }
            />
          ) : activeTab === "categories" ? (
            <CategoryFormDialog
              categories={categories}
              trigger={
                <Button className="w-full sm:w-auto">
                  <FolderOpen className="size-4 mr-2" />
                  {t.newCategory}
                </Button>
              }
            />
          ) : null}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <MetricCard
          label={t.totalProducts}
          value={String(kpis.totalProdCount)}
          change={`${kpis.activeProdCount} activos`}
          locale={locale}
        />
        <MetricCard
          label={t.totalCategories}
          value={String(kpis.totalCatCount)}
          change="Categorías activas"
          tone="default"
          locale={locale}
        />
        <MetricCard
          label={t.avgPrice}
          value={`$${kpis.avgPrice.toFixed(2)}`}
          change="Precio medio venta"
          tone="success"
          locale={locale}
        />
        <MetricCard
          label={t.avgCost}
          value={`$${kpis.avgCost.toFixed(2)}`}
          change="Costo medio compra"
          tone="default"
          locale={locale}
        />
      </div>

      {/* Pestañas e interfaz del catálogo */}
      <Card className="rounded-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-0">
          <div className="border-b border-border p-4 flex flex-col gap-4">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 !h-auto sm:!h-10 bg-muted/60 p-1 rounded-lg border gap-1 sm:gap-0">
              <TabsTrigger value="products" className="text-xs sm:text-sm font-semibold w-full cursor-pointer">
                <Package className="size-4 mr-1.5" />
                <span>{t.productsTab}</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs sm:text-sm font-semibold w-full cursor-pointer">
                <FolderOpen className="size-4 mr-1.5" />
                <span>{t.categoriesTab}</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-xs sm:text-sm font-semibold w-full cursor-pointer">
                <TrendingUp className="size-4 mr-1.5" />
                <span>{t.chartsTab}</span>
              </TabsTrigger>
            </TabsList>

            {/* Panel de Búsqueda y Filtros de Entrada (Ancho Completo) */}
            {activeTab !== "charts" && (
              <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Campo de búsqueda */}
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

                {/* Alternancia de Vista (Sólo para Productos) */}
                {activeTab === "products" && (
                  <div className="flex border rounded-md p-1 bg-muted/40 gap-1 h-9 shrink-0 w-full md:w-auto justify-center">
                    <Button
                      size="sm"
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      onClick={() => setViewMode("grid")}
                      className="h-full px-3 flex-1 md:flex-initial"
                    >
                      <LayoutGrid className="size-4" />
                      <span className="ml-1 text-xs">{t.gridView}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      onClick={() => setViewMode("list")}
                      className="h-full px-3 flex-1 md:flex-initial"
                    >
                      <List className="size-4" />
                      <span className="ml-1 text-xs">{t.listView}</span>
                    </Button>
                  </div>
                )}

                {/* Filtros Dropdowns (Sólo para Productos) */}
                {activeTab === "products" && (
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center w-full md:w-auto md:flex-1">
                    <NativeSelect
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      size="sm"
                      className="h-9 w-full !w-full"
                    >
                      <NativeSelectOption value="">{t.filterCategory}</NativeSelectOption>
                      {categories.map((c) => (
                        <NativeSelectOption key={c.id} value={c.id}>
                          {c.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>

                    <NativeSelect
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      size="sm"
                      className="h-9 w-full !w-full"
                    >
                      <NativeSelectOption value="">{t.filterStatus}</NativeSelectOption>
                      <NativeSelectOption value="ACTIVE">Activos</NativeSelectOption>
                      <NativeSelectOption value="INACTIVE">Inactivos</NativeSelectOption>
                    </NativeSelect>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 pt-0">
            {/* PESTAÑA PRODUCTOS */}
            <TabsContent value="products" className="mt-0">
              {filteredProducts.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md mt-4">
                  {t.noProducts}
                </div>
              ) : viewMode === "grid" ? (
                /* GRID VISUAL DE TARJETAS (CATÁLOGO REAL) */
                <div className="flex flex-col gap-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="group flex flex-col border border-border bg-card hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden"
                      >
                        {/* Contenedor de Imagen de Producto */}
                        <div className="relative aspect-video w-full bg-muted/30 overflow-hidden flex items-center justify-center border-b">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                              <ImageIcon className="size-8 stroke-1" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">{p.categoryName || "Fisico"}</span>
                            </div>
                          )}

                          {/* Badge de Estado en Esquina */}
                          <div className="absolute top-2.5 right-2.5">
                            <Badge
                              variant="outline"
                              className={
                                p.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-600 border-red-500/20"
                              }
                            >
                              {p.status === "ACTIVE" ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>

                        {/* Detalles del Producto */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-bold">
                              {p.categoryName || "General"}
                            </p>
                            <h3 className="font-bold text-foreground text-sm leading-tight truncate group-hover:text-primary transition-colors">
                              {p.name}
                            </h3>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              SKU: {p.sku}
                            </p>
                          </div>

                          <div className="flex justify-between items-end pt-2 border-t">
                            <div className="space-y-0.5">
                              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                {t.price}
                              </p>
                              <p className="text-base font-extrabold text-foreground">
                                ${p.price.toFixed(2)}
                              </p>
                            </div>
                            
                            {/* Acciones */}
                            <div className="flex gap-1">
                              <ProductFormDialog
                                categories={categories}
                                product={p}
                                trigger={
                                  <Button size="xs" variant="ghost" className="size-7 p-0">
                                    <Edit className="size-3.5" />
                                  </Button>
                                }
                              />
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="size-7 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {renderPagination(prodPage, totalProdPages, prodPageSize, setProdPage, setProdPageSize)}
                </div>
              ) : (
                /* VISTA DE LISTA TRADICIONAL */
                <div className="flex flex-col gap-4 mt-4">
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.productName}</TableHead>
                          <TableHead>{t.sku}</TableHead>
                          <TableHead className="text-right">{t.price}</TableHead>
                          <TableHead className="text-right">{t.cost}</TableHead>
                          <TableHead className="text-right">{t.taxRate}</TableHead>
                          <TableHead>{t.category}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead className="text-right">{t.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-semibold">{p.name}</TableCell>
                            <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                            <TableCell className="text-right font-bold">${p.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium text-muted-foreground">
                              ${p.cost.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">{p.taxRate}%</TableCell>
                            <TableCell>{p.categoryName || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  p.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                                }
                              >
                                {p.status === "ACTIVE" ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <ProductFormDialog
                                  categories={categories}
                                  product={p}
                                  trigger={
                                    <Button size="sm" variant="ghost">
                                      <Edit className="size-4" />
                                    </Button>
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteProduct(p.id)}
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

                  {/* Vista móvil de lista compacta */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedProducts.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">{p.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">SKU: {p.sku}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <ProductFormDialog
                              categories={categories}
                              product={p}
                              trigger={
                                <Button size="xs" variant="outline">
                                  Editar
                                </Button>
                              }
                            />
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-500"
                            >
                              Borrar
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.price}</p>
                            <p className="font-bold text-foreground mt-0.5">${p.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.category}</p>
                            <p className="font-medium mt-0.5">{p.categoryName || "-"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {renderPagination(prodPage, totalProdPages, prodPageSize, setProdPage, setProdPageSize)}
                </div>
              )}
            </TabsContent>

            {/* PESTAÑA CATEGORÍAS */}
            <TabsContent value="categories" className="mt-0">
              {filteredCategories.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md mt-4">
                  {t.noCategories}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  {/* Vista de escritorio */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.categoryName}</TableHead>
                          <TableHead>{t.parentCategory}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead className="text-right">{t.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCategories.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-semibold">{c.name}</TableCell>
                            <TableCell>{c.parentName || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  c.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                                }
                              >
                                {c.status === "ACTIVE" ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <CategoryFormDialog
                                  categories={categories}
                                  category={c}
                                  trigger={
                                    <Button size="sm" variant="ghost">
                                      <Edit className="size-4" />
                                    </Button>
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteCategory(c.id)}
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

                  {/* Vista móvil */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedCategories.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-foreground text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Padre: {c.parentName || "-"}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <CategoryFormDialog
                              categories={categories}
                              category={c}
                              trigger={
                                <Button size="xs" variant="outline">
                                  Editar
                                </Button>
                              }
                            />
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleDeleteCategory(c.id)}
                              className="text-red-500"
                            >
                              Borrar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {renderPagination(catPage, totalCatPages, catPageSize, setCatPage, setCatPageSize)}
                </div>
              )}
            </TabsContent>

            {/* PESTAÑA MÉTRICAS */}
            <TabsContent value="charts" className="mt-0 pt-4">
              {products.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.noProducts}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico 1: Productos por categoría */}
                  <Card className="p-4 border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">{t.productsByCategory}</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartsData.categoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t.productsTab} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Gráfico 2: Precio vs Costo */}
                  <Card className="p-4 border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">{t.priceVsCost}</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartsData.priceCostData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                          <Legend />
                          <Bar dataKey="precio" fill="#10b981" radius={[4, 4, 0, 0]} name={t.price} />
                          <Bar dataKey="costo" fill="#ef4444" radius={[4, 4, 0, 0]} name={t.cost} />
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
