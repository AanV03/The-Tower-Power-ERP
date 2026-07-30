"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Crown,
  Rocket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { localizedPath } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

const plans = [
  {
    id: "basic",
    name: "Plan Basico",
    price: "$000 / mes",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    icon: Rocket,
    features: ["Sucursal inicial", "Gestion basica", "Reportes simples"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: "$000 / mes",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore.",
    icon: BadgeCheck,
    features: ["Multiples modulos", "Automatizaciones", "Reportes avanzados"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Plan Enterprise",
    price: "Precio placeholder",
    description: "Ut enim ad minim veniam, quis nostrud exercitation.",
    icon: Crown,
    features: ["Multi sucursal", "Soporte dedicado", "Configuracion avanzada"],
    highlighted: false,
  },
] as const;

type OnboardingStep = {
  label: string;
  href: string;
  icon: any;
};

const steps: OnboardingStep[] = [
  { label: "Info Gimnasio", href: "/onboarding/gym-info", icon: Building2 },
  { label: "Planes", href: "/onboarding/plans", icon: CreditCard },
];

type OnboardingPlanId = (typeof plans)[number]["id"];

export default function PlansPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<OnboardingPlanId | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<OnboardingPlanId | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [storedCardNumber, setStoredCardNumber] = useState("");
  const [formError, setFormError] = useState("");

  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? null;

  function openPlanDialog(planId: OnboardingPlanId) {
    const plan = plans.find((item) => item.id === planId) ?? null;

    if (!plan) {
      return;
    }

    setActivePlanId(plan.id);
    setCardNumber(selectedPlanId === plan.id ? storedCardNumber : "");
    setFormError("");
    setDialogOpen(true);
  }

  function handleSaveCard() {
    if (!activePlan) {
      return;
    }

    const normalizedCard = cardNumber.replace(/\D/g, "");

    if (normalizedCard.length < 12) {
      setFormError("Ingresa un numero de tarjeta valido.");
      return;
    }

    setSelectedPlanId(activePlan.id);
    setStoredCardNumber(normalizedCard);
    setDialogOpen(false);
    setFormError("");
  }

  const canContinue = Boolean(selectedPlanId);

  function handleContinue() {
    if (!canContinue) {
      return;
    }

    router.push(localizedPath(locale, "onboarding/finish"));
  }

  return (
    <OnboardingLayout currentStep={2} steps={steps}>
      <OnboardingPanel
        title="Planes"
        description="Elige un plan y captura temporalmente la tarjeta antes de finalizar el onboarding."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlanId === plan.id;

            return (
              <Card
                key={plan.name}
                size="sm"
                className={cn(
                  plan.highlighted
                    ? "border-orange-400/30 bg-orange-400/5 shadow-xl shadow-black/10"
                    : "border-white/10 bg-background/55 shadow-sm",
                  isSelected ? "ring-2 ring-emerald-400/40" : "",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-400">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {plan.highlighted ? (
                      <Badge className="rounded-full border border-orange-400/20 bg-orange-400/10 text-orange-400">
                        Popular
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-2xl font-black tracking-tight text-foreground">{plan.price}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    className="w-full"
                    variant={isSelected ? "secondary" : "default"}
                    onClick={() => openPlanDialog(plan.id)}
                  >
                    {isSelected ? "Plan seleccionado" : "Seleccionar Plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="overflow-hidden border-border bg-background p-0 text-foreground shadow-2xl ring-1 ring-border sm:max-w-lg">
            <DialogHeader className="border-b border-border bg-card px-6 py-5">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <CreditCard className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-1.5">
                  <DialogTitle className="text-xl font-semibold tracking-normal">
                    Datos de tarjeta
                  </DialogTitle>
                  <DialogDescription>
                    Guarda el numero de tarjeta como parte del onboarding antes de continuar.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 px-6 py-5">
              {activePlan ? (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Plan seleccionado
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {activePlan.name}
                      </p>
                    </div>
                    <p className="text-right font-mono text-sm font-semibold text-foreground">
                      {activePlan.price}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="card-number" className="text-sm font-semibold text-foreground">
                  Numero de tarjeta
                </label>
                <div className="relative">
                  <CreditCard
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(event) => {
                      setFormError("");
                      setCardNumber(event.target.value.replace(/[^\d\s-]/g, ""));
                    }}
                    className="h-12 border-border bg-card pl-9 font-mono text-base tracking-wide shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary/20"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                {formError ? <p className="text-xs text-destructive">{formError}</p> : null}
                <p className="text-xs leading-5 text-muted-foreground">
                  Este dato solo se conserva en memoria para validar el flujo visual.
                </p>
              </div>
            </div>

            <DialogFooter className="border-t border-border bg-card px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSaveCard}>
                Guardar tarjeta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnboardingNavButton href="/onboarding/gym-info" variant="outline" direction="left">
            Regresar
          </OnboardingNavButton>
          <Button
            type="button"
            className="ml-auto bg-black text-white"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continuar
          </Button>
        </div>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}
