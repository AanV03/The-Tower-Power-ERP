import type { Locale } from "@/lib/i18n";

export default async function PosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  function CashierSelectorDropdown({ cashier }: { cashier?: string }) {
    return (
      <details className="relative" aria-label="Selector de cajero">
        <summary className="glass-control inline-flex items-center gap-2 px-3 py-2 rounded-md list-none cursor-pointer">
          <span className="w-8 h-8 rounded-full bg-[var(--brand-surface)] flex items-center justify-center text-sm text-[var(--brand-ink)]">C</span>
          <span className="text-sm font-medium">{cashier ?? "Cajero 1"}</span>
          <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <ul className="glass-menu absolute left-0 mt-2 w-48 shadow-md p-2 rounded" role="listbox">
          <li className="p-2 rounded hover:bg-[var(--sidebar-accent-hover)]" role="option" aria-selected={false}>Cajero 1 — Sucursal A</li>
          <li className="p-2 rounded hover:bg-[var(--sidebar-accent-hover)]" role="option" aria-selected={false}>Cajero 2 — Sucursal A</li>
          <li className="p-2 rounded hover:bg-[var(--sidebar-accent-hover)]" role="option" aria-selected={false}>Cajero 3 — Sucursal B</li>
        </ul>
      </details>
    );
  }

  function ProductCard({ name, price, stock }: { name: string; price: string; stock: string }) {
    return (
      <article className="glass-panel flex flex-col gap-2 p-3 rounded-md border focus-within:ring-2" aria-label={name}>
        <div className="h-20 bg-[var(--card)] rounded flex items-center justify-center text-xs text-[var(--text-muted)]">Imagen</div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-[var(--card-foreground)] truncate">{name}</div>
          <div className="text-sm text-[var(--text-muted)]">{price}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">{stock}</span>
          <button className="ml-2 px-2 py-1 bg-[var(--brand-orange)] text-white rounded text-sm">Add</button>
        </div>
      </article>
    );
  }

  function ProductThumbnail() {
    return <div className="w-12 h-12 bg-[var(--card)] rounded flex items-center justify-center text-xs text-[var(--text-muted)]">img</div>;
  }

  function QuantityControl({ sku, qty }: { sku: string; qty: number }) {
    return (
      <div className="inline-flex items-center border rounded overflow-hidden">
        <button className="px-2 py-1 text-sm" aria-label={`Disminuir ${sku}`}>-</button>
        <input aria-label={`Cantidad ${sku}`} className="w-12 text-center text-sm" defaultValue={String(qty)} />
        <button className="px-2 py-1 text-sm" aria-label={`Aumentar ${sku}`}>+</button>
      </div>
    );
  }

  function StockBadge({ state }: { state?: string }) {
    return <div className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">{state ?? "En stock"}</div>;
  }

  function CartRow({ sku, name, qty, price, stockState }: { sku: string; name: string; qty: number; price: string; stockState?: string }) {
    return (
      <li className="flex items-start gap-4 p-3">
        <div className="flex-shrink-0">
          <ProductThumbnail />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-sm text-[var(--text-muted)]">{price}</div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <QuantityControl sku={sku} qty={qty} />
            <StockBadge state={stockState} />
          </div>
        </div>
      </li>
    );
  }

  function TotalSummaryPanel() {
    return (
      <aside className="glass-panel h-full flex flex-col gap-4 p-4 rounded">
        <div className="text-lg font-semibold">Resumen de venta</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]"><span>Subtotal</span><span>$0.00</span></div>
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]"><span>Impuestos</span><span>$0.00</span></div>
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]"><span>Descuentos</span><span>-$0.00</span></div>
          <div className="border-t pt-3 flex items-center justify-between text-xl font-bold"><span>Total</span><span>$0.00</span></div>
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <button className="w-full py-3 bg-[var(--brand-orange)] text-white rounded-lg text-lg font-semibold">Cobrar</button>
          <button className="w-full py-2 glass-control rounded text-sm">Pendiente / Guardar</button>
        </div>
      </aside>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-sm">
      <header className="w-full flex items-center justify-between p-3 glass-topbar sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Punto de Venta</h1>
          <CashierSelectorDropdown />
        </div>
        <div className="flex items-center gap-2">
          <button className="topbar-icon-button px-3 py-2 rounded-md">Imprimir</button>
          <button className="topbar-icon-button px-3 py-2 rounded-md">Cancelar</button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 grid grid-cols-12 gap-4">
        <section className="col-span-5 h-full flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 glass-effect rounded-md">
            <input aria-label="Buscar producto" placeholder="Buscar producto o escanear código" className="flex-1 px-3 py-2 rounded-md border focus:ring-2 focus:ring-ring" />
            <button className="px-3 py-2 rounded-md bg-[var(--brand-orange)] text-white">Buscar</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 glass-control rounded">Todos</button>
            <button className="px-2 py-1 glass-control rounded">En stock</button>
            <button className="px-2 py-1 glass-control rounded">Favoritos</button>
          </div>
          <div className="flex-1 overflow-auto grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
            <ProductCard name="Batido Proteico" price="$12.00" stock="12" />
            <ProductCard name="Toalla" price="$5.00" stock="20" />
            <ProductCard name="Botella" price="$8.00" stock="4" />
            <ProductCard name="Guantes" price="$15.00" stock="0" />
            <ProductCard name="Camiseta" price="$22.00" stock="3" />
            <ProductCard name="Mancuerna 2kg" price="$18.00" stock="6" />
          </div>
        </section>

        <section className="col-span-4 h-full flex flex-col gap-3 glass-panel overflow-hidden">
          <div className="p-3 border-b sticky top-0 z-20 glass-effect">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Carrito</h2>
              <div className="text-xs text-[var(--text-muted)]">Items: 0</div>
            </div>
          </div>
          <ul className="flex-1 overflow-auto divide-y">
            <CartRow sku="SKU-001" name="Batido Proteico" qty={2} price="$24.00" stockState="En stock" />
            <CartRow sku="SKU-002" name="Toalla" qty={1} price="$5.00" stockState="En stock" />
            <CartRow sku="SKU-003" name="Botella" qty={1} price="$8.00" stockState="Bajo stock" />
          </ul>
          <div className="p-3 border-t">
            <label htmlFor="nota-rapida" className="text-xs text-gray-500">Nota rápida</label>
            <input id="nota-rapida" className="w-full mt-2 px-3 py-2 border rounded" placeholder="Ej: paquete regalo, factura" />
          </div>
        </section>

        <section className="col-span-3 h-full flex flex-col gap-4">
          <div className="sticky top-16">
            <TotalSummaryPanel />
          </div>
        </section>
      </main>
    </div>
  );
}
