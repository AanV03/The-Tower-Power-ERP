"use client";

import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";

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
        className="bg-amber-500 font-bold text-black hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-offset-2"
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
        className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
