"use client";

import { useEffect, useState } from "react";
import { Download, Save, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { cn, headerPrimaryActionClass } from "@/lib/utils";

const ranges = ["Last 7 days", "Last 30 days", "This year"] as const;
const savedRangeKey = "gerpy.dashboard.range";

function csvCell(value: unknown) {
  const text =
    value !== null && typeof value === "object"
      ? JSON.stringify(value)
      : String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

export default function FilterBar({ rows = [] }: { rows?: unknown[] }) {
  const [range, setRange] = useState<(typeof ranges)[number]>("Last 7 days");

  useEffect(() => {
    const savedRange = window.localStorage.getItem(savedRangeKey);

    if (ranges.includes(savedRange as (typeof ranges)[number])) {
      setRange(savedRange as (typeof ranges)[number]);
    }
  }, []);

  function handleExport() {
    const records = rows.filter(
      (row): row is Record<string, unknown> =>
        Boolean(row) && typeof row === "object" && !Array.isArray(row),
    );

    if (records.length === 0) {
      toast.info("No hay datos para exportar.");
      return;
    }

    const columns = Array.from(
      new Set(records.flatMap((record) => Object.keys(record))),
    );
    const csv = [
      columns.map(csvCell).join(","),
      ...records.map((record) =>
        columns.map((column) => csvCell(record[column])).join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `gerpy-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Reporte exportado.");
  }

  function handleSaveView() {
    window.localStorage.setItem(savedRangeKey, range);
    toast.success("Vista guardada.");
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end" aria-label="Dashboard filters">
      <div className="flex min-w-0 items-center gap-2 text-card-foreground">
        <SlidersHorizontal className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <label htmlFor="range-select" className="text-sm font-medium text-muted-foreground">
          Range
        </label>
        <select
          id="range-select"
          value={range}
          onChange={(event) =>
            setRange(event.target.value as (typeof ranges)[number])
          }
          className="h-11 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {ranges.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleExport}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
        type="button"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
      </button>
      <button
        onClick={handleSaveView}
        className={cn(headerPrimaryActionClass, "inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm")}
        type="button"
      >
        <Save className="size-4" aria-hidden="true" />
        Save view
      </button>
    </div>
  );
}
