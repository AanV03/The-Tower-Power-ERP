import { auditTrail } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuditFeed({ locale }: { locale: Locale }) {
  const title = locale === "es" ? "Bitácora segura" : "Secure audit trail";
  const description =
    locale === "es"
      ? "Traza de acciones críticas para RBAC y cumplimiento."
      : "Trace of critical actions for RBAC and compliance.";

  return (
    <Card className="min-h-[342px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {auditTrail.map((item) => {
          const Icon = item.icon;
          return (
            <div key={`${item.actor}-${item.meta}`} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.actor}</p>
                <p className="text-sm text-muted-foreground">{item.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
