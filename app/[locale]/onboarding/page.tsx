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

        <div className="flex flex-wrap items-center gap-3 bg-black">
          <OnboardingNavButton href="/onboarding/welcome">
            Comenzar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}