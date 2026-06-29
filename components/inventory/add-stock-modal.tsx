"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
};

export function AddStockModal({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productId = String(formData.get("productId") ?? "");
    const quantity = Number(formData.get("quantity") ?? 0);

    if (!productId || quantity <= 0) {
      toast.error("Selecciona un producto y una cantidad mayor a cero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventory/movements", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          type: "PURCHASE",
          sourceType: "DEMO_STOCK_IN",
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        const issue = Array.isArray(result?.issues) ? result.issues[0]?.message : undefined;
        throw new Error(issue ?? result?.message ?? "No se pudo registrar el movimiento.");
      }

      toast.success("Stock agregado correctamente.");
      setOpen(false);
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el movimiento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
        disabled={products.length === 0}
      >
        Agregar stock
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background text-foreground shadow-2xl">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-lg font-semibold">Crear movimiento</h3>
              <p className="text-sm text-muted-foreground">Suma unidades al almacen principal de la sucursal.</p>
            </div>

            <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
              <label className="grid gap-1.5 text-sm font-medium">
                Producto
                <select
                  name="productId"
                  required
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.sku}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Cantidad
                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="10"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
