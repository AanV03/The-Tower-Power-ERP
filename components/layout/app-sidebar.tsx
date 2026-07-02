"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { useRbacContext } from "@/components/auth/rbac-provider";
import { getActiveNavigationGroupId, getNavSectionTheme } from "@/components/layout/nav-section-theme";
import { navigationGroups } from "@/data/navigation";
import { filterNavigationGroupsByPermission } from "@/lib/auth/navigation-permissions";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { defaultBrand } from "@/lib/branding";
import { useBrandIdentity, type BrandIdentity } from "@/components/branding/brand-identity";

export function AppSidebar({ locale, serverIdentity }: { locale: Locale, serverIdentity?: BrandIdentity | null }) {
  const dictionary = getDictionary(locale);
  const pathname = usePathname();
  const identity = useBrandIdentity(serverIdentity);
  const tenantContext = useRbacContext();
  const [collapsed, setCollapsed] = useState(false);
  const activeSectionId = getActiveNavigationGroupId(pathname, locale);
  const sectionTheme = getNavSectionTheme(activeSectionId);
  const visibleNavigationGroups = useMemo(
    () => filterNavigationGroupsByPermission(navigationGroups, tenantContext),
    [tenantContext],
  );
  const sectionStyle = {
    "--nav-section-accent": sectionTheme.accent,
    "--nav-section-ink": sectionTheme.ink,
    "--nav-section-rgb": sectionTheme.rgb,
  } as CSSProperties;

  useEffect(() => {
    try {
      setCollapsed(JSON.parse(localStorage.getItem("sidebarCollapsed") ?? "false"));
    } catch {
      setCollapsed(false);
    }
  }, []);

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
          .gerpy-sidebar::-webkit-scrollbar { width: 10px }
          .gerpy-sidebar::-webkit-scrollbar-track { background: transparent }
          .gerpy-sidebar::-webkit-scrollbar-thumb { background: rgba(var(--nav-section-rgb), 0.5); border: 3px solid transparent; border-radius: 999px; background-clip: content-box }
        `,
        }}
      />

      <aside
        className={cn(
          "glass-panel glass-sidebar hidden h-full shrink-0 overflow-hidden border-y-0 border-l-0 text-[var(--shell-sidebar-foreground)] shadow-2xl shadow-black/15 transition-[width] duration-300 ease-out lg:flex lg:flex-col gerpy-sidebar",
          collapsed ? "w-[5.25rem]" : "w-72",
        )}
        aria-label={dictionary.common.primaryNavigation}
      >
        <div className={cn("flex h-16 items-center gap-3 border-b border-[var(--sidebar-border-color)]", collapsed ? "justify-center px-2" : "px-5")}>
          {identity.logoDataUrl ? (
            <img 
              src={identity.logoDataUrl} 
              alt="Brand Logo" 
              className={cn("object-contain", collapsed ? "h-8 w-8" : "h-10 w-12")} 
            />
          ) : (
            <div
              className={cn("flex items-center justify-center rounded-none text-sm font-bold", collapsed ? "h-10 w-10 text-base" : "h-10 w-12")}
              style={{ backgroundColor: "var(--brand-yellow)", color: "var(--brand-ink)" }}
            >
              {identity.logoText}
            </div>
          )}
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{identity.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--sidebar-text-secondary)" }}>
                {identity.subtitle || dictionary.common.productCategory}
              </p>
            </div>
          )}
        </div>

        <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden gerpy-sidebar-branded", collapsed ? "items-center" : "")}>
          <nav
            className={cn("sidebar-content min-h-0 w-full flex-1 space-y-1 overflow-y-auto overscroll-contain py-5", collapsed ? "px-0" : "px-3")}
            aria-label={dictionary.common.moduleNavigation}
          >
            {visibleNavigationGroups.map((group) => (
              <div key={group.id} className={cn("space-y-1", collapsed ? "pt-4 first:pt-0" : "pt-5 first:pt-0")}>
                {!collapsed && (
                  <p
                    className="px-3 pb-1 text-[11px] font-black uppercase tracking-[0.16em]"
                    style={{ color: "var(--shell-sidebar-foreground-secondary)" }}
                  >
                    {group.labels[locale]}
                  </p>
                )}
                {group.items.map((item) => {
                  const href = `/${locale}${item.href}`;
                  const isActive = pathname === href || (item.href !== "/dashboard" && pathname.startsWith(href));
                  const Icon = item.icon;
                  const isActiveGroup = activeSectionId === group.id;

                  return (
                    <Link
                      key={item.id}
                      href={href as unknown as any}
                      className={cn(
                        "group relative flex overflow-hidden rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive ? "text-primary-foreground" : "hover:bg-[var(--sidebar-accent-hover)]",
                        collapsed
                          ? "mx-auto size-11 items-center justify-center p-0"
                          : "min-h-11 items-center gap-3 px-3",
                      )}
                      style={{
                        color: isActive ? "var(--sidebar-accent-active-foreground, #ffffff)" : "var(--shell-sidebar-foreground)",
                      }}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={collapsed ? `${group.labels[locale]}: ${item.labels[locale]}` : undefined}
                      title={collapsed ? item.labels[locale] : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-item"
                          className="absolute inset-0 rounded-lg"
                          style={{ backgroundColor: "var(--sidebar-accent-active)" }}
                          transition={{ type: "spring", stiffness: 480, damping: 42 }}
                        />
                      )}
                      {!isActive && !collapsed && (
                        <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[var(--sidebar-accent-active)] opacity-0 transition-opacity group-hover:opacity-80" />
                      )}
                      <Icon
                        className="relative z-10 size-4 shrink-0 transition-transform group-hover:scale-110"
                        style={!isActive ? { color: "var(--sidebar-accent-active)" } : undefined}
                        aria-hidden="true"
                      />
                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            className="relative z-10 min-w-0"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.14 }}
                          >
                            <span className="block truncate font-semibold">{item.labels[locale]}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className={cn("mt-auto w-full flex-none border-t border-[var(--shell-sidebar-border-color)]", collapsed ? "p-0 py-3" : "p-3")}>
            <div className={cn("flex items-center rounded-lg border border-[var(--shell-sidebar-border-color)] bg-white/30 dark:bg-white/[0.035]", collapsed ? "mx-auto size-11 justify-center p-0" : "gap-3 p-3")}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sidebar-accent-hover)] text-[var(--brand-yellow)]">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">White-label ready</p>
                  <p className="truncate text-[11px]" style={{ color: "var(--shell-sidebar-foreground-secondary)" }}>
                    {new Date().getFullYear()} Gerpy
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
