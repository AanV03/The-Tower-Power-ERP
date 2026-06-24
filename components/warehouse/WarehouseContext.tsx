"use client";

import * as React from "react";

type ItemType = "sellable" | "internal";

export type InventoryItem = {
  id: string;
  sku?: string;
  name: string;
  type: ItemType;
  warehouseId: string;
  location?: string;
  quantityOnHand: number;
  reserved?: number;
  committed?: number;
  reorderPoint?: number;
  unit?: string;
};

export type Movement = {
  id: string;
  itemId: string;
  type: "RECEIPT" | "TRANSFER" | "ADJUSTMENT" | "CONSUMPTION" | "SALE";
  qty: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  reason?: string;
  user?: string;
  ts: string;
};

type WarehouseContextShape = {
  items: InventoryItem[];
  movements: Movement[];
  receive: (warehouseId: string, lines: { sku?: string; name?: string; qty: number }[]) => void;
  transfer: (from: string, to: string, lines: { itemId: string; qty: number }[]) => void;
  adjust: (itemId: string, qty: number, reason?: string) => void;
  consume: (itemId: string, qty: number, reason?: string) => void;
  exportCsv: (rows: InventoryItem[]) => void;
};

const WarehouseContext = React.createContext<WarehouseContextShape | null>(null);

function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const initialItems: InventoryItem[] = [
  { id: "i1", sku: "SKU-001", name: "Protein Powder 1kg", type: "sellable", warehouseId: "W1", location: "A1", quantityOnHand: 120, unit: "pcs", reorderPoint: 20 },
  { id: "i2", sku: "SKU-002", name: "Yoga Mat", type: "sellable", warehouseId: "W1", location: "A2", quantityOnHand: 45, unit: "pcs", reorderPoint: 10 },
  { id: "i3", name: "Cleaning Solvent 5L", type: "internal", warehouseId: "W1", location: "B1", quantityOnHand: 30, unit: "L", reorderPoint: 5 },
  { id: "i4", sku: "SKU-003", name: "Shaker Bottle", type: "sellable", warehouseId: "W2", location: "A1", quantityOnHand: 200, unit: "pcs", reorderPoint: 30 },
  { id: "i5", name: "Towel", type: "internal", warehouseId: "W2", location: "B2", quantityOnHand: 80, unit: "pcs", reorderPoint: 10 },
];

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<InventoryItem[]>(initialItems);
  const [movements, setMovements] = React.useState<Movement[]>([]);

  function pushMovement(m: Omit<Movement, "id" | "ts">) {
    const mv: Movement = { id: generateId("mv"), ts: new Date().toISOString(), ...m } as Movement;
    setMovements((s) => [mv, ...s]);
  }

  function receive(warehouseId: string, lines: { sku?: string; name?: string; qty: number }[]) {
    setItems((prev) => {
      const next = [...prev];
      for (const ln of lines) {
        let item = next.find((i) => ln.sku && i.sku === ln.sku && i.warehouseId === warehouseId);
        if (!item) {
          item = { id: generateId("i"), sku: ln.sku, name: ln.name ?? ln.sku ?? "New Item", type: ln.sku ? "sellable" : "internal", warehouseId, quantityOnHand: 0 };
          next.push(item);
        }
        item.quantityOnHand += ln.qty;
        pushMovement({ itemId: item.id, type: "RECEIPT", qty: ln.qty, toWarehouse: warehouseId });
      }
      return next;
    });
  }

  function transfer(from: string, to: string, lines: { itemId: string; qty: number }[]) {
    setItems((prev) => {
      const next = prev.map((i) => ({ ...i }));
      for (const ln of lines) {
        const src = next.find((i) => i.id === ln.itemId && i.warehouseId === from);
        const dest = next.find((i) => i.id === ln.itemId && i.warehouseId === to);
        if (src) src.quantityOnHand -= ln.qty;
        if (dest) dest.quantityOnHand += ln.qty;
        if (!dest && src) {
          const clone = { ...src, id: generateId("i"), warehouseId: to } as InventoryItem;
          clone.quantityOnHand = ln.qty;
          next.push(clone);
        }
        pushMovement({ itemId: ln.itemId, type: "TRANSFER", qty: ln.qty, fromWarehouse: from, toWarehouse: to });
      }
      return next;
    });
  }

  function adjust(itemId: string, qty: number, reason?: string) {
    setItems((prev) => {
      const next = prev.map((i) => ({ ...i }));
      const it = next.find((x) => x.id === itemId);
      if (it) {
        it.quantityOnHand += qty;
        pushMovement({ itemId: itemId, type: "ADJUSTMENT", qty, reason });
      }
      return next;
    });
  }

  function consume(itemId: string, qty: number, reason?: string) {
    // consumption behaves like negative adjustment but tagged
    setItems((prev) => {
      const next = prev.map((i) => ({ ...i }));
      const it = next.find((x) => x.id === itemId);
      if (it) {
        it.quantityOnHand -= qty;
        pushMovement({ itemId: itemId, type: "CONSUMPTION", qty, reason });
      }
      return next;
    });
  }

  function exportCsv(rows: InventoryItem[]) {
    const header = ["id", "sku", "name", "type", "warehouseId", "location", "quantityOnHand", "unit"].join(",");
    const lines = rows.map((r) => [r.id, r.sku ?? "", r.name, r.type, r.warehouseId, r.location ?? "", String(r.quantityOnHand), r.unit ?? ""].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warehouse-export-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const value: WarehouseContextShape = {
    items,
    movements,
    receive,
    transfer,
    adjust,
    consume,
    exportCsv,
  };

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse() {
  const ctx = React.useContext(WarehouseContext);
  if (!ctx) throw new Error("useWarehouse must be used within WarehouseProvider");
  return ctx;
}
