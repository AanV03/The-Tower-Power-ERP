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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationsPopover({ locale = "es" }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={cn(buttonVariants({ variant: "ghost" as any, size: "icon" }))} 
        aria-label={dictionary.common.notifications}
        aria-haspopup="menu"
        aria-expanded="false"
        title={dictionary.common.notifications}
      >
        <Bell className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{dictionary.common.notifications}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ul className="max-h-96 overflow-y-auto space-y-1" aria-label="Historial de notificaciones">
          <li className="list-none">
            <button
              className="w-full text-left flex items-center gap-3 px-2 py-3 hover:bg-accent/50 rounded transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={dictionary.common.systemUpdated}
            >
              <Check className="size-4 text-green-600 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 text-sm text-foreground">
                {dictionary.common.systemUpdated}
              </div>
            </button>
          </li>
          <li className="list-none">
            <button
              className="w-full text-left flex items-center gap-3 px-2 py-3 hover:bg-accent/50 rounded transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={dictionary.common.noNotifications}
            >
              <BellOff className="size-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 text-sm text-muted-foreground">
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
