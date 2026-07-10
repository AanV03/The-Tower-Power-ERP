import { Building2, CheckCircle2, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../onboarding/_components/onboarding-layout";
import { OnboardingNavButton } from "../onboarding/_components/onboarding-nav-button";

const previewItems = [
  "Nombre del gimnasio, CURP y RFC",
  "Seleccion de plan",
  "Numero de tarjeta temporal",
];

export default function OnboardingAdminPage() {
  return (
    <OnboardingLayout currentStep={1}>
      <OnboardingPanel
        title="¡Bienvenido!"
        description="Vamos a configurar tu gimnasio antes de comenzar."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {previewItems.map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-background/55 p-4 shadow-sm"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-400">
                {index === 0 ? <Building2 className="size-4" aria-hidden="true" /> : index === 1 ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <CreditCard className="size-4" aria-hidden="true" />}
              </div>
              <p className="text-sm font-semibold text-foreground">{item}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Este recorrido prepara los datos necesarios antes de entrar al dashboard.
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-black">
          <OnboardingNavButton href="/onboarding/welcome">
            Comenzar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}