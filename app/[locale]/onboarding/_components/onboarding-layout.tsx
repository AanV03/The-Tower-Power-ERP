import type { ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Dumbbell,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Bienvenida", icon: Dumbbell },
  { label: "Gimnasio", icon: Building2 },
  { label: "Configuracion", icon: ClipboardList },
  { label: "Plan", icon: CreditCard },
  { label: "Finalizar", icon: CheckCircle2 },
];

export function OnboardingLayout({
  currentStep,
  children,
}: {
  currentStep: number;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,133,0,0.16),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(0,188,125,0.14),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)] shadow-sm backdrop-blur">
              Onboarding administrador
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Configuracion inicial de Gerpy
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Un flujo visual alineado al ERP para preparar el gimnasio antes de entrar al dashboard.
              </p>
            </div>
          </div>
          <Card className="w-full border-white/10 bg-card/85 shadow-2xl shadow-black/10 backdrop-blur lg:w-auto" size="sm">
            <CardContent className="py-4">
              <ol className="grid grid-cols-5 gap-2" aria-label="Progreso del onboarding">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isComplete = stepNumber < currentStep;

                  return (
                    <li
                      key={step.label}
                      className={cn(
                        "flex min-w-0 flex-col items-center gap-1 rounded-xl border px-2 py-2 text-center text-xs transition-colors",
                        isActive && "border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]",
                        isComplete && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                        !isActive && !isComplete && "border-border bg-background/50 text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="hidden truncate font-medium sm:block">{step.label}</span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </header>

        {children}
      </div>
    </main>
  );
}

export function OnboardingPanel({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <Card className="overflow-hidden border-white/10 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur">
        <div className="h-1 bg-[linear-gradient(90deg,var(--brand-orange),var(--brand-green))]" />
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Paso guiado
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
          </div>
          {children}
        </CardContent>
      </Card>

      {aside ? (
        <aside className="lg:sticky lg:top-8">{aside}</aside>
      ) : null}
    </section>
  );
}
