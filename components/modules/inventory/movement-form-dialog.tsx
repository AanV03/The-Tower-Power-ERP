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
import { headerPrimaryActionClass } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";

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

export function MovementFormDialog({
  locale,
  products,
  warehouses,
  defaultProductId = "",
  defaultWarehouseId = "",
  trigger,
}: {
  locale: Locale;
  products: ProductOption[];
  warehouses: WarehouseOption[];
  defaultProductId?: string;
  defaultWarehouseId?: string;
  trigger?: React.ReactElement;
}) {
  const t = getDictionary(locale).inventory;
  const movementTypes = Object.entries(t.movementTypeOptions).map(([value, label]) => ({ value, label }));
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
      toast.error(t.toast.selectProduct);
      return;
    }
    if (!warehouseId) {
      toast.error(t.toast.selectWarehouse);
      return;
    }
    const qtyVal = parseFloat(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      toast.error(t.toast.positiveQuantity);
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
          sourceType: t.manualAdjustment,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || t.toast.movementFailed);
      }

      toast.success(t.toast.movementSuccess);
      setOpen(false);
      setProductId("");
      setWarehouseId("");
      setQuantity("");
      setUnitCost("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.toast.unexpected);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" className={headerPrimaryActionClass}>
              <ArrowRightLeft className="size-4" />
              {t.actions.newMovement}
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.movementDialog.title}</DialogTitle>
          <DialogDescription>
            {t.movementDialog.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-product`}>
            <span>{t.fields.product}</span>
            <NativeSelect
              id={`${formId}-product`}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full"
              required
            >
              <NativeSelectOption value="">{t.movementDialog.selectProduct}</NativeSelectOption>
              {products.map((prod) => (
                <NativeSelectOption key={prod.id} value={prod.id}>
                  [{prod.sku}] {prod.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-warehouse`}>
            <span>{t.fields.warehouse}</span>
            <NativeSelect
              id={`${formId}-warehouse`}
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full"
              required
            >
              <NativeSelectOption value="">{t.movementDialog.selectWarehouse}</NativeSelectOption>
              {warehouses.map((wh) => (
                <NativeSelectOption key={wh.id} value={wh.id}>
                  {wh.name} ({wh.branchName})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-type`}>
            <span>{t.movementDialog.type}</span>
            <NativeSelect
              id={`${formId}-type`}
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full"
              required
            >
              {movementTypes.map((mType) => (
                <NativeSelectOption key={mType.value} value={mType.value}>
                  {mType.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-quantity`}>
              <span>{t.fields.quantity}</span>
              <Input
                id={`${formId}-quantity`}
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t.movementDialog.quantityPlaceholder}
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-cost`}>
              <span>{t.movementDialog.unitCost}</span>
              <Input
                id={`${formId}-cost`}
                type="number"
                step="any"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder={t.movementDialog.costPlaceholder}
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
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.actions.registering : t.actions.register}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
