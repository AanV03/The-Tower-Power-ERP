"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Calendar, FileDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scopeOptions } from "@/data/navigation";
import { ExportReportModal } from "./ExportReportModal";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn, headerPrimaryActionClass } from "@/lib/utils";

type AnalyticsHeaderControlsProps = {
  locale: Locale;
  range: string;
  branch: string;
};

export function AnalyticsHeaderControls({
  locale,
  range,
  branch,
}: AnalyticsHeaderControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  };

  const handleRangeChange = (newRange: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRange) {
      params.set("range", newRange);
    } else {
      params.delete("range");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Branch Select */}
      <div className="relative flex items-center">
        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" aria-hidden="true" />
        <select
          id="header-branch-selector"
          className="h-9 min-w-[150px] appearance-none rounded-md border border-border bg-muted/20 pl-9 pr-8 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
          value={branch}
          onChange={(e) => handleBranchChange(e.target.value)}
        >
          <option value="" className="text-foreground bg-card">{dictionary.common.consolidated}</option>
          {scopeOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="text-foreground bg-card">
              {opt.label[locale]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground select-none" aria-hidden="true" />
      </div>

      {/* Range Select */}
      <div className="relative flex items-center">
        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" aria-hidden="true" />
        <select
          id="header-range-selector"
          className="h-9 min-w-[130px] appearance-none rounded-md border border-border bg-muted/20 pl-9 pr-8 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
          value={range}
          onChange={(e) => handleRangeChange(e.target.value)}
        >
          <option value="today" className="text-foreground bg-card">{dictionary.analytics.filters.today}</option>
          <option value="7d" className="text-foreground bg-card">{dictionary.analytics.filters.last7Days}</option>
          <option value="30d" className="text-foreground bg-card">{dictionary.analytics.filters.last30Days}</option>
          <option value="90d" className="text-foreground bg-card">{dictionary.analytics.filters.last90Days}</option>
          <option value="all" className="text-foreground bg-card">{dictionary.analytics.filters.allTime}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground select-none" aria-hidden="true" />
      </div>

      {/* Export Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(headerPrimaryActionClass, "flex h-9 items-center gap-2 rounded-md px-3 text-xs")}
      >
        <FileDown className="w-4 h-4" aria-hidden="true" />
        <span>{dictionary.analytics.export.button}</span>
      </Button>

      <ExportReportModal locale={locale} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
