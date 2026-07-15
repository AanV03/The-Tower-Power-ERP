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
  authType?: "oauth2" | "webhook";
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
  const { name, description, category, status, icon: Icon, authType = "oauth2" } = integration;

  const statusStyles = {
    connected: {
      dot: "bg-[var(--brand-green)]",
      badge: "border-[var(--brand-green)]/30 text-[var(--brand-green)] bg-[var(--brand-green)]/10",
      label: labels.connected,
    },
    inactive: {
      dot: "bg-[var(--text-muted)]",
      badge: "border-border bg-muted text-muted-foreground",
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
      className="flex flex-col justify-between border-border bg-card text-card-foreground shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md"
      role="region"
      aria-label={`${name} - ${currentStatus.label}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-background p-2 shadow-sm">
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
        <div className="mt-3">
          <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] text-muted-foreground">
            {authType === "oauth2" ? "Conexion segura" : "Envio automatico"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-border bg-background px-6 py-4">
        <Button
          onClick={() => onConfigure(integration)}
          variant={status === "connected" ? "outline" : "default"}
          size="sm"
          className={cn(
            "w-full text-xs font-medium transition-colors",
            status === "connected" 
              ? "border-border hover:bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {status === "connected"
            ? "Gestionar conexion"
            : authType === "oauth2"
              ? `Conectar con ${name.split(" ")[0]}`
              : labels.connect}
        </Button>
      </CardFooter>
    </Card>
  );
}
