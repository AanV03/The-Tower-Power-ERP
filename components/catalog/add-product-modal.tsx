"use client";

import React, { useState } from "react";

export default function AddProductModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-primary text-primary-foreground rounded"
      >
        Agregar producto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl bg-card rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Nuevo producto</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-muted px-2 py-1 rounded"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted">Name</label>
                  <div className="mt-1 p-2 border rounded bg-background">Product name</div>
                </div>
                <div>
                  <label className="text-xs text-muted">SKU</label>
                  <div className="mt-1 p-2 border rounded bg-background font-mono">SKU-0001</div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted">Price</label>
                  <div className="mt-1 p-2 border rounded bg-background font-semibold text-primary-foreground">$99.00</div>
                </div>
              </div>

              <div className="text-sm text-muted">(Formulario simplificado — sin lógica)</div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 bg-surface border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 bg-primary text-primary-foreground rounded"
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
