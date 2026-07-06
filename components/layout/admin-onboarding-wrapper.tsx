"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Crown,
  Dumbbell,
  MapPin,
  Phone,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COMPLETION_COOKIE = "gerpy_admin_onboarding_complete";

type OnboardingStep = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  content: ReactNode;
};

const previewItems = [
  "Datos principales del gimnasio",
  "Configuraciones iniciales",
  "Seleccion de plan",
];

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
] as const;

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    eyebrow: "Paso 1 de 5",
    title: "Bienvenido",
    description: "Te guiamos por la configuracion inicial antes de entrar al dashboard.",
    content: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-background/55 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--brand-orange)/10 text-(--brand-orange)">
              <Dumbbell className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Prepararemos tu espacio de administracion
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Este recorrido valida la configuracion inicial sin salir del
                estado de bloqueo visual.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {previewItems.map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-border bg-background/55 p-4 shadow-sm"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-(--brand-orange)/10 text-(--brand-orange)">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{item}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Este paso solo prepara la experiencia inicial del administrador.
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "gym-info",
    eyebrow: "Paso 2 de 5",
    title: "Informacion del gimnasio",
    description: "Captura los datos principales de operacion.",
    content: (
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const Icon = field.icon;

          return (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-semibold text-foreground">
                {field.label}
              </label>
              <div className="relative">
                <Icon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id={field.id}
                  className="h-12 border-border bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70"
                  placeholder={field.placeholder}
                />
              </div>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    id: "setup",
    eyebrow: "Paso 3 de 5",
    title: "Configuracion inicial",
    description: "Estas configuraciones son una vista previa visual. Podras modificarlas luego.",
    content: (
      <div className="grid gap-4 md:grid-cols-2">
        {setupItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} size="sm" className="border-border bg-background/55 shadow-sm">
              <CardContent className="flex items-start gap-4 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--brand-green)/10 text-(--brand-green)">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <Badge variant="secondary" className="rounded-full border border-border bg-muted/60 text-muted-foreground">
                      Visual
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    ),
  },
  {
    id: "plans",
    eyebrow: "Paso 4 de 5",
    title: "Seleccion de plan",
    description: "Elige una opcion para continuar.",
    content: (
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <Card
              key={plan.name}
              size="sm"
              className={cn(
                plan.highlighted
                  ? "border-(--brand-orange)/30 bg-(--brand-orange)/5 shadow-xl shadow-black/10"
                  : "border-border bg-background/55 shadow-sm",
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-(--brand-orange)/10 text-(--brand-orange)">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {plan.highlighted ? (
                    <Badge className="rounded-full border border-(--brand-orange)/20 bg-(--brand-orange)/10 text-(--brand-orange)">
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
                      <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    ),
  },
  {
    id: "finish",
    eyebrow: "Paso 5 de 5",
    title: "Todo listo",
    description: "Tu gimnasio ha sido configurado correctamente.",
    content: (
      <div className="rounded-2xl border border-border bg-background/55 p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-(--brand-green)/10 text-(--brand-green)">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Configuracion completada</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Al terminar, el wrapper puede cerrar el bloqueo y refrescar el dashboard para mostrar el estado real de la app.
        </p>
      </div>
    ),
  },
];

type OnboardingWrapperProps = {
  open: boolean;
  currentStep: number;
  serverIdentity?: Record<string, unknown> | null;
  onStepChange: (step: number) => void;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
};

export function AdminOnboardingWrapper({
  open,
  currentStep,
  serverIdentity,
  onStepChange,
  onBack,
  onNext,
  onComplete,
}: OnboardingWrapperProps) {
  const activeStep = steps[currentStep] ?? steps[0];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-background/80 px-4 py-4 text-foreground backdrop-blur-lg transition-all duration-300",
        "motion-safe:animate-in motion-safe:fade-in-0",
      )}
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-onboarding-title"
      aria-describedby="admin-onboarding-description"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_10%,rgba(251,133,0,0.16),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(0,188,125,0.14),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />

      <div className="relative flex h-dvh w-full max-w-6xl items-center justify-center md:h-auto">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-none border border-border bg-card text-card-foreground shadow-2xl md:h-[min(90vh,56rem)] md:rounded-2xl">
          <div className="h-1 bg-[linear-gradient(90deg,var(--brand-orange),var(--brand-green))]" />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-border bg-muted/30 p-5 lg:border-b-0 lg:border-r">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Paso guiado
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  El dashboard queda bloqueado mientras terminas la configuracion.
                </p>
              </div>

              <nav className="mt-5 space-y-2">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                        isActive
                          ? "border-(--brand-orange)/30 bg-(--brand-orange)/10 shadow-sm"
                          : "border-border bg-background/50 hover:bg-muted/70",
                      )}
                      onClick={() => {
                        if (isCompleted || isActive) {
                          onStepChange(index);
                        }
                      }}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                          isActive
                            ? "bg-(--brand-orange) text-white"
                            : isCompleted
                              ? "bg-(--brand-green)/10 text-(--brand-green)"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 space-y-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {step.title}
                        </span>
                        <span className="block text-xs leading-5 text-muted-foreground">
                          {step.eyebrow}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="flex min-h-0 flex-col">
              <header className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {activeStep.eyebrow}
                    </p>
                    <h2
                      id="admin-onboarding-title"
                      className="text-2xl font-black tracking-tight text-foreground sm:text-3xl"
                    >
                      {activeStep.title}
                    </h2>
                    <p
                      id="admin-onboarding-description"
                      className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base"
                    >
                      {activeStep.description}
                    </p>
                  </div>
                  <div className="hidden rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
                    {currentStep + 1} / {steps.length}
                  </div>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                {activeStep.content}
              </div>

              <footer className="border-t border-border bg-background/70 px-5 py-4 backdrop-blur sm:px-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft aria-hidden="true" />
                    Regresar
                  </Button>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onComplete}
                      className={cn(currentStep === steps.length - 1 && "hidden")}
                    >
                      Omitir y salir
                    </Button>

                    {currentStep < steps.length - 1 ? (
                      <Button type="button" onClick={onNext}>
                        Continuar
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    ) : (
                      <Button type="button" onClick={onComplete}>
                        Ir al Dashboard
                        <CheckCircle2 aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              </footer>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AdminOnboardingGate({
  children,
  enabled,
  serverIdentity,
}: {
  children: ReactNode;
  enabled: boolean;
  serverIdentity?: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [, startTransition] = useTransition();

  const completeOnboarding = async () => {
    const nextIdentity = {
      ...(serverIdentity ?? {}),
      adminOnboardingCompleted: true,
    };

    await fetch("/api/admin/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandIdentity: nextIdentity }),
    });

    startTransition(() => {
      router.refresh();
    });
  };

  const back = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const next = () => {
    setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
  };

  return (
    <div className={cn(enabled && "pointer-events-none select-none")} aria-hidden={enabled}>
      {children}

      {enabled ? (
        <AdminOnboardingWrapper
          open={enabled}
          currentStep={currentStep}
          serverIdentity={serverIdentity}
          onStepChange={setCurrentStep}
          onBack={back}
          onNext={next}
          onComplete={completeOnboarding}
        />
      ) : null}

    </div>
  );
}