"use client";

import { useParams, useRouter } from "next/navigation";
import { Building2, CheckCircle2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

const steps = [
  { label: "Info Gimnasio", href: "/onboarding/gym-info", icon: Building2 },
  { label: "Planes", href: "/onboarding/plans", icon: CreditCard },
];

export default function FinishPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const dashboardHref = `/${params?.locale ?? "es"}/dashboard`;

  return (
    <OnboardingLayout currentStep={2} steps={steps}>
      <OnboardingPanel
        title="¡Todo listo!"
        description="Tu gimnasio ha sido configurado correctamente."
      >
        <div className="rounded-2xl border border-white/10 bg-background/55 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Configuracion lista</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            El onboarding visual esta completo y listo para conectarse despues
            con persistencia real.
          </p>
        </div>

        <Card className="border-white/10 bg-background/55 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Esta pantalla no guarda datos en backend. El flujo se mantiene
              como validacion de frontend y navegacion.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton href="/onboarding/plans" variant="outline" direction="left">
            Regresar
          </OnboardingNavButton>
          <Button
            type="button"
            className="ml-auto bg-black text-white"
            onClick={() => {
              router.push(dashboardHref as any);
              router.refresh();
            }}
          >
            Ir al Dashboard
          </Button>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}
