import { BadgeCheck, BriefcaseBusiness, Crown, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "@/app/onboardingAdmin/_components/onboarding-layout";
import { OnboardingNavButton } from "@/app/onboardingAdmin/_components/onboarding-nav-button";
import { PlanSelectButton } from "@/app/onboardingAdmin/_components/plan-select-button";

const plans = [
  {
    name: "Plan Basico",
    price: "$000 / mes",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: Rocket,
    features: ["Sucursal inicial", "Gestion basica", "Reportes simples"],
  },
  {
    name: "Plan Pro",
    price: "$000 / mes",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore.",
    icon: BadgeCheck,
    features: ["Multiples modulos", "Automatizaciones", "Reportes avanzados"],
    highlighted: true,
  },
  {
    name: "Plan Enterprise",
    price: "Precio placeholder",
    description: "Ut enim ad minim veniam, quis nostrud exercitation.",
    icon: Crown,
    features: ["Multi sucursal", "Soporte dedicado", "Configuracion avanzada"],
  },
];

export default function PlansPage() {
  return (
    <OnboardingLayout currentStep={4}>
      <OnboardingPanel
        title="Seleccion de plan"
        description="Elige una opcion para continuar. Esta pantalla no implementa pago ni validaciones de facturacion."
        aside={<PlansAside />}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <Card
                key={plan.name}
                size="sm"
                className={plan.highlighted ? "border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/5 shadow-xl shadow-black/10" : "border-white/10 bg-background/55 shadow-sm"}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {plan.highlighted ? (
                      <Badge className="rounded-full border border-[var(--brand-orange)]/20 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">Popular</Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-2xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <PlanSelectButton />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton href="/onboardingAdmin/setup" variant="outline" direction="left">
            Regresar
          </OnboardingNavButton>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}

function PlansAside() {
  return (
    <Card size="sm" className="border-white/10 bg-card/90 shadow-xl shadow-black/10 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BriefcaseBusiness className="size-4 text-[var(--brand-orange)]" aria-hidden="true" />
          Sin pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Todos los botones avanzan al cierre del onboarding para validar el
          flujo de usuario antes de integrar billing.
        </p>
      </CardContent>
    </Card>
  );
}
