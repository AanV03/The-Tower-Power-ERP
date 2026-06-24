"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWarehouse } from "./WarehouseContext";

export default function TransferModal() {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("W1");
  const [to, setTo] = useState("W2");
  const [lines, setLines] = useState("");
  const { items, transfer } = useWarehouse();

  function submit() {
    // parse lines like itemId:qty or SKU:qty
    const parsed = lines.split(",").map((s) => {
      const [left, right] = s.split(":").map((t) => t && t.trim());
      const qty = Number(right || 0);
      const bySku = items.find((it) => it.sku === left && it.warehouseId === from);
      if (bySku) return { itemId: bySku.id, qty };
      return null;
    }).filter(Boolean) as { itemId: string; qty: number }[];

    transfer(from, to, parsed);
    setOpen(false);
    setLines("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transferencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Crear transferencia entre bodegas</p>
          <Button size="sm" onClick={() => setOpen(true)}>Nueva transferencia</Button>
        </div>
        {open ? (
          <div className="mt-3">
            <div className="grid gap-2">
              <div className="flex gap-2">
                <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
                  <option value="W1">W1</option>
                  <option value="W2">W2</option>
                </select>
                <select className="select" value={to} onChange={(e) => setTo(e.target.value)}>
                  <option value="W1">W1</option>
                  <option value="W2">W2</option>
                </select>
              </div>
              <input className="input" placeholder="SKU:qty,SKU:qty" value={lines} onChange={(e) => setLines(e.target.value)} />
              <div className="flex items-center gap-2 mt-2">
                <Button size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button size="sm" onClick={submit}>Crear</Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
