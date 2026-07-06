import { Building2, Clock3, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

const fields = [
  {
    id: "gym-name",
    label: "Nombre del gimnasio",
    placeholder: "Gerpy Fitness Center",
    icon: Building2,
  },
  {
    id: "gym-address",
    label: "Direccion",
    placeholder: "Av. Principal 123",
    icon: MapPin,
  },
  {
    id: "gym-phone",
    label: "Telefono",
    placeholder: "55 0000 0000",
    icon: Phone,
  },
  {
    id: "opening-time",
    label: "Horario de apertura",
    placeholder: "06:00",
    icon: Clock3,
  },
  {
    id: "closing-time",
    label: "Horario de cierre",
    placeholder: "22:00",
    icon: Clock3,
  },
];

export default function GymInfoPage() {
  return (
    <OnboardingLayout currentStep={2}>
      <OnboardingPanel
        title="Informacion del gimnasio"
        description="Captura los datos principales de operacion."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const Icon = field.icon;

            return (
              <div key={field.id} className="space-y-2">
                <label
                  htmlFor={field.id}
                  className="text-sm font-semibold text-foreground"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <Icon
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id={field.id}
                    className="h-12 border-white/10 bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70"
                    placeholder={field.placeholder}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton
            href="/onboarding/welcome"
            direction="left"
            variant="outline"
          >
            Regresar
          </OnboardingNavButton>
          <OnboardingNavButton href="/onboarding/setup" className="ml-auto bg-black">
            Continuar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}