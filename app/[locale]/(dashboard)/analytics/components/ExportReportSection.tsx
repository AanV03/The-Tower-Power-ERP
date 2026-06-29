"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import { ExportReportModal } from "./ExportReportModal";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ExportReportSection({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const dictionary = getDictionary(locale);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className={cn(headerPrimaryActionClass, "flex h-9 items-center gap-2 rounded-md px-4 text-sm")}
      >
        <FileDown className="w-4 h-4" aria-hidden="true" />
        <span>{dictionary.analytics.export.button}</span>
      </Button>
      
      <ExportReportModal locale={locale} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
