"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWarehouse } from "./WarehouseContext";

export default function AdjustmentModal() {
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("");
  const { items, adjust } = useWarehouse();

  function submit() {
    const it = items.find((i) => i.sku === sku || i.id === sku);
    if (it) adjust(it.id, qty, reason);
    setOpen(false);
    setSku("");
    setQty(0);
    setReason("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajustes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Registrar ajuste manual</p>
          <Button size="sm" onClick={() => setOpen(true)}>Nuevo ajuste</Button>
        </div>
        {open ? (
          <div className="mt-3">
            <input className="input" placeholder="SKU o itemId" value={sku} onChange={(e) => setSku(e.target.value)} />
            <input className="input" placeholder="Cantidad (positivo/negativo)" value={String(qty)} onChange={(e) => setQty(Number(e.target.value))} />
            <input className="input" placeholder="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={submit}>Registrar</Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
