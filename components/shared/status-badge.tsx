import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n";

export function StatusBadge({
  status,
  locale,
}: {
  status: "active" | "warning" | "critical";
  locale: Locale;
}) {
  const map = {
    active: { label: { es: "Activo", en: "Active" }, variant: "secondary" as const },
    warning: { label: { es: "Atención", en: "Warning" }, variant: "default" as const },
    critical: { label: { es: "Crítico", en: "Critical" }, variant: "destructive" as const },
  };

  return <Badge variant={map[status].variant}>{map[status].label[locale]}</Badge>;
}
