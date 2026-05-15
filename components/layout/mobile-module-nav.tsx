"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MobileModuleNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-2 overflow-x-auto border-b border-[var(--sidebar-border-color)] bg-card px-4 py-2 lg:hidden glass-effect-light"
      aria-label="Módulos del ERP"
      role="navigation"
    >
      {navigationItems.map((item) => {
        const href = `/${locale}${item.href}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={href as unknown as any}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.labels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
