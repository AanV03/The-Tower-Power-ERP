import { auditTrail } from "@/data/navigation";
import type { Locale } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditFeedSkeleton } from "@/components/skeletons";
import { NoDataEmpty } from "@/components/empty-state";

export function AuditFeed({
  locale,
  isLoading = false,
}: {
  locale: Locale;
  isLoading?: boolean;
}) {
  const labels = {
    es: {
      title: "Bitácora segura",
      description: "Traza de acciones críticas para RBAC y cumplimiento.",
      noData: "Sin eventos de auditoría",
      noDataDesc: "No hay actividades registradas.",
    },
    en: {
      title: "Secure audit trail",
      description: "Trace of critical actions for RBAC and compliance.",
      noData: "No audit events",
      noDataDesc: "No activities have been recorded.",
    },
    fr: {
      title: "Piste d'audit sécurisée",
      description: "Trace des actions critiques pour RBAC et conformité.",
      noData: "Pas d'événements d'audit",
      noDataDesc: "Aucune activité n'a été enregistrée.",
    },
  }[locale];

  if (isLoading) {
    return (
      <Card className="min-h-[342px]">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditFeedSkeleton items={4} />
        </CardContent>
      </Card>
    );
  }

  if (!auditTrail || auditTrail.length === 0) {
    return (
      <Card className="min-h-[342px]">
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataEmpty title={labels.noData} description={labels.noDataDesc} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[342px]">
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4" aria-label="Eventos de auditoría">
          {auditTrail.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={`${item.actor}-${item.meta}-${idx}`}
                className="flex gap-3 focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-2"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.actor}</p>
                  <p className="text-sm text-muted-foreground">{item.action}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
