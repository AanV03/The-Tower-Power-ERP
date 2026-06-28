"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n";

type EntryStatus = "registered" | "draft" | "cancelled";

type Entry = {
  id: string;
  date: string;
  concept: string;
  amount: string;
  status: EntryStatus;
  type: string;
};

const RECENT_ENTRIES: Entry[] = [
  { id: "POL-00124", date: "Hoy, 10:30", concept: "Nómina Q1", amount: "$142,500.00", status: "registered", type: "Egreso" },
  { id: "POL-00123", date: "Hoy, 09:15", concept: "Cobro fra. 4920", amount: "$15,000.00", status: "draft", type: "Ingreso" },
  { id: "POL-00122", date: "Ayer", concept: "Depreciación equipos", amount: "$4,200.00", status: "registered", type: "Diario" },
  { id: "POL-00121", date: "Ayer", concept: "Pago servicios luz", amount: "$1,850.00", status: "registered", type: "Egreso" },
  { id: "POL-00120", date: "Hace 2 días", concept: "Ajuste inventario", amount: "$850.00", status: "cancelled", type: "Diario" },
];

function StatusBadge({ status }: { status: EntryStatus }) {
  switch (status) {
    case "registered":
      return <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">Registrada</Badge>;
    case "draft":
      return <Badge variant="outline">Borrador</Badge>;
    case "cancelled":
      return <Badge variant="secondary" className="bg-destructive/15 text-destructive hover:bg-destructive/25">Cancelada</Badge>;
  }
}

export function JournalEntryList({ locale }: { locale: Locale }) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5 h-full flex flex-col">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-lg">Pólizas Recientes</CardTitle>
        <CardDescription>Actividad contable del periodo actual.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4">
            {RECENT_ENTRIES.map((entry) => (
              <div 
                key={entry.id} 
                className="group relative rounded-2xl border border-border/70 bg-background p-4 shadow-xs transition-all hover:border-primary/30 hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{entry.id}</span>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="text-sm font-medium text-foreground leading-tight">{entry.concept}</p>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{entry.type}</span>
                  <span className="font-semibold tabular-nums">{entry.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
