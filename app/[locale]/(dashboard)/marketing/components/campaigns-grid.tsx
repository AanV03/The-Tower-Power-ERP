"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Share2, Play, Pause, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type Campaign = {
  id: string;
  name: string;
  channel: "email" | "sms" | "social";
  status: "active" | "draft" | "scheduled" | "paused";
  sent: number;
  openRate: number;
  clickRate: number;
  conversion: number;
};

export function CampaignsGrid({
  translations,
}: {
  translations: {
    title: string;
    description: string;
    status: {
      active: string;
      draft: string;
      scheduled: string;
      paused: string;
    };
    metrics: {
      sent: string;
      openRate: string;
      clickRate: string;
      conversion: string;
    };
    actions: {
      pause: string;
      resume: string;
      viewDetails: string;
    };
  };
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Recordatorio de Renovación Anual",
      channel: "email",
      status: "active",
      sent: 2104,
      openRate: 68.2,
      clickRate: 24.5,
      conversion: 8.7,
    },
    {
      id: "2",
      name: "Promoción Suplementos Junio",
      channel: "sms",
      status: "scheduled",
      sent: 0,
      openRate: 0,
      clickRate: 0,
      conversion: 0,
    },
    {
      id: "3",
      name: "Campaña Churn Back (Inactivos 21d)",
      channel: "email",
      status: "active",
      sent: 412,
      openRate: 52.4,
      clickRate: 18.9,
      conversion: 6.2,
    },
    {
      id: "4",
      name: "Retargeting Facebook & Instagram",
      channel: "social",
      status: "paused",
      sent: 8430,
      openRate: 0, // Click-through impressions instead
      clickRate: 3.2,
      conversion: 1.8,
    },
  ]);

  const toggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === "active" ? "paused" : "active";
          toast.success(
            `Campaña "${c.name}" ${newStatus === "active" ? "activada" : "pausada"} con éxito.`
          );
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const getChannelIcon = (channel: Campaign["channel"]) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />;
      case "sms":
        return <MessageSquare className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />;
      case "social":
        return <Share2 className="w-4 h-4 text-sky-500" aria-hidden="true" />;
    }
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{translations.status.active}</Badge>;
      case "draft":
        return <Badge variant="outline">{translations.status.draft}</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{translations.status.scheduled}</Badge>;
      case "paused":
        return <Badge variant="destructive">{translations.status.paused}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>{translations.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-foreground/10 bg-[rgba(var(--glass-bg),0.01)] hover:border-foreground/20 transition-all shadow-xs"
          >
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-foreground/5">{getChannelIcon(campaign.channel)}</span>
                  <span className="font-semibold text-foreground line-clamp-1">{campaign.name}</span>
                </div>
                {getStatusBadge(campaign.status)}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-1 text-center py-2 bg-foreground/2 rounded-lg text-xs border border-foreground/5">
                <div>
                  <div className="text-muted-foreground">{translations.metrics.sent}</div>
                  <div className="font-mono font-medium text-foreground">{campaign.sent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{translations.metrics.openRate}</div>
                  <div className="font-mono font-medium text-foreground">
                    {campaign.channel === "social" ? "—" : `${campaign.openRate}%`}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{translations.metrics.clickRate}</div>
                  <div className="font-mono font-medium text-foreground">{campaign.clickRate}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{translations.metrics.conversion}</div>
                  <div className="font-mono font-medium text-foreground">{campaign.conversion}%</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-4">
              {(campaign.status === "active" || campaign.status === "paused") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(campaign.id)}
                  className="h-8 gap-1"
                >
                  {campaign.status === "active" ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{translations.actions.pause}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{translations.actions.resume}</span>
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 gap-1 hover:bg-foreground/5">
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{translations.actions.viewDetails}</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
