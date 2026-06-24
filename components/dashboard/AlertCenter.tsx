"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell, Check, X } from "lucide-react";

type AlertItem = {
  id: string;
  level: "critical" | "high" | "medium" | "low";
  title: string;
  body?: string;
  createdAt: string;
};

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/alerts?module=dashboard`).then(async (res) => {
      try {
        const data = await res.json();
        if (mounted) setAlerts(data?.items ?? []);
      } catch (e) {
        if (mounted) setAlerts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function acknowledge(id: string) {
    setAlerts((prev) => prev?.map((a) => (a.id === id ? { ...a, acknowledged: true } as any : a)) ?? null);
    await fetch(`/api/alerts/${id}/ack`, { method: "POST" }).catch(() => {});
    setAlerts((prev) => prev?.filter((a) => a.id !== id) ?? null);
  }

  async function dismiss(id: string) {
    setAlerts((prev) => prev?.filter((a) => a.id !== id) ?? null);
    await fetch(`/api/alerts/${id}/dismiss`, { method: "POST" }).catch(() => {});
  }

  return (
    <Card className="min-h-[220px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Alertas recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin w-4 h-4" /> Cargando alertas...
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay alertas recientes.</div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 p-2 rounded-md hover:bg-muted/5">
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  {a.body ? <div className="text-xs text-muted-foreground">{a.body}</div> : null}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => acknowledge(a.id)} aria-label="Acknowledge">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dismiss(a.id)} aria-label="Dismiss">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
