"use client";

import * as React from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  payload: Record<string, any> | null;
  labels: {
    close?: string;
    payloadTitle: string;
    payloadCopied: string;
  };
}

export function JsonLogViewer({
  isOpen,
  onClose,
  title,
  payload,
  labels,
}: JsonLogViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    setCopied(false);
    dialogRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !payload) return null;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--sidebar-border-color)] bg-card text-card-foreground shadow-[var(--glass-shadow)] glass-panel focus-visible:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--sidebar-border-color)]">
          <h2 id="viewer-title" className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)] flex items-center gap-1.5"
              aria-label={copied ? labels.payloadCopied : "Copiar JSON"}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--brand-green)]" />
                  <span className="text-[var(--brand-green)] font-medium">
                    {labels.payloadCopied}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full border border-transparent hover:bg-[var(--glass-control-hover)]"
              aria-label="Cerrar visor"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-zinc-950 dark:bg-black border-b border-[var(--sidebar-border-color)]">
          <pre className="overflow-auto max-h-[350px] text-xs font-mono text-zinc-300 select-text leading-relaxed">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Status / Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-[var(--header-glass-bg)]/20">
          <Button
            onClick={onClose}
            size="sm"
            className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {labels.close || "Cerrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
