import { CheckCircle2, ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { DashboardButton } from "../_components/dashboard-button";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

export default function FinishPage() {
  return (
    <OnboardingLayout currentStep={5}>
      <OnboardingPanel
        title="¡Todo listo!"
        description="Tu gimnasio ha sido configurado correctamente."
      >
        <div className="rounded-2xl border border-white/10 bg-background/55 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-(--brand-green)/10 text-(--brand-green)">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Configuracion completada
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton href="/onboarding/plans" variant="outline" direction="left">
            Regresar
          </OnboardingNavButton>
          <DashboardButton />
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}