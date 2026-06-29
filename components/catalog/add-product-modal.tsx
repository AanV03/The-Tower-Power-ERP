"use client";

import React, { useState } from "react";

export default function AddProductModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:brightness-105 active:scale-[0.98]"
        type="button"
      >
        Agregar producto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-card text-card-foreground shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Nuevo producto</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                type="button"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="mt-1 p-2 border rounded bg-background">Product name</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">SKU</div>
                  <div className="mt-1 p-2 border rounded bg-background font-mono">SKU-0001</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="mt-1 p-2 border rounded bg-background font-semibold text-foreground">$99.00</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">(Formulario simplificado - sin logica)</div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-105"
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
