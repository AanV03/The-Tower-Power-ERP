"use client";

import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn, headerPrimaryActionClass } from "@/lib/utils";

export function QuickActions({
  primaryLabel,
  locale,
}: {
  primaryLabel: string;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const message = dictionary.quickActions.successMessage;

  const handlePrimaryAction = () => {
    try {
      toast.success(message);
    } catch (error) {
      console.error("[QUICK_ACTIONS_ERROR]", error);
      toast.error(dictionary.quickActions.errorMessage);
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
    <div className="flex shrink-0 items-center gap-2" role="group" aria-label={dictionary.quickActions.groupLabel}>
      <Button
        onClick={handlePrimaryAction}
        className={cn(headerPrimaryActionClass, "focus-visible:ring-2 focus-visible:ring-offset-2")}
        aria-label={primaryLabel}
      >
        <Plus className="mr-2" aria-hidden="true" />
        {primaryLabel}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        aria-label={dictionary.common.refresh}
        title={dictionary.common.refresh}
        className="focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
