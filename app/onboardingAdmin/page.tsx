import { Building2, CheckCircle2, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "@/app/onboardingAdmin/_components/onboarding-layout";
import { OnboardingNavButton } from "@/app/onboardingAdmin/_components/onboarding-nav-button";

const previewItems = [
  "Datos principales del gimnasio",
  "Configuraciones iniciales",
  "Seleccion de plan",
];

export default function OnboardingAdminPage() {
  return (
    <OnboardingLayout currentStep={1}>
      <OnboardingPanel
        title="¡Bienvenido!"
        description="Vamos a configurar tu gimnasio antes de comenzar."
        aside={<WelcomeSummary />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {previewItems.map((item, index) => (
            <div
              key={item}
              className="rounded-md border border-border bg-muted/30 p-4"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <span className="text-sm font-semibold">{index + 1}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{item}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Este paso solo prepara la experiencia inicial del administrador.
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <OnboardingNavButton href="/onboardingAdmin/welcome">
            Comenzar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}

function WelcomeSummary() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Flujo guiado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Captura datos operativos basicos del gimnasio.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Revisa configuraciones iniciales modificables despues.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Finaliza y entra al Dashboard.
          </p>
        </div>
        <Badge variant="secondary" className="rounded-md">
          Sin APIs por ahora
        </Badge>
      </CardContent>
    </Card>
  );
}
