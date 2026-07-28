"use client";

import * as React from "react";
import { 
  CreditCard, 
  Megaphone, 
  MessageCircle, 
  Users, 
  Webhook, 
  Search, 
  RefreshCw, 
  Play, 
  Code,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton, CardGridSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { IntegrationCard, type Integration, type IntegrationStatus } from "./integration-card";
import { SetupStepperDialog } from "./setup-stepper-dialog";
import { JsonLogViewer } from "./json-log-viewer";

// Initial mock integrations
const INITIAL_INTEGRATIONS = [
  {
    id: "stripe",
    name: "Stripe Payments",
    description: "Procesa membresías, pagos únicos y maneja renovaciones de suscripción de forma segura.",
    category: "Pagos",
    status: "connected" as IntegrationStatus,
    icon: CreditCard,
    authType: "oauth2" as const,
  },
  {
    id: "twilio",
    name: "Twilio SMS",
    description: "Envío automatizado de mensajes SMS para avisos de cobranza y confirmaciones.",
    category: "Mensajería",
    status: "inactive" as IntegrationStatus,
    icon: Megaphone,
    authType: "oauth2" as const,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Envía recordatorios de acceso y PDFs de facturas a los miembros automáticamente.",
    category: "Notificaciones",
    status: "error" as IntegrationStatus,
    icon: MessageCircle,
    authType: "oauth2" as const,
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign CRM",
    description: "Sincroniza datos de miembros y automatiza campañas de retención y marketing.",
    category: "Marketing",
    status: "inactive" as IntegrationStatus,
    icon: Users,
    authType: "oauth2" as const,
  },
  {
    id: "custom_webhook",
    name: "Webhook Personalizado",
    description: "Transmite eventos del ERP en tiempo real a endpoints externos del cliente.",
    category: "Desarrollador",
    status: "connected" as IntegrationStatus,
    icon: Webhook,
    authType: "webhook" as const,
  },
];

// Initial mock logs
interface OutboxEvent {
  id: string;
  eventType: string;
  target: string;
  status: "success" | "pending" | "failed";
  time: string;
  payload: Record<string, any>;
}

const INITIAL_LOGS: OutboxEvent[] = [
  {
    id: "EV-9821",
    eventType: "payment.succeeded",
    target: "Stripe",
    status: "success",
    time: "2026-06-11 09:12:45",
    payload: {
      event: "payment.succeeded",
      id: "evt_1P83xK2eZvKYlo2C",
      created: 1781255565,
      data: {
        object: {
          id: "ch_3P83xK2eZvKYlo2C",
          amount: 180000,
          currency: "mxn",
          customer: "cus_P2u892hsnw",
          receipt_url: "https://stripe.com/receipt/acct_1032/ch_3P83xK2eZvKYlo2C",
        }
      }
    }
  },
  {
    id: "EV-9822",
    eventType: "member.created",
    target: "WhatsApp Cloud API",
    status: "failed",
    time: "2026-06-11 09:15:10",
    payload: {
      error: "Authentication Failed",
      code: 401,
      message: "The access token provided has expired or is invalid.",
      service: "whatsapp_cloud_api",
      timestamp: "2026-06-11T09:15:10.042Z",
      payload_attempted: {
        to: "+525543210987",
        type: "template",
        template: {
          name: "welcome_member",
          language: { code: "es" }
        }
      }
    }
  },
  {
    id: "EV-9823",
    eventType: "membership.paused",
    target: "Webhook Personalizado",
    status: "success",
    time: "2026-06-11 09:20:00",
    payload: {
      webhook_url: "https://my-gym-backend.com/api/webhooks",
      status_delivered: 200,
      response_time_ms: 142,
      data: {
        memberId: "mem_982bns8",
        pausedAt: "2026-06-11T09:20:00Z",
        resumeAt: "2026-07-11T00:00:00Z",
        reason: "Médico"
      }
    }
  },
  {
    id: "EV-9824",
    eventType: "class.booked",
    target: "ActiveCampaign CRM",
    status: "pending",
    time: "2026-06-11 09:22:15",
    payload: {
      queued_at: "2026-06-11T09:22:15.890Z",
      priority: "medium",
      attempts: 0,
      data: {
        contact: { email: "luis.meyer@gmail.com" },
        listId: 4,
        tags: ["Reservación Clase", "Spinning"]
      }
    }
  },
  {
    id: "EV-9825",
    eventType: "payment.failed",
    target: "Stripe",
    status: "success",
    time: "2026-06-11 09:25:30",
    payload: {
      event: "payment.failed",
      id: "evt_1P84xK2eZvKYlo2C",
      created: 1781256330,
      data: {
        object: {
          id: "ch_3P84xK2eZvKYlo2C",
          amount: 280000,
          currency: "mxn",
          failure_code: "card_declined",
          failure_message: "Your card was declined due to insufficient funds.",
        }
      }
    }
  }
];

interface IntegrationsConsoleProps {
  locale: string;
  dictionary: any;
}

export function IntegrationsConsole({ locale, dictionary }: IntegrationsConsoleProps) {
  const t = dictionary.integrations;

  // App state
  const [integrations, setIntegrations] = React.useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [logs, setLogs] = React.useState<OutboxEvent[]>(INITIAL_LOGS);
  
  const [activeTab, setActiveTab] = React.useState<"marketplace" | "console">("marketplace");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "connected" | "inactive" | "error">("all");
  const [isLoading, setIsLoading] = React.useState(false);
  const [retryingIds, setRetryingIds] = React.useState<Record<string, boolean>>({});

  // Modals state
  const [stepperOpen, setStepperOpen] = React.useState(false);
  const [activeIntegration, setActiveIntegration] = React.useState<Integration | null>(null);
  
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerTitle, setViewerTitle] = React.useState("");
  const [viewerPayload, setViewerPayload] = React.useState<Record<string, any> | null>(null);

  // Tab switching loader simulation
  const handleTabChange = (tab: "marketplace" | "console") => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Stepper save callback
  const handleSaveIntegration = (id: string, status: "connected") => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    toast.success(dictionary.quickActions.successMessage);
  };

  // Retry event callback
  const handleRetryEvent = (id: string) => {
    setRetryingIds((prev) => ({ ...prev, [id]: true }));
    
    // Simulate API webhook retry
    setTimeout(() => {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === id ? { ...log, status: "success" as const, time: "2026-06-11 09:30:15" } : log
        )
      );
      setRetryingIds((prev) => ({ ...prev, [id]: false }));
      
      // If we retried WhatsApp, let's fix the WhatsApp status too!
      const failedLog = logs.find((l) => l.id === id);
      if (failedLog && failedLog.target.toLowerCase().includes("whatsapp")) {
        setIntegrations((prev) =>
          prev.map((item) => (item.id === "whatsapp" ? { ...item, status: "connected" as const } : item))
        );
      }

      toast.success(t.outbox.retrySuccess);
    }, 1200);
  };

  // Configure trigger
  const handleConfigureClick = (integration: Integration) => {
    setActiveIntegration(integration);
    setStepperOpen(true);
  };

  // View JSON trigger
  const handleViewJsonClick = (log: OutboxEvent) => {
    setViewerTitle(`${t.outbox.payloadTitle} - ${log.id}`);
    setViewerPayload(log.payload);
    setViewerOpen(true);
  };

  // Derived metrics
  const activeConnections = integrations.filter((item) => item.status === "connected").length;
  const pendingOutbox = logs.filter((log) => log.status === "pending").length;
  const failedSyncs = logs.filter((log) => log.status === "failed").length;
  const totalLogs = logs.length;
  const successRate = totalLogs > 0 
    ? Math.round((logs.filter((log) => log.status === "success").length / totalLogs) * 100) 
    : 100;

  // Filtered lists
  const filteredIntegrations = integrations.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLogs = logs.filter((log) => {
    return log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Check if WhatsApp is still in error state to show critical banner
  const hasCriticalError = integrations.some((item) => item.id === "whatsapp" && item.status === "error");

  return (
    <div className="space-y-6">
      {/* Critical Sync Error Alert Banner */}
      {hasCriticalError && (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg bg-[rgba(var(--brand-red-rgb,166,7,19),0.06)] border border-[var(--brand-red)]/30 text-[var(--brand-red)] animate-fade-in"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold">{t.banner.errorTitle}</h3>
            <p className="text-xs mt-1 text-foreground/80 leading-relaxed">{t.banner.errorMessage}</p>
          </div>
        </div>
      )}

      {/* KPI Cards section */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4" aria-label={dictionary.common.metricsAriaLabel}>
        {/* Metric 1: Active connections */}
        <Card className="glass-effect">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t.metrics.activeConnections}
            </CardTitle>
            <Webhook className="w-4 h-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{activeConnections}</span>
              <span className="text-xs text-muted-foreground">/{integrations.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Pending Outbox */}
        <Card className="glass-effect">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t.metrics.pendingOutbox}
            </CardTitle>
            <Clock className="w-4 h-4 text-[var(--brand-yellow)]" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight">{pendingOutbox}</span>
          </CardContent>
        </Card>

        {/* Metric 3: Failed Syncs */}
        <Card className="glass-effect">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t.metrics.failedSyncs}
            </CardTitle>
            <XCircle className="w-4 h-4 text-[var(--brand-red)]" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <span className={cn("text-2xl font-bold tracking-tight", failedSyncs > 0 && "text-[var(--brand-red)]")}>
              {failedSyncs}
            </span>
          </CardContent>
        </Card>

        {/* Metric 4: Success Rate */}
        <Card className="glass-effect">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t.metrics.successRate}
            </CardTitle>
            <Activity className="w-4 h-4 text-[var(--brand-green)]" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tracking-tight text-[var(--brand-green)]">
              {successRate}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-[var(--sidebar-border-color)]">
        <button
          onClick={() => handleTabChange("marketplace")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-all focus-visible:outline-none",
            activeTab === "marketplace"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          aria-selected={activeTab === "marketplace"}
          role="tab"
        >
          {t.tabs.marketplace}
        </button>
        <button
          onClick={() => handleTabChange("console")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-all focus-visible:outline-none",
            activeTab === "console"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          aria-selected={activeTab === "console"}
          role="tab"
        >
          {t.tabs.console}
        </button>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        activeTab === "marketplace" ? (
          <CardGridSkeleton count={4} columns={3} />
        ) : (
          <TableSkeleton rows={4} columns={5} />
        )
      ) : (
        <div className="space-y-4">
          {/* Controls Bar (Search and Filters) */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[var(--header-glass-bg)]/20 p-3 rounded-lg border border-[var(--sidebar-border-color)]">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder={activeTab === "marketplace" ? t.searchPlaceholder : "Buscar log de evento..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {activeTab === "marketplace" && (
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" aria-hidden="true" />
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="xs"
                  onClick={() => setStatusFilter("all")}
                  className="text-[10px] h-7 px-2"
                >
                  {t.filterAll}
                </Button>
                <Button
                  variant={statusFilter === "connected" ? "default" : "outline"}
                  size="xs"
                  onClick={() => setStatusFilter("connected")}
                  className="text-[10px] h-7 px-2"
                >
                  {t.filterConnected}
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="xs"
                  onClick={() => setStatusFilter("inactive")}
                  className="text-[10px] h-7 px-2"
                >
                  {t.filterInactive}
                </Button>
                <Button
                  variant={statusFilter === "error" ? "default" : "outline"}
                  size="xs"
                  onClick={() => setStatusFilter("error")}
                  className="text-[10px] h-7 px-2"
                >
                  {t.filterError}
                </Button>
              </div>
            )}
          </div>

          {/* Tab 1: Marketplace Grid */}
          {activeTab === "marketplace" && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((item) => (
                <IntegrationCard
                  key={item.id}
                  integration={item}
                  onConfigure={handleConfigureClick}
                  labels={{
                    connected: t.card.connected,
                    inactive: t.card.inactive,
                    error: t.card.error,
                    configure: t.card.configure,
                    connect: t.card.connect,
                  }}
                />
              ))}
            </div>
          )}

          {/* Tab 2: Outbox logs table */}
          {activeTab === "console" && (
            <Card>
              <CardHeader>
                <CardTitle>{t.outbox.title}</CardTitle>
                <CardDescription>{t.outbox.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.outbox.eventId}</TableHead>
                        <TableHead>{t.outbox.eventType}</TableHead>
                        <TableHead>{t.outbox.target}</TableHead>
                        <TableHead>{t.outbox.status}</TableHead>
                        <TableHead>{t.outbox.time}</TableHead>
                        <TableHead className="text-right">{t.outbox.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {t.outbox.emptyState}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => {
                          const isRetrying = !!retryingIds[log.id];
                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-semibold font-mono text-foreground/80">{log.id}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-[10px] border-[var(--sidebar-border-color)] text-foreground">
                                  {log.eventType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{log.target}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 w-fit",
                                    log.status === "success" && "border-[var(--brand-green)]/30 text-[var(--brand-green)] bg-[var(--brand-green)]/10",
                                    log.status === "pending" && "border-[var(--brand-yellow)]/30 text-[var(--brand-yellow)] bg-[var(--brand-yellow)]/10",
                                    log.status === "failed" && "border-[var(--brand-red)]/30 text-[var(--brand-red)] bg-[var(--brand-red)]/10"
                                  )}
                                >
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    log.status === "success" && "bg-[var(--brand-green)]",
                                    log.status === "pending" && "bg-[var(--brand-yellow)] animate-pulse",
                                    log.status === "failed" && "bg-[var(--brand-red)]"
                                  )} />
                                  {log.status === "success" ? "Success" : log.status === "failed" ? "Failed" : "Pending"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground font-mono">{log.time}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {log.status === "failed" && (
                                    <Button
                                      onClick={() => handleRetryEvent(log.id)}
                                      disabled={isRetrying}
                                      variant="outline"
                                      size="xs"
                                      className="h-7 border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)] text-xs flex items-center gap-1"
                                    >
                                      <RefreshCw className={cn("w-3 h-3", isRetrying && "animate-spin")} />
                                      <span>{isRetrying ? t.outbox.retrying : t.outbox.retry}</span>
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleViewJsonClick(log)}
                                    variant="outline"
                                    size="xs"
                                    className="h-7 border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)] text-xs flex items-center gap-1"
                                  >
                                    <Code className="w-3 h-3 text-muted-foreground" />
                                    <span>{t.outbox.viewPayload}</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Connection setup stepper modal */}
      <SetupStepperDialog
        isOpen={stepperOpen}
        onClose={() => setStepperOpen(false)}
        integration={activeIntegration}
        onSave={handleSaveIntegration}
        labels={t.stepper}
      />

      {/* JSON and logs reader sheet modal */}
      <JsonLogViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerTitle}
        payload={viewerPayload}
        labels={{
          close: "Cerrar",
          payloadTitle: t.outbox.payloadTitle,
          payloadCopied: t.outbox.payloadCopied,
        }}
      />
    </div>
  );
}
