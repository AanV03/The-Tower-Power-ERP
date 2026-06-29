"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddProductModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const sku = String(formData.get("sku") ?? "").trim();
    const price = String(formData.get("price") ?? "").trim();
    const cost = String(formData.get("cost") ?? "").trim();

    if (!name || !price) {
      toast.error("Captura nombre y precio para crear el producto.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/catalog/products", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          price,
          cost: cost || undefined,
          taxRate: formData.get("taxRate") || 0,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        const issue = Array.isArray(result?.issues) ? result.issues[0]?.message : undefined;
        throw new Error(issue ?? result?.message ?? "No se pudo crear el producto.");
      }

      toast.success("Producto creado correctamente.");
      setOpen(false);
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el producto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
      >
        Agregar producto
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm w-screen h-screen m-0 p-4 left-0 top-0">
          <form
            className="relative z-[10000] flex flex-col w-full max-w-2xl max-h-[85vh] bg-background rounded-xl shadow-2xl overflow-hidden border"
            onSubmit={handleSubmit}
          >
            <div className="shrink-0 p-6 border-b">
              <div className="flex items-start justify-between gap-4 text-foreground">
                <div>
                  <h3 className="text-lg font-semibold">Agregar Producto</h3>
                  <p className="text-sm text-muted-foreground">Crea un producto real en catalogo para usarlo en inventario.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  disabled={isSubmitting}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Nombre
                <input
                  name="name"
                  required
                  placeholder="Proteina whey 2 lb"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                SKU
                <input
                  name="sku"
                  placeholder="SKU-0001"
                  className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Impuesto %
                <input
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue="0"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Precio
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="99.00"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Costo
                <input
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Opcional"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <div className="shrink-0 p-4 border-t flex justify-end gap-3 bg-muted/30">
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
                {isSubmitting ? "Guardando..." : "Guardar producto"}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
