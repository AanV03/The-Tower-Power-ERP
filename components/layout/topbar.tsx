"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Globe, LogOut, Menu } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationsPopover from "@/components/layout/notifications-popover";

export function Topbar({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const pathname = usePathname() || "/";
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {
      /* ignore */
    }
    router.push("/");
  };

  const getInitials = (name: string) => {
    return (
      name?.
        split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <header
      className="flex-shrink-0 h-16 border-b border-[var(--sidebar-border-color)] bg-brand-navy text-white glass-effect"
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            className={cn(buttonVariants({ variant: "ghost" as any, size: "icon" }))}
            aria-label="Alternar sidebar"
            onClick={() => document.dispatchEvent(new CustomEvent("sidebar:toggle"))}
          >
            <Menu className="size-4" />
          </button>
        </div>

        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-xs sm:max-w-2xl">
            <Button
              variant="ghost"
              className="relative flex h-10 w-full items-center gap-3 rounded-full border border-[var(--sidebar-border-color)] glass-effect-light px-4 text-left text-sm text-[var(--sidebar-text-primary)] focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              aria-label={dictionary.common.searchPlaceholder}
            >
              <Search className="size-4 text-[var(--sidebar-text-primary)]" aria-hidden="true" />
              <span className="flex-1 hidden sm:inline">{dictionary.common.searchPlaceholder}</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[var(--sidebar-border-color)] bg-[var(--glass-opacity-light)] px-1.5 font-mono text-[10px] font-medium text-[var(--sidebar-text-secondary)]">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger 
              className={cn(buttonVariants({ variant: "ghost" as any, size: "icon" }))} 
              aria-label={dictionary.common.language || "Idioma"}
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <Globe className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel>{dictionary.common.language || "Idioma"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {locales.map((targetLocale) => {
                const href = pathname.replace(`/${locale}`, `/${targetLocale}`);
                return (
                  <DropdownMenuItem 
                    key={targetLocale} 
                    onClick={() => router.push(href as unknown as any)}
                    aria-current={locale === targetLocale ? "true" : undefined}
                  >
                    {targetLocale === "es" ? "Español" : "English"}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            className={cn(buttonVariants({ variant: "ghost" as any, size: "icon" }))} 
            aria-label={dictionary.common.logout || "Cerrar sesión"} 
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger 
              className={cn(buttonVariants({ variant: "ghost" as any }))} 
              aria-label={dictionary.common.account || "Mi cuenta"}
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <Avatar className="h-9 w-9 border-none">
                <AvatarFallback className="bg-[var(--glass-opacity-dark)] text-white font-medium">U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{dictionary.common.account || "Cuenta"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/${locale}/profile` as unknown as any)}>
                {dictionary.common.profile || "Perfil"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/${locale}/settings` as unknown as any)}>
                {dictionary.common.settings || "Configuración"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-variant="destructive">
                {dictionary.common.logout || "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
