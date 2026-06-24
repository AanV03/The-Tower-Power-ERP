"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function InventoryTable({ rows, locale }: { rows: any[]; locale: string }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any, idx: number) => (
                <TableRow key={`${r.sku}-${idx}`}>
                  <TableCell>
                    <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggle(r.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{r.sku}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.stock}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">Ajustar</Button>
                      <Button size="sm" variant="ghost">Transferir</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
