import { Dumbbell, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

export default function WelcomePage() {
  return (
    <OnboardingLayout currentStep={1}>
      <OnboardingPanel
        title="¡Bienvenido!"
        description="Vamos a configurar tu gimnasio antes de comenzar."
      >
        <div className="rounded-md border border-border bg-muted/30 p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Dumbbell className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Prepararemos tu espacio de administracion
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Este recorrido te ayudara a validar la configuracion inicial sin
                guardar informacion todavia. Mas adelante se conectara con el
                registro exitoso del administrador.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-black">
          <OnboardingNavButton href="/onboarding/gym-info">
            Comenzar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}