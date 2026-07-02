import { CheckCircle2, ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "@/app/onboardingAdmin/_components/onboarding-layout";
import { DashboardButton } from "@/app/onboardingAdmin/_components/dashboard-button";
import { OnboardingNavButton } from "@/app/onboardingAdmin/_components/onboarding-nav-button";

export default function FinishPage() {
  return (
    <OnboardingLayout currentStep={5}>
      <OnboardingPanel
        title="¡Todo listo!"
        description="Tu gimnasio ha sido configurado correctamente."
        aside={<FinishAside />}
      >
        <div className="rounded-md border border-border bg-muted/30 p-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Configuracion completada
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            El flujo visual del onboarding esta listo para conectarse mas
            adelante con el Signup, persistencia y servicios de configuracion.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton href="/onboardingAdmin/plans" variant="outline">
            Regresar
          </OnboardingNavButton>
          <DashboardButton />
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}

function FinishAside() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="size-4" aria-hidden="true" />
          Resumen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className="rounded-md">
          Gimnasio preparado
        </Badge>
        <Badge variant="secondary" className="rounded-md">
          Configuracion revisada
        </Badge>
        <Badge variant="secondary" className="rounded-md">
          Plan seleccionado
        </Badge>
      </CardContent>
    </Card>
  );
}
