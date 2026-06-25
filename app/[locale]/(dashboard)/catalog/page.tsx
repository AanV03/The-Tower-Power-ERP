import type { Locale } from "@/lib/i18n";
import AddProductModal from "@/components/catalog/add-product-modal";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const SearchAndFilterBar = () => (
    <div className="flex items-center gap-3 w-full max-w-screen-lg flex-wrap sm:flex-nowrap">
      <input
        aria-label="Buscar productos"
        className="flex-1 px-4 py-2 rounded-xl border border-border/80 bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
        placeholder="Buscar por nombre, SKU o barcode..."
      />
      <div className="hidden sm:flex items-center gap-2">
        <button className="px-4 py-2 bg-card hover:bg-muted border border-border text-foreground transition-all duration-300 rounded-xl font-medium text-sm cursor-pointer">
          Filters
        </button>
        <button className="px-4 py-2 bg-card hover:bg-muted border border-border text-foreground transition-all duration-300 rounded-xl font-medium text-sm cursor-pointer">
          Advanced
        </button>
      </div>
    </div>
  );

  const BulkActionsToolbar = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 bg-card border border-border/80 rounded-xl px-3 py-1.5 shadow-xs">
        <input type="checkbox" aria-label="select-all" className="rounded border-border text-primary focus:ring-primary/30 cursor-pointer" />
        <span className="text-xs font-medium text-muted-foreground">0 seleccionados</span>
      </div>
      <button className="px-4 py-2 bg-primary hover:brightness-110 text-white transition-all duration-300 rounded-xl font-semibold text-sm shadow-xs cursor-pointer active:scale-[0.98]">
        Actualizar precios
      </button>
      <button className="px-4 py-2 bg-card hover:bg-muted border border-border text-foreground transition-all duration-300 rounded-xl font-medium text-sm cursor-pointer">
        Cambiar categoría
      </button>
      <div className="ml-1">
        <button className="px-3 py-1.5 bg-card hover:bg-muted border border-border text-foreground transition-all duration-300 rounded-xl font-medium text-xs cursor-pointer">
          Columnas
        </button>
      </div>
    </div>
  );

  const DataTableSkeleton = () => (
    <div className="flex-1 min-w-0 overflow-hidden rounded-xl border border-border bg-card/45 backdrop-blur-md shadow-xs">
      <div className="w-full overflow-auto">
        <table className="w-full min-w-[900px] table-auto text-sm">
          <thead className="bg-muted/40 border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <tr>
              <th className="sticky top-0 bg-card/95 px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">SKU</th>
              <th className="px-6 py-4 text-right">Precio</th>
              <th className="px-6 py-4 text-left">Impuesto</th>
              <th className="px-6 py-4 text-left">Stock</th>
              <th className="px-6 py-4 text-left">Categoría</th>
              <th className="px-6 py-4 text-left">Activo</th>
              <th className="px-6 py-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors duration-200">
                <td className="px-6 py-4.5">
                  <div className="font-semibold text-foreground">Producto de ejemplo {i + 1}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Descripción corta o subtítulo del producto</div>
                </td>
                <td className="px-6 py-4.5 font-mono text-xs text-muted-foreground">SKU-000{i + 1}</td>
                <td className="px-6 py-4.5 text-right font-bold text-primary">$99.00</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">16%</span>
                </td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500 font-semibold shadow-xs">In stock</span>
                </td>
                <td className="px-6 py-4.5 text-muted-foreground">Suplementos</td>
                <td className="px-6 py-4.5 text-muted-foreground">Sí</td>
                <td className="px-6 py-4.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-bold">•••</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-4 p-6 bg-card/40 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">Catálogo</h2>
          <div className="text-sm text-muted-foreground hidden sm:block">Productos y categorías</div>
        </div>
        <div className="flex items-center gap-3">
          <SearchAndFilterBar />
          <AddProductModal />
        </div>
      </div>

      <div className="flex gap-6 p-6 min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <BulkActionsToolbar />
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-card hover:bg-muted border border-border text-foreground transition-all duration-300 rounded-xl font-medium text-xs cursor-pointer">
                Densidad
              </button>
              <button className="px-3 py-1.5 bg-card hover:bg-muted border border-border text-foreground transition-all duration-300 rounded-xl font-medium text-xs cursor-pointer">
                Importar
              </button>
            </div>
          </div>

          <DataTableSkeleton />
          <div className="py-2">
            <div className="text-xs text-muted-foreground font-medium">Controles de paginación (Vista previa)</div>
          </div>
        </div>

        {/* ColumnConfigurator panel */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="p-5 border border-border bg-card/40 backdrop-blur-md rounded-xl text-sm font-semibold text-foreground shadow-xs">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Configuraciones</h4>
            <p className="text-xs text-muted-foreground font-normal">Personaliza las columnas visibles, filtros y configuraciones del catálogo de productos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
