"use client";

import type { ModuleRow } from "@/data/modules";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type AnalyticsTableProps = {
  rows: ModuleRow[];
  locale: Locale;
};

export function AnalyticsTable({ rows, locale }: AnalyticsTableProps) {
  const dictionary = getDictionary(locale);
  const labels = dictionary.moduleTable;

  if (!rows || rows.length === 0) {
    return (
      <div className="glass-effect rounded-xl p-8 text-center border border-white/10 shadow-xs">
        <p className="text-sm text-muted-foreground">{labels.noDataDesc}</p>
      </div>
    );
  }

  const getStatusBadge = (status: ModuleRow["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{dictionary.common.active}</span>
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{dictionary.common.warning}</span>
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>{dictionary.common.critical}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden border border-white/10 shadow-sm">
      <div className="p-5 border-b border-border bg-card/40">
        <h3 className="text-base font-bold text-foreground">{labels.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{labels.description}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-muted/20 border-b border-border">
              <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {labels.item}
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {labels.branch}
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                {labels.status}
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                {labels.amount}
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                {labels.owner}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, idx) => (
              <tr 
                key={`${row.name}-${row.branch}-${idx}`}
                className="hover:bg-muted/15 transition-colors duration-150"
              >
                <td className="px-6 py-4 font-semibold text-foreground">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {row.branch}
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(row.status)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-foreground">
                  {row.amount}
                </td>
                <td className="px-6 py-4 text-right text-muted-foreground/80 font-medium">
                  {row.owner}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
