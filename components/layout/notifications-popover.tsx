"use client";

import { Bell, Check, BellOff } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function NotificationsPopover({ locale = "es" }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="topbar-icon-button inline-flex size-8 sm:size-10 items-center justify-center rounded-none text-sm font-medium"
        aria-label={dictionary.common.notifications}
        aria-haspopup="menu"
        aria-expanded="false"
        title={dictionary.common.notifications}
      >
        <Bell className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-menu glass-topbar w-80 rounded-none">
        <DropdownMenuLabel className="text-[var(--sidebar-text-secondary)]">{dictionary.common.notifications}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ul className="max-h-96 overflow-y-auto space-y-1" aria-label={dictionary.common.notificationsHistory}>
          <li className="list-none">
            <button
              className="flex w-full items-center gap-3 rounded-none px-2 py-3 text-left transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={dictionary.common.systemUpdated}
              type="button"
            >
              <Check className="size-4 flex-shrink-0 text-[var(--brand-green)]" aria-hidden="true" />
              <div className="flex-1 text-sm text-[var(--sidebar-text-primary)]">
                {dictionary.common.systemUpdated}
              </div>
            </button>
          </li>
          <li className="list-none">
            <button
              className="flex w-full items-center gap-3 rounded-none px-2 py-3 text-left transition-colors hover:bg-[var(--glass-control-hover)] focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={dictionary.common.noNotifications}
              type="button"
            >
              <BellOff className="size-4 flex-shrink-0 text-[var(--sidebar-text-secondary)]" aria-hidden="true" />
              <div className="flex-1 text-sm text-[var(--sidebar-text-secondary)]">
                {dictionary.common.noNotifications}
              </div>
            </button>
          </li>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsPopover;
