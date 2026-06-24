"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Calendar } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { scopeOptions } from "@/data/navigation";
import { NativeSelect } from "@/components/ui/native-select";

type AnalyticsFilterPanelProps = {
  locale: Locale;
  range: string;
  onRangeChange?: (range: string) => void;
  branch: string;
  onBranchChange?: (branch: string) => void;
};

export function AnalyticsFilterPanel({
  locale,
  range,
  onRangeChange,
  branch,
  onBranchChange,
}: AnalyticsFilterPanelProps) {
  const dictionary = getDictionary(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBranchChange = (newBranch: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newBranch) {
      params.set("branchId", newBranch);
    } else {
      params.delete("branchId");
    }
    router.push(`?${params.toString()}`, { scroll: false });
    if (onBranchChange) onBranchChange(newBranch);
  };

  const handleRangeChange = (newRange: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRange) {
      params.set("range", newRange);
    } else {
      params.delete("range");
    }
    router.push(`?${params.toString()}`, { scroll: false });
    if (onRangeChange) onRangeChange(newRange);
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 w-full shadow-md">
      <div className="flex flex-wrap items-center gap-6">
        {/* Branch Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="analytics-branch-selector" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{dictionary.analytics.filters.branch}</span>
          </label>
          <NativeSelect
            id="analytics-branch-selector"
            className="glass-control text-sm h-9 px-3 rounded-md"
            value={branch}
            onChange={(e) => handleBranchChange(e.target.value)}
          >
            <option value="" className="text-foreground bg-card">{dictionary.common.consolidated}</option>
            {scopeOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="text-foreground bg-card">
                {opt.label[locale]}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="analytics-range-selector" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{dictionary.analytics.filters.range}</span>
          </label>
          <NativeSelect
            id="analytics-range-selector"
            className="glass-control text-sm h-9 px-3 rounded-md"
            value={range}
            onChange={(e) => handleRangeChange(e.target.value)}
          >
            <option value="today" className="text-foreground bg-card">{dictionary.analytics.filters.today}</option>
            <option value="7d" className="text-foreground bg-card">{dictionary.analytics.filters.last7Days}</option>
            <option value="30d" className="text-foreground bg-card">{dictionary.analytics.filters.last30Days}</option>
            <option value="90d" className="text-foreground bg-card">{dictionary.analytics.filters.last90Days}</option>
            <option value="all" className="text-foreground bg-card">{dictionary.analytics.filters.allTime}</option>
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}
