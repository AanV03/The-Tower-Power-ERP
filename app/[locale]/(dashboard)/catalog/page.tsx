import type { Locale } from "@/lib/i18n";
import AddProductModal from "@/components/catalog/add-product-modal";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const SearchAndFilterBar = () => (
    <div className="flex items-center gap-3 w-full max-w-screen-lg">
      <input
        aria-label="Buscar productos"
        className="flex-1 px-4 py-2 rounded border bg-background placeholder:text-muted"
        placeholder="Buscar por nombre, SKU o barcode..."
      />
      <div className="hidden sm:flex items-center gap-2">
        <button className="px-3 py-2 bg-surface border rounded">Filters</button>
        <button className="px-3 py-2 bg-surface border rounded">Advanced</button>
      </div>
    </div>
  );

  const BulkActionsToolbar = () => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-surface border rounded px-2 py-1">
        <input type="checkbox" aria-label="select-all" />
        <span className="text-sm text-muted">0 selected</span>
      </div>
      <button className="px-3 py-2 bg-primary text-primary-foreground rounded">Actualizar precios</button>
      <button className="px-3 py-2 bg-surface border rounded">Cambiar categoría</button>
      <div className="ml-2">
        <button className="px-2 py-1 bg-surface border rounded">Columns</button>
      </div>
    </div>
  );

  const DataTableSkeleton = () => (
    <div className="flex-1 min-w-0 overflow-hidden rounded-lg border bg-card">
      <div className="w-full overflow-auto">
        <table className="w-full min-w-[900px] table-auto text-sm">
          <thead>
            <tr>
              <th className="sticky top-0 bg-card/95 px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-left">Tax</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/5">
                <td className="px-4 py-2">
                  <div className="font-medium">Producto de ejemplo {i + 1}</div>
                  <div className="text-xs text-muted">Descripción corta o subtítulo</div>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-muted">SKU-000{i + 1}</td>
                <td className="px-4 py-2 text-right font-semibold text-primary-foreground">$99.00</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-muted-foreground/10 text-muted">16%</span>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700">In stock</span>
                </td>
                <td className="px-4 py-2">Suplementos</td>
                <td className="px-4 py-2">Yes</td>
                <td className="px-4 py-2">•••</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3 border rounded-lg p-4 bg-surface">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button className="text-xs text-muted">Collapse</button>
      </div>
      <div>{children}</div>
    </section>
  );

  // Side panel removed — use client modal component for add-product

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-4 p-4 bg-surface border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Catálogo</h2>
          <div className="text-sm text-muted">Productos y categorías</div>
        </div>
        <div className="flex items-center gap-3">
          <SearchAndFilterBar />
          <AddProductModal />
        </div>
      </div>

      <div className="flex gap-4 p-4 min-h-0">
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <BulkActionsToolbar />
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-surface border rounded">Density</button>
              <button className="px-2 py-1 bg-surface border rounded">Import</button>
            </div>
          </div>

          <DataTableSkeleton />
          <div className="p-4">
            <div className="text-xs text-muted">Pagination controls placeholder</div>
          </div>
        </div>

        {/* ColumnConfigurator could live here as collapsed panel on wide screens */}
        <div className="hidden lg:block w-64">
          <div className="p-4 border rounded bg-surface">Columns & settings</div>
        </div>
      </div>

      {/* Modal is provided by `AddProductModal` client component */}
    </div>
  );
}
