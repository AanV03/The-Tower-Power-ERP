"use client";

import { useState, useId } from "react";
import { Plus } from "lucide-react";
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

type BranchOption = {
  id: string;
  name: string;
};

export function WarehouseFormDialog({ branches }: { branches: BranchOption[] }) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre del almacén es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/inventory/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          branchId: branchId || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al crear el almacén");
      }

      toast.success(`Almacén "${result.data.name}" creado correctamente`);
      setOpen(false);
      setName("");
      setBranchId("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Plus className="size-4" />
            Nuevo Almacén
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Almacén</DialogTitle>
          <DialogDescription>
            Registra una nueva bodega o almacén para almacenar inventario de productos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-name`}>
            <span>Nombre del Almacén</span>
            <Input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Almacén de Suplementos"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-branch`}>
            <span>Sucursal (Opcional)</span>
            <NativeSelect
              id={`${formId}-branch`}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full"
            >
              <NativeSelectOption value="">Seleccionar sucursal...</NativeSelectOption>
              {branches.map((branch) => (
                <NativeSelectOption key={branch.id} value={branch.id}>
                  {branch.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Almacén"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
