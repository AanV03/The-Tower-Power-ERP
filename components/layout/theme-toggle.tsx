"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ThemeToggle({ locale = "es" }: { locale?: Locale } = {}) {
  const dictionary = getDictionary(locale);

  return (
    <AnimatedThemeToggler
      variant="square"
      duration={450}
      aria-label={dictionary.common.theme}
      title={dictionary.common.theme}
      className="topbar-icon-button inline-flex size-10 items-center justify-center rounded-none text-sm [&_svg]:size-4 [&_svg]:shrink-0"
    />
  );
}
