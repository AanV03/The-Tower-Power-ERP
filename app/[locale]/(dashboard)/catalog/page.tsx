import AddProductModal from "@/components/catalog/add-product-modal";
import { requireApiContext } from "@/lib/api/context";
import { formatCurrency } from "@/lib/api/pagination";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const context = await requireApiContext({ moduleId: "catalog" });
  const products = await prisma.product.findMany({
    where: { tenantId: context.tenantId },
    include: { category: true, inventoryItems: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="flex flex-col gap-4 border-b border-border/60 bg-card/50 p-6 backdrop-blur-md xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Catalogo</h2>
            <div className="hidden text-sm text-muted-foreground sm:block">Productos y categorias</div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Crea productos reales para POS e inventario.</p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            aria-label="Buscar productos"
            className="min-w-0 rounded-xl border border-border/80 bg-background px-4 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-80"
            placeholder="Buscar por nombre o SKU..."
          />
          <AddProductModal />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6 overflow-hidden p-6">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-1.5 shadow-xs">
                <input type="checkbox" aria-label="select-all" className="rounded border-border text-primary focus:ring-primary/30" />
                <span className="text-xs font-medium text-muted-foreground">0 seleccionados</span>
              </div>
              <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition hover:brightness-110">
                Actualizar precios
              </button>
              <button className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                Cambiar categoria
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card/70 shadow-xs backdrop-blur-md">
            <div className="w-full overflow-auto">
              <table className="w-full min-w-[900px] table-auto text-sm">
                <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="sticky top-0 bg-card/95 px-6 py-4 text-left">Nombre</th>
                    <th className="px-6 py-4 text-left">SKU</th>
                    <th className="px-6 py-4 text-right">Precio</th>
                    <th className="px-6 py-4 text-left">Impuesto</th>
                    <th className="px-6 py-4 text-left">Stock</th>
                    <th className="px-6 py-4 text-left">Categoria</th>
                    <th className="px-6 py-4 text-left">Activo</th>
                    <th className="px-6 py-4 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Sin productos registrados. Crea el primero con Agregar producto.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const stock = product.inventoryItems.reduce((sum, item) => sum + Number(item.quantityOnHand), 0);

                      return (
                        <tr key={product.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground">{product.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">Producto real del catalogo</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{product.sku}</td>
                          <td className="px-6 py-4 text-right font-bold text-primary">{formatCurrency(product.price.toString())}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {product.taxRate.toString()}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{product.category?.name ?? "Sin categoria"}</td>
                          <td className="px-6 py-4 text-muted-foreground">{product.status === "ACTIVE" ? "Si" : "No"}</td>
                          <td className="px-6 py-4 text-muted-foreground">...</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-xl border border-border bg-card/60 p-5 text-sm font-semibold text-foreground shadow-xs backdrop-blur-md">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Configuraciones</h4>
            <p className="text-xs font-normal leading-5 text-muted-foreground">
              Los productos creados aqui quedan disponibles para movimientos de inventario y POS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
