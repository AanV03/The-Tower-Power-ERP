"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Search, Globe, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import NotificationsPopover from "@/components/layout/notifications-popover";

export function Topbar({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const languageMenuId = "topbar-language-menu";
  const accountMenuId = "topbar-account-menu";

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
      className="glass-panel glass-topbar relative z-50 flex h-16 flex-shrink-0 border-x-0 border-t-0"
      style={{
        color: "var(--topbar-foreground, var(--sidebar-text-primary))",
        borderColor: "var(--topbar-border-color, var(--sidebar-border-color))",
      }}
      role="banner"
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
              className="glass-control relative flex h-10 w-full items-center gap-3 rounded-none px-4 text-left text-sm"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
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

          {/* Cambio de Idioma - Simple Menu */}
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
            
            {languageOpen && (
              <div
                id={languageMenuId}
                className="glass-menu glass-topbar absolute right-0 z-[120] mt-3 w-36 rounded-none"
                role="menu"
                aria-label={dictionary.common.language}
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
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isActive ? "bg-[var(--sidebar-accent-active)] font-semibold text-[#0f172a]" : "text-[var(--topbar-foreground,var(--sidebar-text-primary))]"
                        }`}
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
              </div>
            )}
          </div>

          {/* Cambio de Tema */}
          <ThemeToggle locale={locale} />

          {/* Avatar Dropdown - Simple Menu */}
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
            </button>
            
            {accountOpen && (
              <div
                id={accountMenuId}
                className="glass-menu glass-topbar absolute right-0 z-[120] mt-3 w-48 rounded-none"
                role="menu"
                aria-label={dictionary.common.account}
              >
                <div className="px-4 py-3 border-b border-[var(--topbar-border-color,var(--sidebar-border-color))]">
                  <p className="text-sm font-semibold text-[var(--topbar-foreground,var(--sidebar-text-primary))]">{dictionary.common.account}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push(`/${locale}/profile` as any);
                      setAccountOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--topbar-foreground,var(--sidebar-text-primary))] transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    role="menuitem"
                    type="button"
                  >
                    {dictionary.common.profile}
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/${locale}/settings` as any);
                      setAccountOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--topbar-foreground,var(--sidebar-text-primary))] transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    role="menuitem"
                    type="button"
                  >
                    {dictionary.common.settings}
                  </button>
                  <div className="border-t border-[var(--topbar-border-color,var(--sidebar-border-color))] my-1" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setAccountOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--topbar-foreground,var(--sidebar-text-primary))] transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    role="menuitem"
                    type="button"
                  >
                    {dictionary.common.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
