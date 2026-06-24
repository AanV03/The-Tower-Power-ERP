"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportReportModal } from "./ExportReportModal";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ExportReportSection({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const dictionary = getDictionary(locale);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90 transition-all font-semibold flex items-center gap-2 h-9 text-sm rounded-md shadow-xs px-4"
      >
        <FileDown className="w-4 h-4" aria-hidden="true" />
        <span>{dictionary.analytics.export.button}</span>
      </Button>
      
      <ExportReportModal locale={locale} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
