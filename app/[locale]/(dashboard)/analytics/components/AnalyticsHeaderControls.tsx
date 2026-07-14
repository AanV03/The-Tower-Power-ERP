"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Calendar, FileDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import type {
  AnalyticsLabels,
  AnalyticsRange,
  SelectOption,
} from "./types";

type AnalyticsHeaderControlsProps = {
  locale: string;
  range: AnalyticsRange;
  branch: string;
  labels: AnalyticsLabels;
  rangeOptions: SelectOption<AnalyticsRange>[];
  branchOptions: SelectOption[];
  onExportOpen: () => void;
  onRefresh: () => void;
};

export function AnalyticsHeaderControls({
  range,
  branch,
  labels,
  rangeOptions,
  branchOptions,
  onExportOpen,
  onRefresh,
}: AnalyticsHeaderControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pushFilter = (key: "range" | "branchId", value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="analytics-header-branch">
        {labels.filters.branch}
      </label>
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <NativeSelect
          id="analytics-header-branch"
          value={branch}
          onChange={(event) => pushFilter("branchId", event.target.value)}
          className="h-9 min-w-40 pl-8 text-xs font-semibold"
        >
          {branchOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <label className="sr-only" htmlFor="analytics-header-range">
        {labels.filters.range}
      </label>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <NativeSelect
          id="analytics-header-range"
          value={range}
          onChange={(event) => pushFilter("range", event.target.value)}
          className="h-9 min-w-36 pl-8 text-xs font-semibold"
        >
          {rangeOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <Button variant="outline" size="sm" className="h-9 gap-1" onClick={onRefresh}>
        <RefreshCw className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{labels.actions.refresh}</span>
      </Button>

      <Button onClick={onExportOpen} className={cn(headerPrimaryActionClass, "h-9 gap-2 px-3 text-xs")}>
        <FileDown className="size-4" aria-hidden="true" />
        <span>{labels.actions.export}</span>
      </Button>
    </div>
  );
}
