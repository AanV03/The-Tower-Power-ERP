"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Globe, LogOut, Menu, ChevronDown } from "lucide-react";
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

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {
      /* ignore */
    }
    router.push("/");
  };

  return (
    <header
      className="flex-shrink-0 h-16 border-b border-[var(--sidebar-border-color)] text-white glass-effect"
      style={{ backgroundColor: "var(--topbar-bg)" }}
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
            aria-label="Alternar sidebar"
            onClick={() => document.dispatchEvent(new CustomEvent("sidebar:toggle"))}
          >
            <Menu className="size-4" />
          </button>
        </div>

        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-xs sm:max-w-2xl">
            <button
              className="relative flex h-10 w-full items-center gap-3 rounded-full border border-[var(--sidebar-border-color)] glass-effect-light px-4 text-left text-sm text-[var(--sidebar-text-primary)] focus-visible:ring-2 focus-visible:ring-offset-2 hover:bg-accent/5 transition-colors"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              aria-label={dictionary.common.searchPlaceholder}
            >
              <Search className="size-4 text-[var(--sidebar-text-primary)]" aria-hidden="true" />
              <span className="flex-1 hidden sm:inline">{dictionary.common.searchPlaceholder}</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[var(--sidebar-border-color)] bg-[var(--glass-opacity-light)] px-1.5 font-mono text-[10px] font-medium text-[var(--sidebar-text-secondary)]">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notificaciones */}
          <NotificationsPopover />

          {/* Cambio de Idioma - Simple Menu */}
          <div ref={languageRef} className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
              aria-label={dictionary.common.language}
              title={dictionary.common.language}
              aria-haspopup="menu"
              aria-expanded={languageOpen}
              type="button"
            >
              <Globe className="size-4" aria-hidden="true" />
            </button>
            
            {languageOpen && (
              <div className="absolute right-0 mt-3 rounded-none shadow-lg border-t border-[var(--sidebar-border-color)] z-50 w-36" style={{ backgroundColor: "var(--topbar-bg)" }}>
                <div className="py-1">
                  {locales.map((targetLocale) => {
                    const href = pathname.replace(`/${locale}`, `/${targetLocale}`);
                    const isActive = locale === targetLocale;
                    const label = targetLocale === "es" ? "Español" : targetLocale === "en" ? "English" : "Français";
                    
                    return (
                      <button
                        key={targetLocale}
                        onClick={() => {
                          router.push(href as any);
                          setLanguageOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent/20 ${
                          isActive ? "bg-accent/30 text-accent-foreground font-semibold" : "text-white"
                        }`}
                        aria-current={isActive ? "page" : undefined}
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
              aria-label={dictionary.common.account}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              type="button"
            >
              <div className="h-9 w-9 rounded-full bg-[var(--glass-opacity-dark)] text-white font-medium text-sm flex items-center justify-center">
                U
              </div>
            </button>
            
            {accountOpen && (
              <div className="absolute right-0 mt-3 rounded-none shadow-lg border-t border-[var(--sidebar-border-color)] z-50 w-48" style={{ backgroundColor: "var(--topbar-bg)" }}>
                <div className="px-4 py-3 border-b border-[var(--sidebar-border-color)]">
                  <p className="text-sm font-semibold text-white">{dictionary.common.account}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push(`/${locale}/profile` as any);
                      setAccountOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent/20 text-white"
                    type="button"
                  >
                    {dictionary.common.profile}
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/${locale}/settings` as any);
                      setAccountOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent/20 text-white"
                    type="button"
                  >
                    {dictionary.common.settings}
                  </button>
                  <div className="border-t border-[var(--sidebar-border-color)] my-1" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setAccountOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-destructive/20 text-red-400"
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
