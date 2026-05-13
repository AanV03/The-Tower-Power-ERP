"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Globe, LogOut } from "lucide-react";

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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-navy text-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="w-10" />

        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-2xl">
            <Button
              variant="ghost"
              className="relative flex h-10 w-full items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 text-left text-sm text-white/80"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            >
              <Search className="size-4 text-white/80" aria-hidden="true" />
              <span className="flex-1">{dictionary.common.searchPlaceholder}</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/80">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" as any, size: "icon" }))} aria-label="Idioma">
              <Globe className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel>Idioma</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {locales.map((targetLocale) => {
                const href = pathname.replace(`/${locale}`, `/${targetLocale}`);
                return (
                  <DropdownMenuItem key={targetLocale} onClick={() => router.push(href as unknown as any)}>
                    {targetLocale.toUpperCase()}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className={cn(buttonVariants({ variant: "ghost" as any, size: "icon" }))} aria-label="Cerrar sesión" onClick={handleLogout}>
            <LogOut className="size-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" as any }))}>
              <Avatar className="h-9 w-9 border-none">
                <AvatarFallback className="bg-white/10 text-white font-medium">U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/${locale}/profile` as unknown as any)}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/${locale}/settings` as unknown as any)}>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-variant="destructive">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
