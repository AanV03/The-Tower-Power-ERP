"use client";

import { useState, useId, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";

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

type ProductData = {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  price: number;
  cost: number;
  taxRate: number;
  imageUrl: string | null;
  status: string;
};

const PRODUCT_IMAGE_PRESETS = [
  { name: "Proteína / Suplemento", url: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=60" },
  { name: "Shaker / Botella", url: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500&auto=format&fit=crop&q=60" },
  { name: "Mancuernas / Pesas", url: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500&auto=format&fit=crop&q=60" },
  { name: "Bebida Energética", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60" },
  { name: "Toalla Gym", url: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500&auto=format&fit=crop&q=60" },
  { name: "Guantes / Correas", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60" },
  { name: "Barra de Proteína", url: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=500&auto=format&fit=crop&q=60" },
];

export function ProductFormDialog({
  categories,
  product,
  trigger,
}: {
  categories: CategoryOption[];
  product?: ProductData;
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [taxRate, setTaxRate] = useState("16");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);

  // Sync fields when dialog opens or edit product changes
  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setCategoryId(product.categoryId || "");
      setPrice(String(product.price));
      setCost(String(product.cost));
      setTaxRate(String(product.taxRate));
      setImageUrl(product.imageUrl || "");
      setStatus(product.status);
    } else {
      setSku("");
      setName("");
      setCategoryId("");
      setPrice("");
      setCost("");
      setTaxRate("16");
      setImageUrl("");
      setStatus("ACTIVE");
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return toast.error("El SKU es obligatorio");
    if (!name.trim()) return toast.error("El nombre del producto es obligatorio");
    if (!price || isNaN(Number(price))) return toast.error("Precio de venta inválido");
    if (!cost || isNaN(Number(cost))) return toast.error("Costo de adquisición inválido");

    setLoading(true);
    const toastId = toast.loading(product ? "Actualizando producto..." : "Creando producto...");

    try {
      const url = product ? `/api/catalog/products/${product.id}` : "/api/catalog/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.trim(),
          name: name.trim(),
          categoryId: categoryId || undefined,
          price: Number(price),
          cost: Number(cost),
          taxRate: Number(taxRate),
          imageUrl: imageUrl.trim() || undefined,
          status,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ocurrió un error al procesar el producto");
      }

      toast.success(product ? "Producto actualizado correctamente" : "Producto creado correctamente", {
        id: toastId,
      });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el producto", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {product
                ? "Modifica las propiedades de este producto del catálogo."
                : "Agrega un nuevo artículo de venta, suplemento o equipo al catálogo general."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-muted-foreground">
                Nombre del Producto
              </label>
              <Input
                id={`${formId}-name`}
                type="text"
                placeholder="Ej. Proteína de Suero de Leche 1kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${formId}-sku`} className="text-xs font-semibold text-muted-foreground">
                SKU (Código único)
              </label>
              <Input
                id={`${formId}-sku`}
                type="text"
                placeholder="Ej. WHEY-PRO-1KG"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${formId}-category`} className="text-xs font-semibold text-muted-foreground">
                Categoría
              </label>
              <NativeSelect
                id={`${formId}-category`}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
                className="w-full !w-full"
              >
                <NativeSelectOption value="">Sin categoría</NativeSelectOption>
                {categories.map((c) => (
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

            <div className="space-y-1">
              <label htmlFor={`${formId}-price`} className="text-xs font-semibold text-muted-foreground">
                Precio de Venta ($)
              </label>
              <Input
                id={`${formId}-price`}
                type="number"
                step="any"
                min="0"
                placeholder="Ej. 750.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={`${formId}-cost`} className="text-xs font-semibold text-muted-foreground">
                Costo de Adquisición ($)
              </label>
              <Input
                id={`${formId}-cost`}
                type="number"
                step="any"
                min="0"
                placeholder="Ej. 450.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor={`${formId}-tax`} className="text-xs font-semibold text-muted-foreground">
                Tasa de Impuesto (%)
              </label>
              <NativeSelect
                id={`${formId}-tax`}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                disabled={loading}
                className="w-full !w-full"
              >
                <NativeSelectOption value="0">0% (Exento)</NativeSelectOption>
                <NativeSelectOption value="8">8% (Frontera)</NativeSelectOption>
                <NativeSelectOption value="16">16% (IVA General)</NativeSelectOption>
              </NativeSelect>
            </div>

            {/* Image URL & Previsualización */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor={`${formId}-image`} className="text-xs font-semibold text-muted-foreground">
                URL de Imagen de Producto
              </label>
              <Input
                id={`${formId}-image`}
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Presets & Previsualizador de Imagen */}
            <div className="sm:col-span-2 border border-dashed rounded-xl p-3 bg-muted/20 space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Imágenes Predefinidas
              </div>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="text-[10px] font-medium bg-card border hover:border-primary/50 transition-colors px-2 py-1.5 rounded-lg cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {imageUrl && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative size-14 border rounded-lg overflow-hidden bg-muted/30 shrink-0">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Vista previa de la imagen cargada
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
