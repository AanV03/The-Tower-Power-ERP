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

type BranchOption = {
  id: string;
  name: string;
};

type WarehouseData = {
  id: string;
  name: string;
  branchId: string;
};

export function WarehouseFormDialog({
  branches,
  warehouse,
  trigger,
}: {
  branches: BranchOption[];
  warehouse?: WarehouseData;
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync edit mode fields
  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name);
      setBranchId(warehouse.branchId);
    } else {
      setName("");
      setBranchId(branches[0]?.id || "");
    }
  }, [warehouse, open, branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre del almacén es requerido");
      return;
    }
    if (!branchId) {
      toast.error("Debe seleccionar una sucursal");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      warehouse ? "Actualizando almacén..." : "Creando almacén..."
    );

    try {
      const url = warehouse
        ? `/api/inventory/warehouses/${warehouse.id}`
        : "/api/inventory/warehouses";
      const method = warehouse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), branchId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ocurrió un error al procesar la solicitud");
      }

      toast.success(
        warehouse
          ? "Almacén actualizado correctamente"
          : "Almacén creado correctamente",
        { id: toastId }
      );
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la solicitud", { id: toastId });
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
            <DialogTitle>
              {warehouse ? "Editar Almacén" : "Nuevo Almacén"}
            </DialogTitle>
            <DialogDescription>
              {warehouse
                ? "Modifica los datos del almacén físico a continuación."
                : "Agrega una nueva bodega o almacén físico vinculado a una sucursal."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-muted-foreground">
                Nombre del Almacén
              </label>
              <Input
                id={`${formId}-name`}
                type="text"
                placeholder="Ej. Bodega Principal, Almacén A, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${formId}-branch`} className="text-xs font-semibold text-muted-foreground">
                Sucursal Asociada
              </label>
              <NativeSelect
                id={`${formId}-branch`}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                disabled={loading}
                className="w-full !w-full"
              >
                <NativeSelectOption value="">Seleccionar Sucursal</NativeSelectOption>
                {branches.map((b) => (
                  <NativeSelectOption key={b.id} value={b.id}>
                    {b.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Almacén"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
