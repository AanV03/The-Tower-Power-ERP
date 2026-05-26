"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDictionary, locales, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({
  locale,
  inHeader = false,
}: {
  locale: Locale;
  inHeader?: boolean;
}) {
  const pathname = usePathname();
  const dictionary = getDictionary(locale);

  return (
    <div
      className={cn(
        "flex items-center rounded-md p-1",
        inHeader ? "bg-transparent border border-white/10" : "bg-background",
      )}
      aria-label={dictionary.common.language}
    >
      {locales.map((targetLocale) => {
        const href = pathname.replace(`/${locale}`, `/${targetLocale}`);
        const isActive = targetLocale === locale;

        const variant = inHeader ? "ghost" : isActive ? "secondary" : "ghost";
        const extra = inHeader
          ? isActive
            ? "h-7 px-2 uppercase bg-white/10 text-white"
            : "h-7 px-2 uppercase text-white/80 hover:bg-white/10"
          : "h-7 px-2 uppercase";

        return (
          <Link
            key={targetLocale}
            href={href as unknown as any}
            className={cn(buttonVariants({ variant: variant as any, size: "sm" }), extra)}
            aria-label={dictionary.common.languageNames[targetLocale]}
          >
            {targetLocale}
          </Link>
        );
      })}
    </div>
  );
}
