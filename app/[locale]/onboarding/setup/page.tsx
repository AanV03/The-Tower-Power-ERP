import {
  Building2,
  CalendarClock,
  CreditCard,
  Settings,
  Ticket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

const setupItems = [
  {
    title: "Sucursal principal",
    description: "Base operativa inicial para administrar ventas y asistencia.",
    icon: Building2,
  },
  {
    title: "Horarios",
    description: "Plantilla visual para turnos, apertura y cierre del gimnasio.",
    icon: CalendarClock,
  },
];

export default function SetupPage() {
  return (
    <OnboardingLayout currentStep={3}>
      <OnboardingPanel
        title="Configuracion inicial"
        description="Estas configuraciones son una vista previa visual. Podras modificarlas posteriormente desde Configuracion."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {setupItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} size="sm" className="border-white/10 bg-background/55 shadow-sm">
                <CardContent className="flex items-start gap-4 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <Badge variant="secondary" className="rounded-full border border-white/10 bg-muted/60 text-muted-foreground">
                        Visual
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton
            href="/onboarding/gym-info"
            direction="left"
            variant="outline"
          >
            Regresar
          </OnboardingNavButton>
          <OnboardingNavButton href="/onboarding/plans" className="ml-auto bg-black">
            Continuar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}