"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  locale = "es",
  appearance = "dashboard",
  transition = "default",
}: {
  locale?: Locale;
  appearance?: "dashboard" | "landing";
  transition?: "default" | "curtain";
} = {}) {
  const dictionary = getDictionary(locale);

  return (
    <AnimatedThemeToggler
      transition={transition}
      variant="square"
      duration={450}
      aria-label={dictionary.common.theme}
      title={dictionary.common.theme}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-none text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
        appearance === "landing"
          ? "border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] text-[var(--landing-text)] hover:border-[color:var(--landing-accent-strong)] hover:bg-[var(--landing-panel-hover)] hover:text-[var(--landing-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent-strong)]"
          : "topbar-icon-button size-8 sm:size-10",
      )}
    />
  );
}
