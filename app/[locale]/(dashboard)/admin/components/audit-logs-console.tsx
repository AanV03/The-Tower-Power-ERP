"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Trash2, Play, Pause, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  tenant: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "1",
    timestamp: "17:20:12",
    tenant: "fitlab-pro",
    level: "INFO",
    message: "OutboxEvent: subscription.renewed (ID: evt_92k18a)",
  },
  {
    id: "2",
    timestamp: "17:20:45",
    tenant: "urban-gym",
    level: "INFO",
    message: "AccessTelemetry: QR Code scanned in Entrance Turnstile",
  },
  {
    id: "3",
    timestamp: "17:21:02",
    tenant: "gerpy-hq",
    level: "WARN",
    message: "SaasPlan limit warning: CPU consumption at 82%",
  },
  {
    id: "4",
    timestamp: "17:22:15",
    tenant: "fitlab-pro",
    level: "INFO",
    message: "AuditLog: User 'manager_1' updated branding color 'sidebarBg'",
  },
  {
    id: "5",
    timestamp: "17:23:44",
    tenant: "urban-gym",
    level: "ERROR",
    message: "POS Payment failure: gateway declined transaction (Card ending 4242)",
  },
];

const LOG_MESSAGES = [
  { level: "INFO", tenant: "fitlab-pro", message: "OutboxEvent processed: invoice.created (ID: inv_87a19c)" },
  { level: "INFO", tenant: "urban-gym", message: "AccessTelemetry: Member entrance validated (ID: mem_00192)" },
  { level: "WARN", tenant: "gerpy-hq", message: "Database connection pool reached 85% capacity" },
  { level: "INFO", tenant: "fitlab-pro", message: "OutboxEvent dispatched to webhook endpoint: https://api.fitlab.pro/webhooks" },
  { level: "ERROR", tenant: "urban-gym", message: "AccessTelemetry: Hardware device disconnected (Turnstile 2)" },
  { level: "INFO", tenant: "gerpy-hq", message: "Cleaned up 12 expired user sessions from Redis cache" },
  { level: "INFO", tenant: "fitlab-pro", message: "TenantBrandingConfig re-hydrated from MongoDB" },
  { level: "WARN", tenant: "urban-gym", message: "Slow query detected on MembershipPlan updates: 124ms" },
];

export function AuditLogsConsole({ dict }: { dict: any }) {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isPaused, setIsPaused] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when logs are added
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Simulate incoming logs
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const randomMsg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const newLog: LogEntry = {
        id: Math.random().toString(),
        timestamp: timeStr,
        tenant: randomMsg.tenant,
        level: randomMsg.level as "INFO" | "WARN" | "ERROR",
        message: randomMsg.message,
      };

      setLogs((prev) => [...prev.slice(-49), newLog]); // Keep last 50
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleClear = () => {
    setLogs([]);
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "ERROR":
        return "text-red-500 font-bold dark:text-red-400";
      case "WARN":
        return "text-amber-500 font-bold dark:text-amber-400";
      case "INFO":
        return "text-blue-500 dark:text-blue-400";
    }
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "ERROR":
        return <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      case "WARN":
        return <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      case "INFO":
        return <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-[var(--sidebar-accent-active)] animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-card-foreground">
              {dict.adminSaas.consoleTitle}
            </h2>
            <p className="text-xs text-muted-foreground">
              {dict.adminSaas.consoleDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play Button */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 rounded-lg border border-input bg-background/80 hover:bg-muted px-2.5 py-1.5 text-xs font-semibold transition-all"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 text-emerald-500" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-amber-500" />
                Pause
              </>
            )}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-input bg-background/80 hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-500 transition-all"
          >
            <Trash2 className="h-3 w-3" />
            {dict.adminSaas.clearLogs}
          </button>
        </div>
      </div>

      {/* Terminal logs list */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-zinc-950 text-zinc-200 selection:bg-zinc-800 selection:text-white space-y-2.5">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 border-b border-zinc-900/60 pb-1.5 hover:bg-zinc-900/30 px-1 rounded transition-colors duration-150">
              <span className="text-zinc-500 shrink-0 select-none">{log.timestamp}</span>
              <span className="text-emerald-500 shrink-0 font-bold">[{log.tenant}]</span>
              <span className={cn("shrink-0 uppercase font-semibold text-[10px] px-1 rounded bg-zinc-900/80 border border-zinc-800", getLevelColor(log.level))}>
                {log.level}
              </span>
              <span className="text-zinc-300 break-all">{log.message}</span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500">
            <span className="animate-pulse">_ Awaiting system events...</span>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}
