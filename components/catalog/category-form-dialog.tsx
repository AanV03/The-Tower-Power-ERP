"use client";

import { useState, useId, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

type CategoryOption = {
  id: string;
  name: string;
};

type CategoryData = {
  id: string;
  name: string;
  parentId: string | null;
  status: string;
};

export function CategoryFormDialog({
  categories,
  category,
  trigger,
}: {
  categories: CategoryOption[];
  category?: CategoryData;
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);

  // Sync fields on load/edit
  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parentId || "");
      setStatus(category.status);
    } else {
      setName("");
      setParentId("");
      setStatus("ACTIVE");
    }
  }, [category, open]);

  // Filter out the category itself when setting a parent, to avoid infinite loops
  const parentOptions = categories.filter((c) => !category || c.id !== category.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("El nombre de la categoría es obligatorio");

    setLoading(true);
    const toastId = toast.loading(category ? "Actualizando categoría..." : "Creando categoría...");

    try {
      const url = category ? `/api/catalog/categories/${category.id}` : "/api/catalog/categories";
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          parentId: parentId || undefined,
          status,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ocurrió un error al guardar la categoría");
      }

      toast.success(category ? "Categoría actualizada correctamente" : "Categoría creada correctamente", {
        id: toastId,
      });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la categoría", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[425px]">
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>
              {category
                ? "Edita las propiedades de la categoría de productos."
                : "Agrega una nueva categoría para organizar los productos del catálogo."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-muted-foreground">
                Nombre de la Categoría
              </label>
              <Input
                id={`${formId}-name`}
                type="text"
                placeholder="Ej. Suplementos, Accesorios, Bebidas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${formId}-parent`} className="text-xs font-semibold text-muted-foreground">
                Categoría Padre (Opcional)
              </label>
              <NativeSelect
                id={`${formId}-parent`}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={loading}
                className="w-full !w-full"
              >
                <NativeSelectOption value="">Ninguna (Nivel superior)</NativeSelectOption>
                {parentOptions.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <label htmlFor={`${formId}-status`} className="text-xs font-semibold text-muted-foreground">
                Estado
              </label>
              <NativeSelect
                id={`${formId}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-full !w-full"
              >
                <NativeSelectOption value="ACTIVE">Activo</NativeSelectOption>
                <NativeSelectOption value="INACTIVE">Inactivo</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
