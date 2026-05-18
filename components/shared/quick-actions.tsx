"use client";

import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

export function QuickActions({
  primaryLabel,
  locale,
}: {
  primaryLabel: string;
  locale: Locale;
}) {
  const message =
    locale === "es"
      ? "Acción registrada en el prototipo frontend."
      : "Action registered in the frontend prototype.";

  const handlePrimaryAction = () => {
    try {
      toast.success(message);
    } catch (error) {
      console.error("[QUICK_ACTIONS_ERROR]", error);
      toast.error("Ocurrió un error al ejecutar la acción.");
    }
  };

  const handleRefresh = () => {
    try {
      toast.info(message);
    } catch (error) {
      console.error("[QUICK_ACTIONS_REFRESH_ERROR]", error);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2" role="group" aria-label="Acciones rápidas">
      <Button
        onClick={handlePrimaryAction}
        className="focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label={primaryLabel}
      >
        <Plus className="mr-2" aria-hidden="true" />
        {primaryLabel}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        aria-label={locale === "es" ? "Actualizar" : "Refresh"}
        title={locale === "es" ? "Actualizar" : "Refresh"}
        className="focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
