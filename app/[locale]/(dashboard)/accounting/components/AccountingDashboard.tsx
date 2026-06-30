"use client";

import { Calculator } from "lucide-react";
import { JournalEntryEditor } from "./JournalEntryEditor";
import { JournalEntryList } from "./JournalEntryList";
import type { Locale } from "@/lib/i18n";

export function AccountingDashboard({ locale }: { locale: Locale }) {
  return (
    <section className="erp-section space-y-6" role="main" aria-label="Contabilidad">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Calculator className="size-7 text-primary" aria-hidden="true" />
            Contabilidad
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Editor de pólizas, cuadre de saldos en tiempo real y registro en el libro mayor.
          </p>
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
