"use client";

import { useState, useId, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
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

type ProductOption = {
  id: string;
  name: string;
  sku: string;
};

type WarehouseOption = {
  id: string;
  name: string;
  branchName: string;
};

const MOVEMENT_TYPES = [
  { value: "PURCHASE", label: "Compra (Entrada)" },
  { value: "TRANSFER_IN", label: "Traspaso Recibido (Entrada)" },
  { value: "ADJUSTMENT", label: "Ajuste de Stock (Entrada)" },
  { value: "TRANSFER_OUT", label: "Traspaso Enviado (Salida)" },
  { value: "SHRINKAGE", label: "Merma / Pérdida (Salida)" },
];

export function MovementFormDialog({
  products,
  warehouses,
  defaultProductId = "",
  defaultWarehouseId = "",
  trigger,
}: {
  products: ProductOption[];
  warehouses: WarehouseOption[];
  defaultProductId?: string;
  defaultWarehouseId?: string;
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(defaultProductId);
  const [warehouseId, setWarehouseId] = useState(defaultWarehouseId);
  const [type, setType] = useState("PURCHASE");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setProductId(defaultProductId);
      setWarehouseId(defaultWarehouseId);
    } else {
      setQuantity("");
      setUnitCost("");
    }
  }, [open, defaultProductId, defaultWarehouseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) {
      toast.error("Por favor, selecciona un producto");
      return;
    }
    if (!warehouseId) {
      toast.error("Por favor, selecciona un almacén");
      return;
    }
    const qtyVal = parseFloat(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      toast.error("La cantidad debe ser un número positivo");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/warehouse/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          warehouseId,
          type,
          quantity: qtyVal,
          unitCost: unitCost ? parseFloat(unitCost) : undefined,
          sourceType: "Ajuste manual",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al registrar el movimiento");
      }

      toast.success("Movimiento registrado y stock actualizado con éxito");
      setOpen(false);
      setProductId("");
      setWarehouseId("");
      setQuantity("");
      setUnitCost("");
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
          trigger ?? (
            <Button size="sm">
              <ArrowRightLeft className="size-4" />
              Nuevo Movimiento
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>
            Registra una entrada, salida o ajuste físico de stock. Esto impactará las existencias en tiempo real.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-product`}>
            <span>Producto</span>
            <NativeSelect
              id={`${formId}-product`}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full"
              required
            >
              <NativeSelectOption value="">Seleccionar producto...</NativeSelectOption>
              {products.map((prod) => (
                <NativeSelectOption key={prod.id} value={prod.id}>
                  [{prod.sku}] {prod.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-warehouse`}>
            <span>Almacén</span>
            <NativeSelect
              id={`${formId}-warehouse`}
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full"
              required
            >
              <NativeSelectOption value="">Seleccionar almacén...</NativeSelectOption>
              {warehouses.map((wh) => (
                <NativeSelectOption key={wh.id} value={wh.id}>
                  {wh.name} ({wh.branchName})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-type`}>
            <span>Tipo de Movimiento</span>
            <NativeSelect
              id={`${formId}-type`}
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full"
              required
            >
              {MOVEMENT_TYPES.map((mType) => (
                <NativeSelectOption key={mType.value} value={mType.value}>
                  {mType.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-quantity`}>
              <span>Cantidad</span>
              <Input
                id={`${formId}-quantity`}
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ej. 10"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-cost`}>
              <span>Costo Unitario (Opcional)</span>
              <Input
                id={`${formId}-cost`}
                type="number"
                step="any"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="Ej. 150.00"
              />
            </label>
          </div>

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
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
