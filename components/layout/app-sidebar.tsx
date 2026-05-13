"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/data/navigation";
import { defaultBrand } from "@/lib/branding";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-brand-navy text-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          {defaultBrand.logoText}
        </div>
        <div>
          <p className="text-sm font-semibold">{defaultBrand.name}</p>
          <p className="text-xs text-white/60">Gym ERP SaaS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="ERP modules">
        {navigationItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive =
            pathname === href ||
            (item.href !== "/dashboard" && pathname.startsWith(href));
          const Icon = item.icon;

          return (
              <Link
                key={item.id}
                href={href as unknown as any}
                className={cn(
                  "flex items-start gap-3 rounded-md px-3 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block font-medium">{item.labels[locale]}</span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-5",
                    isActive ? "text-primary-foreground/80" : "text-white/50",
                  )}
                >
                  {item.description[locale]}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
