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
        <div className="rounded-2xl border border-white/10 bg-background/55 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-(--brand-green)/10 text-(--brand-green)">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Configuracion completada
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            El flujo visual del onboarding esta listo para conectarse mas
            adelante con el Signup, persistencia y servicios de configuracion.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton href="/onboardingAdmin/plans" variant="outline" direction="left">
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
    <Card size="sm" className="border-white/10 bg-card/90 shadow-xl shadow-black/10 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="size-4 text-(--brand-orange)" aria-hidden="true" />
          Resumen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className="rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          Gimnasio preparado
        </Badge>
        <Badge variant="secondary" className="rounded-full border border-white/10 bg-muted/60 text-muted-foreground">
          Configuracion revisada
        </Badge>
        <Badge variant="secondary" className="rounded-full border border-(--brand-orange)/20 bg-(--brand-orange)/10 text-(--brand-orange)">
          Plan seleccionado
        </Badge>
      </CardContent>
    </Card>
  );
}
