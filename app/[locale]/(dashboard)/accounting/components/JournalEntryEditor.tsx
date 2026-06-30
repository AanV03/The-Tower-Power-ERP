"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Calculator, CheckCircle2, AlertCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type JournalLine = {
  id: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
};

export function JournalEntryEditor({ locale }: { locale: Locale }) {
  const [lines, setLines] = useState<JournalLine[]>([
    { id: "1", account: "1100-01 - Bancos Nacionales", description: "Cobro de factura", debit: 15000, credit: 0 },
    { id: "2", account: "1200-05 - Cuentas por Cobrar", description: "Cancelación de saldo", debit: 0, credit: 15000 },
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), account: "", description: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof JournalLine, value: string | number) => {
    setLines(lines.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;
  const difference = Math.abs(totalDebit - totalCredit);

  const formatCurrency = (val: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(val);

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5 h-full flex flex-col">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Editor de Póliza</CardTitle>
            <CardDescription>Crea un nuevo asiento contable asegurando que los saldos cuadren.</CardDescription>
          </div>
          <Badge variant={isBalanced ? "default" : "destructive"} className="flex items-center gap-1.5 px-3 py-1 text-sm">
            {isBalanced ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {isBalanced ? "Cuadrada" : "Descuadrada"}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="space-y-1.5">
            <label htmlFor="je-date" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Fecha</label>
            <input id="je-date" type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="je-type" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tipo</label>
            <select id="je-type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
              <option>Ingreso</option>
              <option>Egreso</option>
              <option>Diario</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="je-concept" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Concepto General</label>
            <input id="je-concept" type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" placeholder="Ej. Pago de nómina Quincena 1" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        <div className="rounded-xl border border-border bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[280px]">Cuenta</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[140px] text-right">Debe</TableHead>
                <TableHead className="w-[140px] text-right">Haber</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none text-sm font-medium" 
                      placeholder="Buscar cuenta..."
                      value={line.account}
                      onChange={(e) => updateLine(line.id, "account", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none focus:outline-none text-sm text-muted-foreground" 
                      placeholder="Opcional"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:outline-none text-sm text-right tabular-nums" 
                      placeholder="0.00"
                      value={line.debit || ""}
                      onChange={(e) => updateLine(line.id, "debit", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none focus:outline-none text-sm text-right tabular-nums" 
                      placeholder="0.00"
                      value={line.credit || ""}
                      onChange={(e) => updateLine(line.id, "credit", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => removeLine(line.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      disabled={lines.length <= 2}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-3 border-t border-border bg-muted/20">
            <button 
              onClick={addLine}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="size-4" />
              Agregar partida
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-4 border-t border-border/70 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calculator className="size-4" />
            <span>Totales calculados en tiempo real</span>
          </div>
          <div className="flex items-center gap-8 font-semibold tabular-nums">
            <div className={`text-right ${isBalanced ? "text-foreground" : "text-destructive"}`}>
              <span className="text-xs uppercase text-muted-foreground mr-3">Debe</span>
              <span className="text-lg">{formatCurrency(totalDebit)}</span>
            </div>
            <div className={`text-right ${isBalanced ? "text-foreground" : "text-destructive"}`}>
              <span className="text-xs uppercase text-muted-foreground mr-3">Haber</span>
              <span className="text-lg">{formatCurrency(totalCredit)}</span>
            </div>
          </div>
        </div>

        {!isBalanced && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium text-right">
            Diferencia de {formatCurrency(difference)} por cuadrar
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button className="rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-medium shadow-xs">
            Guardar Borrador
          </button>
          <button 
            disabled={!isBalanced}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Registrar Póliza
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
