"use client";

import { AlertTriangle, CheckCircle2, Search, XCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  AnalyticsActivityRow,
  AnalyticsFilters,
  AnalyticsLabels,
  AnalyticsRowStatus,
  AnalyticsUiStatus,
  SelectOption,
} from "./types";

const statusStyles: Record<AnalyticsRowStatus, string> = {
  active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  critical: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const statusIcons = {
  active: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
};

export function AnalyticsTable({
  rows,
  status,
  labels,
  filters,
  onFiltersChange,
  statusOptions,
}: {
  rows: AnalyticsActivityRow[];
  status: AnalyticsUiStatus;
  labels: AnalyticsLabels;
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  statusOptions: SelectOption<AnalyticsRowStatus | "all">[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-card/40 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">{labels.table.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{labels.table.description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_160px] lg:min-w-[460px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
              placeholder={labels.filters.searchPlaceholder}
              className="pl-8"
            />
          </div>
          <NativeSelect
            aria-label={labels.filters.status}
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({ ...filters, status: event.target.value as AnalyticsRowStatus | "all" })
            }
          >
            {statusOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {status === "loading" ? (
        <div className="space-y-3 p-5">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      ) : null}
      {status === "error" ? (
        <div className="p-5">
          <EmptyState variant="error" title={labels.error.title} description={labels.error.description} />
        </div>
      ) : null}
      {status !== "loading" && status !== "error" && rows.length === 0 ? (
        <div className="p-5">
          <EmptyState title={labels.empty.branchesTitle} description={labels.empty.branchesDescription} />
        </div>
      ) : null}
      {status !== "loading" && status !== "error" && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <HeaderCell>{labels.table.item}</HeaderCell>
                <HeaderCell>{labels.table.branch}</HeaderCell>
                <HeaderCell className="text-center">{labels.table.status}</HeaderCell>
                <HeaderCell className="text-right">{labels.table.amount}</HeaderCell>
                <HeaderCell className="text-right">{labels.table.owner}</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => {
                const Icon = statusIcons[row.status];

                return (
                  <tr key={row.id} className="transition-colors hover:bg-muted/15">
                    <td className="px-6 py-4 font-semibold text-foreground">{row.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.branch}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={cn("gap-1.5", statusStyles[row.status])}>
                        <Icon className="size-3.5" aria-hidden="true" />
                        {labels.status[row.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">{row.amount}</td>
                    <td className="px-6 py-4 text-right font-medium text-muted-foreground/80">{row.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function HeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", className)}
    >
      {children}
    </th>
  );
}
