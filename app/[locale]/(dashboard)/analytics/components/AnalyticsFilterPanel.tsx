"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Calendar } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { scopeOptions } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";
import { analyticsLabels, analyticsRangeOptions } from "./config";
import type { AnalyticsLabels, AnalyticsRange, SelectOption } from "./types";

type AnalyticsFilterPanelProps = {
  locale: Locale;
  range: AnalyticsRange;
  branch: string;
  labels?: AnalyticsLabels;
  rangeOptions?: SelectOption<AnalyticsRange>[];
  branchOptions?: SelectOption[];
  onRangeChange?: (range: AnalyticsRange) => void;
  onBranchChange?: (branch: string) => void;
};

export function AnalyticsFilterPanel({
  locale,
  range,
  branch,
  labels = analyticsLabels,
  rangeOptions = analyticsRangeOptions,
  branchOptions = [
    { value: "", label: analyticsLabels.filters.allBranches },
    ...scopeOptions.map((option) => ({ value: option.id, label: option.label[locale] })),
  ],
  onRangeChange,
  onBranchChange,
}: AnalyticsFilterPanelProps) {
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
    <div className="glass-panel flex w-full flex-wrap items-center justify-between gap-4 rounded-xl p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="analytics-branch-selector" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Building2 className="size-3.5" aria-hidden="true" />
            <span>{labels.filters.branch}</span>
          </label>
          <NativeSelect
            id="analytics-branch-selector"
            className="glass-control h-9 rounded-md px-3 text-sm"
            value={branch}
            onChange={(event) => {
              pushFilter("branchId", event.target.value);
              onBranchChange?.(event.target.value);
            }}
          >
            {branchOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="analytics-range-selector" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5" aria-hidden="true" />
            <span>{labels.filters.range}</span>
          </label>
          <NativeSelect
            id="analytics-range-selector"
            className="glass-control h-9 rounded-md px-3 text-sm"
            value={range}
            onChange={(event) => {
              const value = event.target.value as AnalyticsRange;
              pushFilter("range", value);
              onRangeChange?.(value);
            }}
          >
            {rangeOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}
