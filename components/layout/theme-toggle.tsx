"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ThemeToggle({ locale = "es" }: { locale?: Locale } = {}) {
  const dictionary = getDictionary(locale);

  return (
    <AnimatedThemeToggler
      variant="circle"
      duration={450}
      aria-label={dictionary.common.theme}
      title={dictionary.common.theme}
      className="inline-flex size-10 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0"
      style={{ color: "white", background: "transparent" }}
    />
  );
}
