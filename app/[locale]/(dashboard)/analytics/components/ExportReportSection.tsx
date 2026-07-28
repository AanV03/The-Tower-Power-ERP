"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import { analyticsLabels } from "./config";
import { ExportReportModal } from "./ExportReportModal";
import type { Locale } from "@/lib/i18n";

export function ExportReportSection({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(headerPrimaryActionClass, "flex h-9 items-center gap-2 rounded-md px-4 text-sm")}
      >
        <FileDown className="size-4" aria-hidden="true" />
        <span>{analyticsLabels.actions.export}</span>
      </Button>

      <ExportReportModal
        labels={analyticsLabels}
        isOpen={isOpen}
        status="idle"
        onClose={() => setIsOpen(false)}
        onSubmit={(draft) => {
          setIsOpen(false);
          toast.success(analyticsLabels.export.success, {
            description: `${draft.format.toUpperCase()} / ${locale}`,
          });
        }}
      />
    </>
  );
}
