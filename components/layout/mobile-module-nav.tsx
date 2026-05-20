"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { navigationItems } from "@/data/navigation";
import { defaultBrand } from "@/lib/branding";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ─── Mobile full-screen drawer ────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
  locale,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  pathname: string;
}) {
  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-brand-navy text-white md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de módulos"
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--sidebar-border-color)] px-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-12 items-center justify-center rounded-md text-sm font-bold"
            style={{ backgroundColor: "var(--brand-yellow)", color: "var(--brand-ink)" }}
          >
            {defaultBrand.logoText}
          </div>
          <div>
            <p className="text-sm font-semibold">{defaultBrand.name}</p>
            <p className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
              {locale === "es" ? "Gimnasio ERP" : "Gym ERP"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex size-10 items-center justify-center rounded-md transition-colors hover:bg-[var(--glass-opacity-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Nav list — vertical, large tap targets */}
      <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Módulos del ERP">
        <ul className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const href = `/${locale}${item.href}`;
            const isActive =
              pathname === href ||
              (item.href !== "/dashboard" && pathname.startsWith(href));
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={href as unknown as any}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-lg px-4 py-3.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-[var(--glass-opacity-dark)]",
                  )}
                  style={!isActive ? { color: "var(--sidebar-text-primary)" } : undefined}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <span>{item.labels[locale]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--sidebar-border-color)] px-5 py-4 shrink-0">
        <p className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
          © {new Date().getFullYear()} Gerpy
        </p>
      </div>
    </div>
  );
}

/* ─── Desktop horizontal pill bar (md → lg) ────────────────────────── */
function DesktopModuleBar({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <nav
      className="hidden gap-2 overflow-x-auto border-b border-[var(--sidebar-border-color)] bg-card px-4 py-2 md:flex lg:hidden glass-effect-light"
      aria-label="Módulos del ERP"
      role="navigation"
    >
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
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
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

/* ─── Public component ─────────────────────────────────────────────── */
export function MobileModuleNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  /*
   * The topbar's hamburger already dispatches "sidebar:toggle".
   * On mobile (< md) we intercept that event to open this drawer instead.
   * On desktop (lg+) AppSidebar handles the same event for collapse/expand.
   */
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) {
        setDrawerOpen((prev) => !prev);
      }
    };
    document.addEventListener("sidebar:toggle", handler);
    return () => document.removeEventListener("sidebar:toggle", handler);
  }, []);

  return (
    <>
      {/* Desktop horizontal bar (md → lg) */}
      <DesktopModuleBar locale={locale} pathname={pathname} />

      {/* Full-screen mobile drawer — triggered by topbar hamburger */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locale={locale}
        pathname={pathname}
      />
    </>
  );
}
