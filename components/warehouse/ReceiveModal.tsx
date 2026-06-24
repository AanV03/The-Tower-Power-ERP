"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWarehouse } from "./WarehouseContext";

export default function ReceiveModal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState("");
  const [warehouse, setWarehouse] = useState("W1");
  const { receive } = useWarehouse();

  function submit() {
    // parse lines like SKU:qty,SKU:qty or name:qty
    const parsed = lines.split(",").map((s) => {
      const [left, right] = s.split(":").map((t) => t && t.trim());
      const qty = Number(right || 0);
      if (!left) return null;
      if (left && left.startsWith("SKU-")) return { sku: left, qty };
      return { name: left, qty };
    }).filter(Boolean) as { sku?: string; name?: string; qty: number }[];

    receive(warehouse, parsed);
    setOpen(false);
    setLines("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recepciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Registrar nuevas recepciones</p>
          <Button size="sm" onClick={() => setOpen(true)}>Nueva recepción</Button>
        </div>
        {open ? (
          <div className="mt-3">
            <div className="grid gap-2">
              <select className="select" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                <option value="W1">Bodega W1</option>
                <option value="W2">Bodega W2</option>
              </select>
              <input className="input" placeholder="SKU:qty,SKU:qty o Nombre:qty" value={lines} onChange={(e) => setLines(e.target.value)} />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button size="sm" onClick={submit}>Registrar</Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
