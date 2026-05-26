import { Badge } from "@/components/ui/badge";
import { getDictionary, type Locale } from "@/lib/i18n";

export function StatusBadge({
  status,
  locale,
}: {
  status: "active" | "warning" | "critical";
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const map = {
    active: { label: dictionary.common.active, description: dictionary.status.activeDescription, variant: "secondary" as const },
    warning: { label: dictionary.common.warning, description: dictionary.status.warningDescription, variant: "default" as const },
    critical: { label: dictionary.common.critical, description: dictionary.status.criticalDescription, variant: "destructive" as const },
  };

  const label = map[status].label;

  return (
    <Badge
      variant={map[status].variant}
      aria-label={map[status].description}
      role="status"
    >
      {label}
    </Badge>
  );
}
