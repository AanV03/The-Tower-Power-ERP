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
          .gerpy-sidebar *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 999px }
          .gerpy-sidebar * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent }
          .gerpy-sidebar .sidebar-content::-webkit-scrollbar { width: 8px }
          .gerpy-sidebar .sidebar-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 6px }
        `,
        }}
      />

      <aside
        className={cn(
          "hidden shrink-0 border-r bg-brand-navy text-white lg:flex lg:flex-col gerpy-sidebar",
          collapsed ? "w-16" : "w-72",
          "lg:sticky lg:top-0 lg:h-screen lg:z-20",
        )}
      >
        <div className={cn("flex h-16 items-center gap-3 border-b border-white/10", collapsed ? "justify-center px-2" : "px-5") }>
          <div className={cn("flex items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground", collapsed ? "w-10 h-10 text-base" : "w-12 h-10")}>
            {defaultBrand.logoText}
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">{defaultBrand.name}</p>
              <p className="text-xs text-white/60">Gym ERP SaaS</p>
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
                    "flex gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-white/80 hover:bg-white/10 hover:text-white",
                    collapsed ? "justify-center" : "items-center",
                  )}
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

          <div className="border-t border-white/10 px-3 py-3 w-full flex-none">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-white/60">{collapsed ? '©' : '© Gerpy ERP'}</div>
              <div className="flex items-center gap-2">
                {!collapsed && <div className="text-xs text-white/50">&nbsp;</div>}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
