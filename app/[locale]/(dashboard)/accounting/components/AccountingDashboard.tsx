"use client";

import { Badge } from "@/components/ui/badge";
import { JournalEntryEditor } from "./JournalEntryEditor";
import { JournalEntryList } from "./JournalEntryList";
import type { Locale } from "@/lib/i18n";

export function AccountingDashboard({ locale }: { locale: Locale }) {
  return (
    <section className="erp-section space-y-6" role="main" aria-label="Contabilidad">
      {/* Header General */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">Finanzas</Badge>
            <Badge variant="outline">Libro Mayor</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Contabilidad
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Editor de pólizas, cuadre de saldos en tiempo real y registro en el libro mayor.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Periodo Abierto</p>
            <p className="text-sm font-medium text-foreground">Junio 2026</p>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Editor Principal (Centro) */}
        <div className="h-[650px]">
          <JournalEntryEditor locale={locale} />
        </div>

        {/* Panel Lateral (Historial) */}
        <div className="h-[650px]">
          <JournalEntryList locale={locale} />
        </div>
      </div>
    </section>
  );
}
