"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: inHeader ? "ghost" : "outline", size: "sm" }),
          "h-9 px-3 gap-2 text-xs font-black uppercase tracking-wider text-[var(--landing-text,#fff)] border border-[color:var(--landing-border,rgba(255,255,255,0.1))] hover:bg-[var(--landing-panel-hover,rgba(255,255,255,0.05))]"
        )}
        aria-label={dictionary.common.language}
      >
        <Globe className="h-4 w-4 shrink-0 text-[var(--landing-accent-strong,#2dd4bf)]" />
        <span>{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0b1717] border border-white/10 text-white min-w-[120px]">
        {locales.map((targetLocale) => {
          const href = pathname.replace(`/${locale}`, `/${targetLocale}`);
          const isActive = targetLocale === locale;

          return (
            <DropdownMenuItem key={targetLocale} className="p-0">
              <Link
                href={href as unknown as any}
                className={cn(
                  "w-full block px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer hover:bg-white/5",
                  isActive ? "text-[var(--landing-accent-strong,#2dd4bf)]" : "text-white/80"
                )}
                aria-label={dictionary.common.languageNames[targetLocale]}
              >
                {dictionary.common.languageNames[targetLocale]} ({targetLocale})
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
