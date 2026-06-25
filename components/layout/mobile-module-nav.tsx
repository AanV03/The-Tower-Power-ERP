"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { navigationGroups, navigationItems } from "@/data/navigation";
import { defaultBrand } from "@/lib/branding";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
  const dictionary = getDictionary(locale);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
          className="glass-panel-strong glass-sidebar fixed inset-0 z-50 flex flex-col rounded-none border-0 text-[var(--sidebar-text-primary)] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-module-menu-title"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--sidebar-border-color)] px-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-12 items-center justify-center rounded-none text-sm font-bold"
            style={{ backgroundColor: "var(--brand-yellow)", color: "var(--brand-ink)" }}
          >
            {defaultBrand.logoText}
          </div>
          <div>
            <p id="mobile-module-menu-title" className="text-sm font-semibold">
              {defaultBrand.name}
            </p>
            <p className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
              {dictionary.common.productCategory}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={dictionary.common.closeMenu}
          className="glass-control flex size-10 items-center justify-center rounded-none"
          type="button"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label={dictionary.common.moduleNavigation}>
        <ul className="flex flex-col gap-1">
          {navigationGroups.map((group) => (
            <li key={group.id} className="pt-3 first:pt-0">
              <p
                className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--sidebar-text-secondary)" }}
              >
                {group.labels[locale]}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const href = `/${locale}${item.href}`;
                  const isActive = pathname === href || (item.href !== "/dashboard" && pathname.startsWith(href));
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <Link
                        href={href as unknown as any}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-md px-4 py-3.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive ? "" : "hover:bg-[var(--glass-control-hover)]",
                        )}
                        style={
                          isActive
                            ? { backgroundColor: "var(--sidebar-accent-active)", color: "#0f172a" }
                            : { color: "var(--sidebar-text-primary)" }
                        }
                      >
                        <Icon className="size-5 shrink-0" aria-hidden="true" />
                        <span>{item.labels[locale]}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-[var(--sidebar-border-color)] px-5 py-4">
        <p className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
          (c) {new Date().getFullYear()} Gerpy
        </p>
      </div>
    </div>
  );
}

function DesktopModuleBar({ locale, pathname }: { locale: Locale; pathname: string }) {
  const dictionary = getDictionary(locale);

  return (
    <nav
      className="glass-panel glass-topbar hidden gap-2 overflow-x-auto rounded-none border-x-0 border-t-0 px-4 py-2 md:flex lg:hidden"
      aria-label={dictionary.common.moduleNavigation}
    >
      {navigationItems.map((item) => {
        const href = `/${locale}${item.href}`;
        const isActive = pathname === href || (item.href !== "/dashboard" && pathname.startsWith(href));
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={href as unknown as any}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive ? "" : "glass-control",
            )}
            style={
              isActive
                ? { backgroundColor: "var(--sidebar-accent-active)", color: "#0f172a" }
                : undefined
            }
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

export function MobileModuleNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <DesktopModuleBar locale={locale} pathname={pathname} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locale={locale}
        pathname={pathname}
      />
    </>
  );
}
