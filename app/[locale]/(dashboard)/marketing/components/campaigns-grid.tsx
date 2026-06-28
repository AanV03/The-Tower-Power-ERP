"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Share2, Play, Pause, BarChart3, TrendingUp } from "lucide-react";
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

// Simulated sparkline data per campaign
const SPARKLINES: Record<string, number[]> = {
  "1": [40, 65, 58, 72, 68, 80, 75, 90],
  "2": [0, 0, 0, 0, 0, 0, 0, 0],
  "3": [30, 45, 52, 48, 55, 50, 60, 64],
  "4": [20, 18, 22, 25, 21, 19, 23, 26],
};

const CHANNEL_STYLES: Record<Campaign["channel"], { icon: React.ReactNode; border: string; bg: string; label: string }> = {
  email: {
    icon: <Mail className="size-4" aria-hidden="true" />,
    border: "border-blue-500/30 hover:border-blue-500/60",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Email",
  },
  sms: {
    icon: <MessageSquare className="size-4" aria-hidden="true" />,
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "SMS",
  },
  social: {
    icon: <Share2 className="size-4" aria-hidden="true" />,
    border: "border-purple-500/30 hover:border-purple-500/60",
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: "Social",
  },
};

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  });
  return (
    <svg width="56" height="24" viewBox="0 0 100 100" preserveAspectRatio="none" className="opacity-70">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
      openRate: 0,
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

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {translations.status.active}
          </Badge>
        );
      case "draft":
        return <Badge variant="outline">{translations.status.draft}</Badge>;
      case "scheduled":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400">
            {translations.status.scheduled}
          </Badge>
        );
      case "paused":
        return <Badge variant="destructive">{translations.status.paused}</Badge>;
    }
  };

  const getSparklineColor = (channel: Campaign["channel"]) => {
    switch (channel) {
      case "email": return "#3b82f6";
      case "sms": return "#10b981";
      case "social": return "#a855f7";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>{translations.description}</CardDescription>
        </div>
        <TrendingUp className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((campaign) => {
          const channelStyle = CHANNEL_STYLES[campaign.channel];
          const sparkData = SPARKLINES[campaign.id] ?? [0];
          return (
            <div
              key={campaign.id}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 shadow-xs ${channelStyle.border} bg-card/50 hover:bg-card`}
            >
              {/* Header info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`p-1.5 rounded-lg ${channelStyle.bg} shrink-0`}>
                      {channelStyle.icon}
                    </span>
                    <span className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{campaign.name}</span>
                  </div>
                  <div className="shrink-0">{getStatusBadge(campaign.status)}</div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-1 text-center py-2 bg-muted/30 rounded-lg text-xs border border-border/40">
                  <div>
                    <div className="text-muted-foreground text-[10px]">{translations.metrics.sent}</div>
                    <div className="font-mono font-semibold text-foreground">{campaign.sent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">{translations.metrics.openRate}</div>
                    <div className="font-mono font-semibold text-foreground">
                      {campaign.channel === "social" ? "—" : `${campaign.openRate}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">{translations.metrics.clickRate}</div>
                    <div className="font-mono font-semibold text-foreground">{campaign.clickRate}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">{translations.metrics.conversion}</div>
                    <div className="font-mono font-semibold text-foreground">{campaign.conversion}%</div>
                  </div>
                </div>
              </div>

              {/* Actions + sparkline */}
              <div className="flex items-center justify-between gap-2 mt-3">
                <MiniSparkline data={sparkData} color={getSparklineColor(campaign.channel)} />
                <div className="flex items-center gap-1.5">
                  {(campaign.status === "active" || campaign.status === "paused") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(campaign.id)}
                      className="h-7 gap-1 text-xs"
                    >
                      {campaign.status === "active" ? (
                        <>
                          <Pause className="size-3" aria-hidden="true" />
                          {translations.actions.pause}
                        </>
                      ) : (
                        <>
                          <Play className="size-3" aria-hidden="true" />
                          {translations.actions.resume}
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs hover:bg-muted">
                    <BarChart3 className="size-3" aria-hidden="true" />
                    {translations.actions.viewDetails}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
