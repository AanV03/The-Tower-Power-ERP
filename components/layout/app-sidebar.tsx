"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { navigationItems } from "@/data/navigation";
import { defaultBrand } from "@/lib/branding";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
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

  const filteredItems = navigationItems;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .gerpy-sidebar *::-webkit-scrollbar { width: 8px; height:8px }
          .gerpy-sidebar *::-webkit-scrollbar-thumb { background: var(--glass-opacity-light); border-radius: 999px }
          .gerpy-sidebar * { scrollbar-width: thin; scrollbar-color: var(--glass-opacity-light) transparent }
          .gerpy-sidebar .sidebar-content::-webkit-scrollbar { width: 8px }
          .gerpy-sidebar .sidebar-content::-webkit-scrollbar-thumb { background: var(--glass-opacity-medium); border-radius: 6px }
        `,
        }}
      />

      <aside
        className={cn(
          "hidden shrink-0 border-r bg-brand-navy text-white lg:flex lg:flex-col gerpy-sidebar overflow-y-auto h-full glass-effect",
          collapsed ? "w-16" : "w-72",
        )}
        role="navigation"
        aria-label="Panel de navegación principal"
      >
        <div className={cn("flex h-16 items-center gap-3 border-b border-[var(--sidebar-border-color)]", collapsed ? "justify-center px-2" : "px-5")}>
          <div className={cn("flex items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground", collapsed ? "w-10 h-10 text-base" : "w-12 h-10")}>
            {defaultBrand.logoText}
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">{defaultBrand.name}</p>
              <p className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>{locale === "es" ? "Gimnasio ERP" : "Gym ERP"}</p>
            </div>
          )}
        </div>

        <div className={cn("flex flex-col flex-1 gerpy-sidebar-branded min-h-0", collapsed ? "items-center" : "")}>
          {/* Search is provided by Topbar — remove duplicate input from sidebar */}

          <nav className={cn("sidebar-content flex-1 space-y-1 overflow-y-auto p-3 w-full", collapsed ? "px-1" : "")} aria-label="ERP modules">
            {filteredItems.map((item) => {
              const href = `/${locale}${item.href}`;
              const isActive = pathname === href || (item.href !== "/dashboard" && pathname.startsWith(href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={href as unknown as any}
                  className={cn(
                    "flex gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-[var(--glass-opacity-dark)] transition-all",
                    collapsed ? "justify-center" : "items-center",
                  )}
                  style={!isActive ? { color: "var(--sidebar-text-primary)" } : undefined}
                  aria-current={isActive ? "page" : undefined}
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

          <div className="border-t border-[var(--sidebar-border-color)] px-3 py-3 w-full flex-none">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs" style={{ color: "var(--sidebar-text-secondary)" }}>
                {collapsed ? '©' : `© ${new Date().getFullYear()} Gerpy`}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
