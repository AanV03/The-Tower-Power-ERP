"use client";

import { Button } from "@/components/ui/button";
import { useWarehouse } from "./WarehouseContext";

export default function ExportButton({ rows }: { rows?: any[] }) {
  const { exportCsv } = useWarehouse();

  function handleExport() {
    const toExport = rows ?? [];
    // if rows look like InventoryItem, pass through, otherwise convert
    const normalized = toExport.map((r: any) =>
      r && r.quantityOnHand !== undefined
        ? r
        : { id: r.id ?? "", sku: r.sku ?? "", name: r.name ?? "", type: r.type ?? "sellable", warehouseId: r.warehouseId ?? "W1", location: r.location ?? "", quantityOnHand: r.stock ?? 0, unit: r.unit ?? "" }
    );
    exportCsv(normalized);
  }

  return (
    <Button size="sm" onClick={handleExport}>
      Exportar
    </Button>
  );
}
