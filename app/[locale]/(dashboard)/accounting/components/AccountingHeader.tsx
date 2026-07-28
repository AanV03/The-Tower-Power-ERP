"use client";

import { Calculator, Download, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import type { AccountingActionHandlers, AccountingLabels } from "./types";

export function AccountingHeader({
  title,
  subtitle,
  periodLabel,
  branchLabel,
  labels,
  actions,
  primaryActionLabel,
  onPrimaryAction,
  canPrimaryAction,
}: {
  title: string;
  subtitle: string;
  periodLabel: string;
  branchLabel: string;
  labels: AccountingLabels;
  actions?: AccountingActionHandlers;
  primaryActionLabel: string;
  onPrimaryAction?: () => void;
  canPrimaryAction: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Calculator className="size-7 text-primary" aria-hidden="true" />
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              {periodLabel}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              {branchLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className={cn(
              headerPrimaryActionClass,
              "focus-visible:ring-2 focus-visible:ring-offset-2",
            )}
            disabled={!canPrimaryAction}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={labels.refresh}
            title={labels.refresh}
            onClick={actions?.onRefresh}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={labels.export}
            title={labels.export}
            onClick={actions?.onExport}
          >
            <Download className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          className="h-10 pl-9"
          placeholder={labels.searchPlaceholder}
          onChange={(event) => actions?.onSearchChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") actions?.onSearchSubmit?.();
          }}
        />
      </div>
    </div>
  );
}
