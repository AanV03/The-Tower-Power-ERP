"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigationItems } from "@/data/navigation";
import { defaultBrand } from "@/lib/branding";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppSidebar({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      return JSON.parse(localStorage.getItem("sidebarCollapsed") ?? "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onToggle = () => {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
        } catch (e) {
          /* ignore */
        }
        return next;
      });
    };

    const onSet = (e: Event) => {
      if (e instanceof CustomEvent && typeof e.detail === "object" && e.detail && "collapsed" in e.detail) {
        const newVal = !!e.detail.collapsed;
        setCollapsed(newVal);
        try {
          localStorage.setItem("sidebarCollapsed", JSON.stringify(newVal));
        } catch (e) {
          /* ignore */
        }
      }
    };

    document.addEventListener("sidebar:toggle", onToggle);
    document.addEventListener("sidebar:set", onSet as EventListener);
    return () => {
      document.removeEventListener("sidebar:toggle", onToggle);
      document.removeEventListener("sidebar:set", onSet as EventListener);
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .gerpy-sidebar *::-webkit-scrollbar { width: 8px; height: 8px }
          .gerpy-sidebar *::-webkit-scrollbar-thumb { background: var(--glass-opacity-light); border-radius: 0 }
          .gerpy-sidebar * { scrollbar-width: thin; scrollbar-color: var(--glass-opacity-light) transparent }
          .gerpy-sidebar .sidebar-content::-webkit-scrollbar { width: 8px }
          .gerpy-sidebar .sidebar-content::-webkit-scrollbar-thumb { background: var(--glass-opacity-medium); border-radius: 0 }
        `,
        }}
      />

      <aside
        className={cn(
          "glass-panel glass-sidebar hidden h-full shrink-0 overflow-y-auto border-y-0 border-l-0 text-[var(--sidebar-text-primary)] lg:flex lg:flex-col gerpy-sidebar",
          collapsed ? "w-16" : "w-72",
        )}
        aria-label={dictionary.common.primaryNavigation}
      >
        <div className={cn("flex h-16 items-center gap-3 border-b border-[var(--sidebar-border-color)]", collapsed ? "justify-center px-2" : "px-5")}>
          <div
            className={cn("flex items-center justify-center rounded-none text-sm font-bold", collapsed ? "h-10 w-10 text-base" : "h-10 w-12")}
            style={{ backgroundColor: "var(--brand-yellow)", color: "var(--brand-ink)" }}
          >
            {defaultBrand.logoText}
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">{defaultBrand.name}</p>
              <p className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
                {locale === "es" ? "Gimnasio ERP" : "Gym ERP"}
              </p>
            </div>
          )}
        </div>

        <div className={cn("flex min-h-0 flex-1 flex-col gerpy-sidebar-branded", collapsed ? "items-center" : "")}>
          <nav
            className={cn("sidebar-content w-full flex-1 space-y-1 overflow-y-auto p-3", collapsed ? "px-1" : "")}
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
                    "flex gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive ? "text-primary-foreground" : "hover:bg-[var(--sidebar-accent-hover)] transition-all",
                    collapsed ? "justify-center" : "items-center",
                  )}
                  style={{
                    ...(isActive
                      ? { backgroundColor: "var(--sidebar-accent-active)" }
                      : { color: "var(--sidebar-text-primary)" }),
                  }}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={collapsed ? item.labels[locale] : undefined}
                >
                  <Icon className={cn("size-4 shrink-0", collapsed ? "m-0" : "")} aria-hidden="true" />
                  {!collapsed && (
                    <span className="min-w-0">
                      <span className="block font-medium">{item.labels[locale]}</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="w-full flex-none border-t border-[var(--sidebar-border-color)] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
                {collapsed ? "(c)" : `(c) ${new Date().getFullYear()} Gerpy`}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
