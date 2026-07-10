"use client";

import AuroraBackground from "@/components/AuroraBackground";
import BackgroundGrid from "@/components/BackgroundGrid";
import { cn } from "@/lib/utils";

type AuthBackgroundVariant = "auth" | "hero";

type AuthBackgroundProps = {
  variant?: AuthBackgroundVariant;
  className?: string;
};

export function AuthBackground({
  variant = "auth",
  className,
}: AuthBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "auth-background pointer-events-none absolute inset-0 overflow-hidden",
        variant === "hero" && "auth-background-hero",
        className,
      )}
    >
      <BackgroundGrid />
      <AuroraBackground />
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[var(--auth-background)] via-transparent to-[var(--auth-background)]" />
      <div className="absolute inset-0 z-[3] bg-[var(--auth-background-wash)]" />
    </div>
  );
}
