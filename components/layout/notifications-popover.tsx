"use client";

import React from "react";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  BellOff, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  CreditCard, 
  Key, 
  Users, 
  Settings,
  Eye
} from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { useNotificationsMock, type MockNotification } from "@/hooks/use-notifications-mock";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function NotificationsPopover({ locale = "es" }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsMock();

  // Get only the most recent 4 notifications for the dropdown
  const recentNotifications = notifications.slice(0, 4);

  // Helper to get module/category icon
  const getNotificationIcon = (module: MockNotification["module"], type: MockNotification["type"]) => {
    const iconClass = cn(
      "size-4 shrink-0",
      type === "critical" && "text-red-500",
      type === "warning" && "text-amber-500",
      type === "info" && "text-blue-500"
    );

    switch (module) {
      case "finance":
        return <CreditCard className={iconClass} />;
      case "access":
        return <Key className={iconClass} />;
      case "hr":
        return <Users className={iconClass} />;
      case "system":
        return <Settings className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  // Helper for priority/type styling
  const getTypeBadgeStyles = (type: MockNotification["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    }
  };

  // Helper for relative time format
  const formatRelativeTime = (dateString: string) => {
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "ahora mismo";
      if (diffMins < 60) return `hace ${diffMins} min`;
      if (diffHours < 24) return `hace ${diffHours} h`;
      return `hace ${diffDays} d`;
    } catch {
      return "";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="topbar-icon-button relative inline-flex size-8 sm:size-10 items-center justify-center rounded-none text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={dictionary.common.notifications}
        aria-haspopup="menu"
        aria-expanded="false"
        title={dictionary.common.notifications}
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white ring-1 ring-[var(--topbar-bg,white)] leading-none select-none">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="glass-menu glass-topbar w-80 sm:w-96 rounded-lg border border-[var(--shell-topbar-border-color)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-3 border-b border-[var(--shell-topbar-border-color)] bg-black/10">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-[var(--shell-topbar-foreground)]">
            {dictionary.common.notifications} ({unreadCount})
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-[var(--brand-green,var(--nav-section-accent))] hover:underline flex items-center gap-1 font-medium transition-colors"
              type="button"
            >
              <Check className="size-3" />
              {dictionary.common.markAllAsRead}
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <ul className="max-h-[360px] overflow-y-auto divide-y divide-[var(--shell-topbar-border-color)]/30 custom-scrollbar" aria-label={dictionary.common.notificationsHistory}>
          {recentNotifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-8 text-center px-4">
              <BellOff className="size-8 text-[var(--shell-topbar-foreground-secondary)] mb-2 opacity-60" aria-hidden="true" />
              <p className="text-xs text-[var(--shell-topbar-foreground-secondary)] font-medium">
                {dictionary.common.noNotifications}
              </p>
            </li>
          ) : (
            recentNotifications.map((notification) => (
              <li 
                key={notification.id} 
                className={cn(
                  "list-none relative group transition-all duration-200 hover:bg-[var(--glass-control-hover)]",
                  !notification.read ? "bg-white/[0.03]" : "opacity-75"
                )}
              >
                <div className={cn("flex gap-3 pl-4 py-3 transition-all duration-200", !notification.read ? "pr-12" : "pr-4")}>
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.module, notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={cn(
                        "text-xs font-semibold truncate text-[var(--shell-topbar-foreground)]",
                        !notification.read && "font-bold"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] whitespace-nowrap text-[var(--shell-topbar-foreground-secondary)] shrink-0">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--shell-topbar-foreground-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {notification.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-wider uppercase",
                        getTypeBadgeStyles(notification.type)
                      )}>
                        {notification.type}
                      </span>
                      <span className="text-[9px] text-[var(--shell-topbar-foreground-secondary)] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-medium">
                        {notification.targetRole}
                      </span>
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity size-6 rounded-full bg-white/10 hover:bg-[var(--brand-green,var(--nav-section-accent))]/20 hover:text-[var(--brand-green,var(--nav-section-accent))] flex items-center justify-center text-white"
                      title={dictionary.common.markAsRead}
                      aria-label={dictionary.common.markAsRead}
                      type="button"
                    >
                      <Check className="size-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-[var(--shell-topbar-border-color)] bg-black/10">
          <Link
            href={`/${locale}/notifications` as any}
            className="flex w-full items-center justify-center gap-2 py-3 text-xs font-medium text-[var(--shell-topbar-foreground)] transition-colors hover:bg-[var(--glass-control-hover)] focus:bg-[var(--glass-control-hover)]"
          >
            <Eye className="size-3.5" />
            {dictionary.common.viewAllNotifications}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsPopover;
