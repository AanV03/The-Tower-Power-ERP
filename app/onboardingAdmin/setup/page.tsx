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
} from "@/app/onboardingAdmin/_components/onboarding-layout";
import { OnboardingNavButton } from "@/app/onboardingAdmin/_components/onboarding-nav-button";

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
  {
    title: "Membresias",
    description: "Estructura inicial para planes recurrentes y promociones.",
    icon: Ticket,
  },
  {
    title: "Metodos de pago",
    description: "Opciones base para efectivo, tarjeta y transferencias.",
    icon: CreditCard,
  },
];

export default function SetupPage() {
  return (
    <OnboardingLayout currentStep={3}>
      <OnboardingPanel
        title="Configuracion inicial"
        description="Estas configuraciones son una vista previa visual. Podras modificarlas posteriormente desde Configuracion."
        aside={<SetupAside />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {setupItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} size="sm" className="border-border">
                <CardContent className="flex items-start gap-4 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <Badge variant="secondary" className="rounded-md">
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
            href="/onboardingAdmin/gym-info"
            variant="outline"
          >
            Regresar
          </OnboardingNavButton>
          <OnboardingNavButton href="/onboardingAdmin/plans">
            Continuar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}

function SetupAside() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-4" aria-hidden="true" />
          Configuracion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Este paso prepara la estructura para conectar modulos como sucursales,
          membresias, pagos y horarios cuando exista backend.
        </p>
      </CardContent>
    </Card>
  );
}
