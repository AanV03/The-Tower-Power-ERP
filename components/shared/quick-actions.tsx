"use client";

import { Bell, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function QuickActions({
  primaryLabel,
  locale,
}: {
  primaryLabel: string;
  locale: "es" | "en";
}) {
  const message =
    locale === "es"
      ? "Acción registrada en el prototipo frontend."
      : "Action registered in the frontend prototype.";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => toast.success(message)}>
        <Plus aria-hidden="true" />
        {primaryLabel}
      </Button>
      <Button variant="outline" size="icon" onClick={() => toast.info(message)} aria-label="Refresh">
        <RefreshCw aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => toast.warning(message)} aria-label="Notifications">
        <Bell aria-hidden="true" />
      </Button>
    </div>
  );
}
