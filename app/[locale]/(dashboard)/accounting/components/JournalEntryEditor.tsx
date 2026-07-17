"use client";

import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";

import { TableSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { JournalEntryEditorProps, JournalEntryType } from "./types";

export function JournalEntryLinesEditor({
  entry,
  status,
  labels,
  actions,
}: Pick<JournalEntryEditorProps, "entry" | "status" | "labels" | "actions">) {
  const disabled = status === "loading" || status === "error";

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">Partidas de la poliza</CardTitle>
        <CardDescription>Asigna cuentas contables y captura debe / haber para el cuadre.</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <TableSkeleton rows={4} columns={5} />
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {entry.lines.map((line, index) => {
              const accountInputId = `journal-line-${line.id}-account`;
              const descriptionInputId = `journal-line-${line.id}-description`;
              const debitInputId = `journal-line-${line.id}-debit`;
              const creditInputId = `journal-line-${line.id}-credit`;

              return (
                <div key={line.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">Partida {index + 1}</p>
                    <Button
                      size="icon-sm"
                      disabled={disabled}
                      onClick={() => actions?.onRemoveLine?.(line.id)}
                      aria-label="Eliminar partida"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-destructive/60 disabled:text-destructive-foreground"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <label className="space-y-1.5" htmlFor={accountInputId}>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Cuenta</span>
                      <Input
                        id={accountInputId}
                        value={`${line.accountCode} - ${line.accountName}`}
                        disabled={disabled}
                        onChange={(event) =>
                          actions?.onLineChange?.(line.id, "accountName", event.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-1.5" htmlFor={descriptionInputId}>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Descripcion</span>
                      <Input
                        id={descriptionInputId}
                        value={line.description}
                        disabled={disabled}
                        onChange={(event) =>
                          actions?.onLineChange?.(line.id, "description", event.target.value)
                        }
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1.5" htmlFor={debitInputId}>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{labels.debit}</span>
                        <Input
                          id={debitInputId}
                          className="text-right tabular-nums"
                          type="number"
                          value={line.debit || ""}
                          disabled={disabled}
                          onChange={(event) =>
                            actions?.onLineChange?.(line.id, "debit", Number(event.target.value))
                          }
                        />
                      </label>
                      <label className="space-y-1.5" htmlFor={creditInputId}>
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{labels.credit}</span>
                        <Input
                          id={creditInputId}
                          className="text-right tabular-nums"
                          type="number"
                          value={line.credit || ""}
                          disabled={disabled}
                          onChange={(event) =>
                            actions?.onLineChange?.(line.id, "credit", Number(event.target.value))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-2">
              <Button variant="ghost" size="sm" disabled={disabled} onClick={actions?.onAddLine} className="w-full justify-start">
                <Plus className="size-4" aria-hidden="true" />
                {labels.addLine}
              </Button>
            </div>
          </div>

          <div className="hidden rounded-lg border border-border bg-background md:block">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="min-w-[220px]">Cuenta</TableHead>
                  <TableHead className="min-w-[220px]">Descripcion</TableHead>
                  <TableHead className="min-w-[120px] text-right">{labels.debit}</TableHead>
                  <TableHead className="min-w-[120px] text-right">{labels.credit}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Input
                        value={`${line.accountCode} - ${line.accountName}`}
                        disabled={disabled}
                        onChange={(event) =>
                          actions?.onLineChange?.(line.id, "accountName", event.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.description}
                        disabled={disabled}
                        onChange={(event) =>
                          actions?.onLineChange?.(line.id, "description", event.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-right tabular-nums"
                        type="number"
                        value={line.debit || ""}
                        disabled={disabled}
                        onChange={(event) =>
                          actions?.onLineChange?.(line.id, "debit", Number(event.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-right tabular-nums"
                        type="number"
                        value={line.credit || ""}
                        disabled={disabled}
                        onChange={(event) =>
                          actions?.onLineChange?.(line.id, "credit", Number(event.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon-sm"
                        disabled={disabled}
                        onClick={() => actions?.onRemoveLine?.(line.id)}
                        aria-label="Eliminar partida"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-destructive/60 disabled:text-destructive-foreground"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t border-border bg-muted/20 p-3">
              <Button variant="ghost" size="sm" disabled={disabled} onClick={actions?.onAddLine}>
                <Plus className="size-4" aria-hidden="true" />
                {labels.addLine}
              </Button>
            </div>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function JournalEntryEditor({
  locale,
  entry,
  status,
  labels,
  actions,
  journalEntryTypeOptions,
  journalEntryStatusConfig,
}: JournalEntryEditorProps) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: entry.currency,
  });
  const disabled = status === "loading" || status === "error";
  const statusConfig = journalEntryStatusConfig[entry.totals.isBalanced ? "balanced" : "draft"];

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{labels.editorTitle}</CardTitle>
            <CardDescription>{labels.editorDescription}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "w-fit",
              entry.totals.isBalanced
                ? statusConfig.className
                : "bg-destructive/15 text-destructive",
            )}
          >
            {entry.totals.isBalanced ? (
              <CheckCircle2 className="size-3" aria-hidden="true" />
            ) : (
              <AlertCircle className="size-3" aria-hidden="true" />
            )}
            {entry.totals.isBalanced ? labels.balanced : labels.unbalanced}
          </Badge>
        </div>

        <div className="grid gap-3 rounded-lg border border-border bg-background/70 p-3 sm:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {labels.date}
            </span>
            <Input
              type="date"
              value={entry.date}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("date", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {labels.type}
            </span>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              value={entry.type}
              disabled={disabled}
              onChange={(event) =>
                actions?.onEntryFieldChange?.("type", event.target.value as JournalEntryType)
              }
            >
              {journalEntryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {labels.concept}
            </span>
            <Input
              value={entry.concept}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("concept", event.target.value)}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-4">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {labels.reference}
            </span>
            <Input
              value={entry.reference}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("reference", event.target.value)}
            />
          </label>
        </div>
      </CardHeader>

      <CardFooter className="flex flex-col gap-4 border-t border-border/70 pt-4">
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase text-muted-foreground">{labels.debit}</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatter.format(entry.totals.debit)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase text-muted-foreground">{labels.credit}</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatter.format(entry.totals.credit)}
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg border p-3",
              entry.totals.isBalanced
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-destructive/25 bg-destructive/10",
            )}
          >
            <p className="text-xs uppercase text-muted-foreground">{labels.difference}</p>
            <p
              className={cn(
                "text-lg font-semibold tabular-nums",
                entry.totals.isBalanced ? "text-emerald-600" : "text-destructive",
              )}
            >
              {formatter.format(entry.totals.difference)}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={disabled} onClick={actions?.onSaveDraft}>
            {labels.saveDraft}
          </Button>
          <Button
            disabled={disabled || !entry.totals.isBalanced}
            onClick={actions?.onRegisterEntry}
          >
            {labels.registerEntry}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
