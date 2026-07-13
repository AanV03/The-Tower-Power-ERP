"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AuthBackground } from "@/components/backgrounds/auth-background";
import { useLandingRouteTransition } from "@/components/landing/landing-route-transition";
import type { Locale } from "@/lib/i18n";
import { localizedHome } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  locale?: Locale;
  backLabel?: string;
};

export function AuthShell({
  children,
  id,
  className,
  locale = "es",
  backLabel = "Back to home",
}: AuthShellProps) {
  const { startRouteTransition } = useLandingRouteTransition();
  const [isLeaving, setIsLeaving] = useState(false);

  function handleBackToLanding() {
    if (isLeaving) return;

    setIsLeaving(true);
    startRouteTransition(localizedHome(locale));
  }

  return (
    <main
      id={id}
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--auth-background)] px-4 py-10 text-[var(--auth-foreground)] sm:px-6 sm:py-12",
        className,
      )}
    >
      <AuthBackground />

      <button
        type="button"
        onClick={handleBackToLanding}
        disabled={isLeaving}
        aria-label={backLabel}
        className="auth-secondary-button absolute left-4 top-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--auth-ring)] disabled:pointer-events-none disabled:opacity-60 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span>{backLabel}</span>
      </button>

      {children}
    </main>
  );
}
