"use client";

import { FileClock, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AccountingStateBlock } from "./AccountingStateBlock";
import type { JournalEntryListProps } from "./types";

export function JournalEntryList({
  entries,
  status,
  labels,
  actions,
  journalEntryStatusConfig,
  journalEntryTypeOptions,
}: JournalEntryListProps) {
  const resolvedStatus = entries.length === 0 && status === "idle" ? "empty" : status;
  const showStateBlock = resolvedStatus !== "idle";

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileClock className="size-4 text-primary" aria-hidden="true" />
          {labels.entriesTitle}
        </CardTitle>
        <CardDescription>{labels.entriesDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {showStateBlock ? (
          <AccountingStateBlock
            status={resolvedStatus}
            emptyTitle={labels.emptyEntriesTitle}
            emptyDescription={labels.emptyEntriesDescription}
            errorTitle={labels.errorTitle}
            retryLabel={labels.retry}
            onRetry={actions?.onRetry}
          />
        ) : (
          entries.map((entry) => {
            const statusConfig = journalEntryStatusConfig[entry.status];
            const typeLabel =
              journalEntryTypeOptions.find((option) => option.value === entry.type)?.label ??
              entry.type;

            return (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => actions?.onSelectEntry?.(entry.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {entry.entryNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.dateLabel}</span>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-foreground">
                      {entry.concept}
                    </p>
                    <p className="mt-1 text-xs uppercase text-muted-foreground">{typeLabel}</p>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {entry.amount}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(statusConfig.className)}>
                        {statusConfig.label}
                      </Badge>
                      <button
                        type="button"
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Eliminar ${entry.entryNumber}`}
                        onClick={() => actions?.onDeleteEntry?.(entry.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
