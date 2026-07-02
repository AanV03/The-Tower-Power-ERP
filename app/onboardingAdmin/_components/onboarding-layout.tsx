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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Onboarding administrador
            </p>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Configuracion inicial de Gerpy
            </h1>
          </div>
          <Card className="w-full lg:w-auto" size="sm">
            <CardContent className="py-3">
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
                        "flex min-w-0 flex-col items-center gap-1 rounded-md px-2 py-2 text-center text-xs",
                        isActive && "bg-primary text-primary-foreground",
                        isComplete && "bg-accent text-accent-foreground",
                        !isActive && !isComplete && "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="hidden truncate sm:block">{step.label}</span>
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
      <Card className="shadow-panel">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              {title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
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
