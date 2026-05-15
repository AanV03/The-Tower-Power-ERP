"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ThemeToggle({ locale = "es" }: { locale?: Locale } = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const dictionary = getDictionary(locale);
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? `${dictionary.common.theme}: ${dictionary.common.lightTheme}` : `${dictionary.common.theme}: ${dictionary.common.darkTheme}`}
      aria-pressed={isDark ? "true" : "false"}
      title={isDark ? dictionary.common.darkTheme : dictionary.common.lightTheme}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </Button>
  );
}
