"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { CheckCircle2, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { localizedPath } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";

type OnboardingStep = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function OnboardingLayout({
  currentStep,
  children,
  steps,
}: {
  currentStep: number;
  children: ReactNode;
  steps?: OnboardingStep[];
}) {
  const { locale } = useParams<{ locale: string }>();
  const totalSteps = steps?.length ?? 0;

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,133,0,0.16),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(0,188,125,0.14),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        {steps?.length ? (
          <nav aria-label="Progreso de onboarding" className="grid gap-3 sm:grid-cols-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const active = currentStep === index + 1;
              const completed = currentStep > index + 1;
              const activeStyle = active
                ? {
                  borderColor: "rgba(251, 146, 60, 0.3)",
                  backgroundColor: "rgba(251, 146, 60, 0.1)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                }
                : undefined;
              const stepBadgeStyle = active
                ? {
                  borderColor: "rgba(251, 146, 60, 0.3)",
                  backgroundColor: "rgba(251, 146, 60, 0.15)",
                  color: "rgb(251, 146, 60)",
                }
                : completed
                  ? {
                    borderColor: "rgba(74, 222, 128, 0.3)",
                    backgroundColor: "rgba(74, 222, 128, 0.1)",
                    color: "rgb(74, 222, 128)",
                  }
                  : undefined;

              return (
                <Link
                  key={step.label}
                  href={localizedPath(locale, step.href)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "group rounded-2xl border p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                    active ? "border-transparent bg-transparent" : "border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/80",
                  )}
                  style={activeStyle}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl border text-sm font-black transition-colors",
                        "border-white/10 bg-background/60 text-muted-foreground",
                      )}
                      style={stepBadgeStyle}
                    >
                      {completed ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
                    </span>
                    <StepIcon
                      className="size-4 text-muted-foreground transition-colors"
                      style={active ? { color: "rgb(251, 146, 60)" } : undefined}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {active ? "Paso actual" : completed ? "Paso completado" : "Paso pendiente"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        ) : null}

        {totalSteps ? (
          <div className="rounded-full border border-white/10 bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            Paso {currentStep} de {totalSteps}
          </div>
        ) : null}

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
