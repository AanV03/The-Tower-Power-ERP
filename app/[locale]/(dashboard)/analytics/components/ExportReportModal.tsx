"use client";

import { useState, useEffect } from "react";
import { X, FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ExportReportModalProps = {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
};

export function ExportReportModal({ locale, isOpen, onClose }: ExportReportModalProps) {
  const dictionary = getDictionary(locale);
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    setProgress(0);

    // Simulate download generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            onClose();
            toast.success(dictionary.analytics.export.success, {
              description: `${format.toUpperCase()} · ${
                includeCharts ? "+Charts" : ""
              } ${includeMetadata ? "+Metadata" : ""}`,
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            });
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="glass-panel w-full max-w-md bg-card/90 dark:bg-card/80 rounded-2xl shadow-xl border border-white/10 overflow-hidden relative p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-[var(--brand-orange)]">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 id="export-modal-title" className="text-lg font-bold text-foreground">
              {dictionary.analytics.export.title}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2"
            aria-label={dictionary.analytics.export.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          {dictionary.analytics.export.description}
        </p>

        {isExporting ? (
          /* Exporting Progress State */
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-8 h-8 text-[var(--brand-orange)] animate-spin" />
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden max-w-xs">
              <div 
                className="bg-[var(--brand-orange)] h-full transition-all duration-150" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {progress}%
            </span>
          </div>
        ) : (
          /* Form Settings */
          <form onSubmit={handleExport} className="space-y-5">
            {/* Format Selector */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">
                {dictionary.analytics.export.format}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-2",
                    format === "pdf"
                      ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 text-foreground"
                      : "border-border hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <span className="font-bold">PDF</span>
                  <span className="text-xs opacity-80">{dictionary.analytics.export.pdf}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("csv")}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-2",
                    format === "csv"
                      ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 text-foreground"
                      : "border-border hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <span className="font-bold">CSV</span>
                  <span className="text-xs opacity-80">{dictionary.analytics.export.csv}</span>
                </button>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  disabled={format === "csv"}
                  className="rounded border-border text-[var(--brand-orange)] focus:ring-[var(--brand-orange)] w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={cn("text-sm text-foreground group-hover:text-foreground/80 transition-colors", format === "csv" && "opacity-50 cursor-not-allowed")}>
                  {dictionary.analytics.export.includeCharts}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded border-border text-[var(--brand-orange)] focus:ring-[var(--brand-orange)] w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                  {dictionary.analytics.export.includeMetadata}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-sm font-medium"
              >
                {dictionary.analytics.export.cancel}
              </Button>
              <Button
                type="submit"
                className="bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90 transition-all font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{dictionary.analytics.export.submit}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
