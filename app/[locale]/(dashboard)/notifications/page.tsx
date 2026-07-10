"use client";

import React, { useState, use } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  RotateCcw, 
  Search, 
  Filter, 
  AlertTriangle,
  Info,
  ShieldAlert,
  CreditCard,
  Key,
  Users,
  Settings,
  BellOff
} from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { useNotificationsMock, type MockNotification } from "@/hooks/use-notifications-mock";
import { cn } from "@/lib/utils";

export default function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const l = locale as Locale;
  const dict = getDictionary(l);

  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll, 
    resetMock 
  } = useNotificationsMock();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  // Get unique modules from notifications for filter options
  const modulesList = ["all", "finance", "access", "hr", "system", "admin"];

  // Filtered notifications
  const filteredNotifications = notifications.filter((notif) => {
    // Search query match
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.targetRole.toLowerCase().includes(searchQuery.toLowerCase());

    // Status match
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "unread" && !notif.read) ||
      (statusFilter === "read" && notif.read);

    // Priority match
    const matchesPriority = 
      priorityFilter === "all" || 
      notif.type === priorityFilter;

    // Module match
    const matchesModule = 
      moduleFilter === "all" || 
      notif.module === moduleFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesModule;
  });

  // Icon selector based on module
  const getModuleIcon = (module: MockNotification["module"], type: MockNotification["type"]) => {
    const iconClass = cn(
      "size-5 shrink-0",
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

  // Badge priority colors
  const getPriorityBadgeStyles = (type: MockNotification["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400 font-bold";
      case "warning":
        return "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400 font-bold";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400 font-bold";
    }
  };

  // Date formatter
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(l === "es" ? "es-MX" : l === "fr" ? "fr-FR" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 bg-background/30 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="size-7 text-[var(--nav-section-accent,var(--brand-green))] animate-pulse" aria-hidden="true" />
            {dict.common.notifications}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.common.notificationsHistory} (Simulación Frontend y Guía de Roles)
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={markAllAsRead}
            disabled={notifications.every((n) => n.read)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted transition-all disabled:opacity-50 text-foreground cursor-pointer"
            type="button"
          >
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            {dict.common.markAllAsRead}
          </button>
          
          <button
            onClick={resetMock}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-blue-600 dark:text-blue-400 cursor-pointer"
            title="Restablecer notificaciones por defecto"
            type="button"
          >
            <RotateCcw className="size-4" />
            Reiniciar Mock
          </button>

          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 transition-all text-red-600 dark:text-red-400 disabled:opacity-50 cursor-pointer"
            type="button"
          >
            <Trash2 className="size-4" />
            Limpiar todo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start flex-1">
        {/* Filters Panel */}
        <aside className="glass-panel p-5 rounded-xl border border-border flex flex-col gap-6 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,188,125,0.05),transparent_20rem)]" />
          
          <div className="relative space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Filter className="size-4 text-[var(--nav-section-accent,var(--brand-green))]" />
              <h2 className="font-semibold text-sm">Filtros de Búsqueda</h2>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label htmlFor="search-input" className="text-xs font-medium text-muted-foreground">Buscar texto o rol</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Ej. membresía, admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-black/10 border border-border/60 rounded-lg text-xs focus:outline-none focus:border-[var(--nav-section-accent,var(--brand-green))] text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5 flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Estado de lectura</span>
              <div className="grid grid-cols-3 gap-1 bg-black/10 p-1 rounded-lg border border-border/60">
                {(["all", "unread", "read"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "text-[10px] font-semibold py-1 rounded-md transition-all capitalize cursor-pointer",
                      statusFilter === status 
                        ? "bg-[var(--nav-section-accent,var(--brand-green))] text-black" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    type="button"
                  >
                    {status === "all" ? "Todas" : status === "unread" ? "No leídas" : "Leídas"}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-1.5">
              <label htmlFor="priority-filter" className="text-xs font-medium text-muted-foreground">Prioridad / Impacto</label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e: any) => setPriorityFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-black/10 border border-border/60 rounded-lg text-xs focus:outline-none focus:border-[var(--nav-section-accent,var(--brand-green))] text-foreground cursor-pointer"
              >
                <option value="all" className="bg-slate-900">Todas las prioridades</option>
                <option value="critical" className="bg-slate-900">Crítico</option>
                <option value="warning" className="bg-slate-900">Atención</option>
                <option value="info" className="bg-slate-900">Información</option>
              </select>
            </div>

            {/* Module Filter */}
            <div className="space-y-1.5">
              <label htmlFor="module-filter" className="text-xs font-medium text-muted-foreground">Módulo Origen</label>
              <select
                id="module-filter"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-black/10 border border-border/60 rounded-lg text-xs focus:outline-none focus:border-[var(--nav-section-accent,var(--brand-green))] text-foreground cursor-pointer"
              >
                <option value="all" className="bg-slate-900">Todos los módulos</option>
                <option value="finance" className="bg-slate-900">Finanzas (finance)</option>
                <option value="access" className="bg-slate-900">Accesos (access)</option>
                <option value="hr" className="bg-slate-900">RH (hr)</option>
                <option value="system" className="bg-slate-900">Sistema (system)</option>
                <option value="admin" className="bg-slate-900">Administrador (admin)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Notifications List */}
        <main className="glass-panel p-6 rounded-xl border border-border flex flex-col gap-4 flex-1 min-h-[450px] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,188,125,0.03),transparent_25rem)]" />
          
          <div className="relative space-y-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <h2 className="font-semibold text-sm">Historial de Notificaciones ({filteredNotifications.length})</h2>
              <span className="text-xs text-muted-foreground font-medium">Mostrando coincidencias</span>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
                <BellOff className="size-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">{dict.common.noNotifications}</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
                  Prueba cambiando los filtros de búsqueda o haz clic en &quot;Reiniciar Mock&quot; para volver a cargar las notificaciones simuladas.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[600px] pr-2 custom-scrollbar flex-1">
                <ul className="divide-y divide-border/60 space-y-2">
                  {filteredNotifications.map((notification) => (
                    <li 
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border border-border/40 transition-all duration-200 hover:bg-white/[0.02]",
                        !notification.read ? "bg-white/[0.03] border-border shadow-sm" : "opacity-80"
                      )}
                    >
                      <div className="mt-0.5 size-9 shrink-0 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                        {getModuleIcon(notification.module, notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h3 className={cn(
                              "text-sm flex items-center gap-2",
                              !notification.read 
                                ? "font-bold text-slate-900 dark:text-white" 
                                : "font-medium text-slate-700 dark:text-slate-300"
                            )}>
                              {notification.title}
                              {!notification.read && (
                                <span className="size-2 rounded-full bg-[var(--nav-section-accent,var(--brand-green))] inline-block animate-pulse" />
                              )}
                            </h3>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {formatDateTime(notification.createdAt)}
                            </span>
                          </div>
 
                          {/* Badges / Meta */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full border font-mono uppercase tracking-wider",
                              getPriorityBadgeStyles(notification.type)
                            )}>
                              {notification.type}
                            </span>
                            <span className="text-[9px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded-full">
                              Módulo: {notification.module}
                            </span>
                            <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                              Rol: {notification.targetRole}
                            </span>
                          </div>
                        </div>
 
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-4xl">
                          {notification.description}
                        </p>

                        {/* Row actions */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/60 justify-end">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--nav-section-accent,var(--brand-green))] hover:underline cursor-pointer"
                              type="button"
                            >
                              <Check className="size-3" />
                              Marcar como leída
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                            title="Eliminar notificación"
                            type="button"
                          >
                            <Trash2 className="size-3" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
