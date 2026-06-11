import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export type IntegrationStatus = "connected" | "inactive" | "error";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  icon: LucideIcon;
}

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (integration: Integration) => void;
  labels: {
    connected: string;
    inactive: string;
    error: string;
    configure: string;
    connect: string;
  };
}

export function IntegrationCard({ integration, onConfigure, labels }: IntegrationCardProps) {
  const { name, description, category, status, icon: Icon } = integration;

  const statusStyles = {
    connected: {
      dot: "bg-[var(--brand-green)]",
      badge: "border-[var(--brand-green)]/30 text-[var(--brand-green)] bg-[var(--brand-green)]/10",
      label: labels.connected,
    },
    inactive: {
      dot: "bg-[var(--text-muted)]",
      badge: "border-border text-[var(--text-muted)] bg-muted/50",
      label: labels.inactive,
    },
    error: {
      dot: "bg-[var(--brand-red)]",
      badge: "border-[var(--brand-red)]/30 text-[var(--brand-red)] bg-[var(--brand-red)]/10",
      label: labels.error,
    },
  };

  const currentStatus = statusStyles[status];

  return (
    <Card 
      className="glass-effect flex flex-col justify-between hover:shadow-xs transition-shadow"
      role="region"
      aria-label={`${name} - ${currentStatus.label}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--glass-control-bg)] border border-[var(--sidebar-border-color)]">
            <Icon className="w-6 h-6 text-foreground" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold leading-none">{name}</CardTitle>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 block">
              {category}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("px-2 py-0.5 text-[10px] font-medium flex items-center gap-1.5", currentStatus.badge)}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", currentStatus.dot)} aria-hidden="true" />
          {currentStatus.label}
        </Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-4 border-t border-[var(--sidebar-border-color)] flex justify-end gap-2 bg-[var(--header-glass-bg)]/20">
        <Button
          onClick={() => onConfigure(integration)}
          variant={status === "connected" ? "outline" : "default"}
          size="sm"
          className={cn(
            "w-full text-xs font-medium transition-colors",
            status === "connected" 
              ? "border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)]" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {status === "connected" ? labels.configure : labels.connect}
        </Button>
      </CardFooter>
    </Card>
  );
}
