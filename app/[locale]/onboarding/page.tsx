import { Building2, CheckCircle2, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../onboarding/_components/onboarding-layout";
import { OnboardingNavButton } from "../onboarding/_components/onboarding-nav-button";

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
              className="rounded-2xl border border-white/10 bg-background/55 p-4 shadow-sm"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{item}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Este paso solo prepara la experiencia inicial del administrador.
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <OnboardingNavButton href="/onboarding/welcome">
            Comenzar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}

function WelcomeSummary() {
  return (
    <Card size="sm" className="border-white/10 bg-card/90 shadow-xl shadow-black/10 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4 text-[var(--brand-orange)]" aria-hidden="true" />
          Flujo guiado
        </CardTitle>
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
        <Badge variant="secondary" className="rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          Sin APIs por ahora
        </Badge>
      </CardContent>
    </Card>
  );
}
