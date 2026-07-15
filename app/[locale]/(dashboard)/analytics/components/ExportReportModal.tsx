"use client";

import { useState } from "react";
import { CheckCircle, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import { updateExportDraft } from "./demo-controller";
import type { AnalyticsLabels, AnalyticsUiStatus, ExportFormat, ExportReportDraft } from "./types";

const initialDraft: ExportReportDraft = {
  format: "pdf",
  includeCharts: true,
  includeMetadata: false,
};

export function ExportReportModal({
  labels,
  isOpen,
  status,
  onClose,
  onSubmit,
}: {
  labels: AnalyticsLabels;
  isOpen: boolean;
  status: AnalyticsUiStatus;
  onClose: () => void;
  onSubmit: (draft: ExportReportDraft) => void;
}) {
  const [draft, setDraft] = useState<ExportReportDraft>(initialDraft);
  const [progress, setProgress] = useState(0);
  const isExporting = status === "loading" || progress > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProgress(10);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setProgress(0);
            onSubmit(draft);
          }, 250);
          return 100;
        }

        return current + 15;
      });
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            {labels.export.title}
          </DialogTitle>
          <DialogDescription>{labels.export.description}</DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            {progress >= 100 ? (
              <CheckCircle className="size-8 text-emerald-500" aria-hidden="true" />
            ) : (
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            )}
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-semibold text-foreground">{progress}%</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">{labels.export.format}</span>
              <div className="grid grid-cols-2 gap-3">
                {(["pdf", "csv"] as const).map((format) => (
                  <FormatButton
                    key={format}
                    format={format}
                    active={draft.format === format}
                    label={format === "pdf" ? labels.export.pdf : labels.export.csv}
                    onClick={() => setDraft(updateExportDraft(draft, "format", format))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.includeCharts}
                  onChange={(event) => setDraft(updateExportDraft(draft, "includeCharts", event.target.checked))}
                  disabled={draft.format === "csv"}
                  className="size-4 cursor-pointer rounded border-border text-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className={cn("text-sm text-foreground", draft.format === "csv" && "opacity-50")}>
                  {labels.export.includeCharts}
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.includeMetadata}
                  onChange={(event) => setDraft(updateExportDraft(draft, "includeMetadata", event.target.checked))}
                  className="size-4 cursor-pointer rounded border-border text-primary"
                />
                <span className="text-sm text-foreground">{labels.export.includeMetadata}</span>
              </label>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                {labels.export.cancel}
              </Button>
              <Button type="submit" className={cn(headerPrimaryActionClass, "gap-2")}>
                <Download className="size-4" aria-hidden="true" />
                {labels.export.submit}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormatButton({
  format,
  active,
  label,
  onClick,
}: {
  format: ExportFormat;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted/40",
      )}
    >
      <span className="font-bold uppercase">{format}</span>
      <span className="text-xs opacity-80">{label}</span>
    </button>
  );
}
