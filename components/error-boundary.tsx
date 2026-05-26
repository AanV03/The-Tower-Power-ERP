"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const params = useParams();
  const localeParam = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const dictionary = getDictionary(isLocale(localeParam) ? localeParam : defaultLocale);

  useEffect(() => {
    // Log error to monitoring service
    console.error("[ERROR_BOUNDARY]", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-background px-4">
      <div className="glass-effect rounded-lg p-8 max-w-md w-full space-y-6 border border-[var(--sidebar-border-color)]">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {dictionary.errors.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dictionary.errors.description}
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="bg-muted/50 rounded-md p-3 border border-border">
            <p className="text-xs font-mono text-foreground break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2"
            variant="default"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            {dictionary.errors.retry}
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="flex-1"
          >
            {dictionary.errors.home}
          </Button>
        </div>
      </div>
    </div>
  );
}
