"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { useBrandIdentity } from "@/components/branding/brand-identity";
import { getActiveNavigationGroupId, getNavSectionTheme } from "@/components/layout/nav-section-theme";
import NotificationsPopover from "@/components/layout/notifications-popover";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Topbar({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const identity = useBrandIdentity();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const languageMenuId = "topbar-language-menu";
  const accountMenuId = "topbar-account-menu";
  const activeSectionId = getActiveNavigationGroupId(pathname, locale);
  const sectionTheme = getNavSectionTheme(activeSectionId);
  const sectionStyle = {
    "--nav-section-accent": sectionTheme.accent,
    "--nav-section-ink": sectionTheme.ink,
    "--nav-section-rgb": sectionTheme.rgb,
  } as CSSProperties;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    if (languageOpen || accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [languageOpen, accountOpen]);

  useEffect(() => {
    if (!languageOpen && !accountOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLanguageOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [languageOpen, accountOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    await signOut({ callbackUrl: `/${locale}/signin` });
  };

  return (
    <header
      className="glass-panel glass-topbar relative z-50 flex h-20 flex-shrink-0 border-x-0 border-t-0 text-[var(--shell-topbar-foreground)] shadow-xl shadow-black/10"
      role="banner"
      style={sectionStyle}
    >
      <div className="flex h-full w-full items-center gap-2 sm:gap-4 px-2 sm:px-6 lg:px-8">
        <button
          className="topbar-icon-button inline-flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-none text-sm font-medium"
          aria-label={dictionary.common.toggleSidebar}
          onClick={() => document.dispatchEvent(new CustomEvent("sidebar:toggle"))}
          type="button"
        >
          <Menu className="size-4" />
        </button>

        {/* Search: icon-only on mobile, full bar on sm+ */}
        <div className="hidden sm:flex min-w-0 flex-1 justify-start">
          <div className="w-full max-w-md xl:max-w-xl">
            <button
              className="glass-control relative flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-sm shadow-inner shadow-black/20"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              aria-label={dictionary.common.searchPlaceholder}
              type="button"
            >
              <Search className="size-4 text-current" aria-hidden="true" />
              <span className="flex-1">{dictionary.common.searchPlaceholder}</span>
              <kbd className="inline-flex h-5 items-center gap-1 border border-[var(--topbar-border-color,var(--sidebar-border-color))] bg-[var(--glass-control-bg)] px-1.5 font-mono text-[10px] font-medium text-current opacity-80">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>
        <button
          className="topbar-icon-button inline-flex size-8 shrink-0 items-center justify-center rounded-none text-sm font-medium sm:hidden"
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          aria-label={dictionary.common.searchPlaceholder}
          type="button"
        >
          <Search className="size-4" />
        </button>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-3">
          {/* Notificaciones */}
          <NotificationsPopover locale={locale} />

          <div ref={languageRef} className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="topbar-icon-button inline-flex size-8 sm:size-10 items-center justify-center rounded-none text-sm font-medium"
              aria-label={dictionary.common.language}
              title={dictionary.common.language}
              aria-haspopup="menu"
              aria-expanded={languageOpen}
              aria-controls={languageOpen ? languageMenuId : undefined}
              type="button"
            >
              <Globe className="size-4" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {languageOpen && (
                <motion.div
                  id={languageMenuId}
                  className="glass-menu glass-topbar absolute right-0 z-[120] mt-3 w-44 overflow-hidden rounded-lg border border-[var(--shell-topbar-border-color)] shadow-2xl shadow-black/20"
                  role="menu"
                  aria-label={dictionary.common.language}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="py-1">
                    {locales.map((targetLocale) => {
                      const href = pathname.replace(`/${locale}`, `/${targetLocale}`);
                      const isActive = locale === targetLocale;
                      const label = dictionary.common.languageNames[targetLocale];

                      return (
                        <button
                          key={targetLocale}
                          onClick={() => {
                            router.push(href as any);
                            setLanguageOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive ? "font-bold" : "text-[var(--shell-topbar-foreground)]",
                          )}
                          style={isActive ? { backgroundColor: "var(--nav-section-accent)", color: "var(--nav-section-ink)" } : undefined}
                          aria-current={isActive ? "page" : undefined}
                          aria-checked={isActive}
                          role="menuitemradio"
                          type="button"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle locale={locale} />

          <div ref={accountRef} className="relative">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="topbar-icon-button inline-flex size-8 sm:size-10 items-center justify-center rounded-none text-sm font-medium"
              aria-label={dictionary.common.account}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-controls={accountOpen ? accountMenuId : undefined}
              type="button"
            >
              <div className="flex size-7 sm:size-9 items-center justify-center rounded-none text-sm font-medium text-current">
                U
              </div>
              <ChevronDown className="hidden size-4 text-[var(--shell-topbar-foreground-secondary)] sm:block" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  id={accountMenuId}
                  className="glass-menu glass-topbar absolute right-0 z-[120] mt-3 w-64 overflow-hidden rounded-lg border border-[var(--shell-topbar-border-color)] shadow-2xl shadow-black/20"
                  role="menu"
                  aria-label={dictionary.common.account}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="border-b border-[var(--shell-topbar-border-color)] px-4 py-4">
                    <p className="text-sm font-semibold text-[var(--shell-topbar-foreground)]">{dictionary.common.account}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--shell-topbar-foreground-secondary)" }}>
                      {identity.name}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        router.push(`/${locale}/profile` as any);
                        setAccountOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--shell-topbar-foreground)] transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      role="menuitem"
                      type="button"
                    >
                      <User className="size-4 text-[var(--shell-topbar-foreground-secondary)]" aria-hidden="true" />
                      {dictionary.common.profile}
                    </button>
                    <button
                      onClick={() => {
                        router.push(`/${locale}/settings` as any);
                        setAccountOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--shell-topbar-foreground)] transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      role="menuitem"
                      type="button"
                    >
                      <Settings className="size-4 text-[var(--shell-topbar-foreground-secondary)]" aria-hidden="true" />
                      {dictionary.common.settings}
                    </button>
                    <div className="my-1 border-t border-[var(--shell-topbar-border-color)]" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setAccountOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--shell-topbar-foreground)] transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      role="menuitem"
                      type="button"
                    >
                      <LogOut className="size-4 text-[var(--shell-topbar-foreground-secondary)]" aria-hidden="true" />
                      {dictionary.common.logout}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
