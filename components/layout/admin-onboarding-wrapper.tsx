"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  Dumbbell,
  MapPin,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
import { cn } from "@/lib/utils";

type GymInfo = {
  gymName: string;
  address: string;
  timeZone: string;
  curp: string;
  rfc: string;
};

type GymInfoErrors = Record<keyof GymInfo, string>;
type PlanId = (typeof plans)[number]["id"];

type OnboardingWrapperProps = {
  open: boolean;
  currentStep: number;
  serverIdentity?: Record<string, unknown> | null;
  onStepChange: (step: number) => void;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
};

const emptyGymInfo: GymInfo = {
  gymName: "",
  address: "",
  timeZone: "",
  curp: "",
  rfc: "",
};

const emptyErrors: GymInfoErrors = {
  gymName: "",
  address: "",
  timeZone: "",
  curp: "",
  rfc: "",
};

const curpRegex = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
const rfcRegex = /^([A-ZÑ&]{3,4})\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$/;

const previewItems = [
  "Nombre, direccion, zona horaria, CURP y RFC",
  "Configuraciones iniciales",
  "Plan y tarjeta temporal",
];

const setupItems = [
  {
    title: "Sucursal principal",
    description: "Base operativa inicial para administrar ventas y asistencia.",
    icon: Building2,
  },
  {
    title: "Membresias",
    description: "Estructura visual para planes recurrentes y promociones.",
    icon: BadgeCheck,
  },
];

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

const stepMeta = [
  {
    id: "welcome",
    eyebrow: "Paso 1 de 5",
    title: "Bienvenido",
    description: "Te guiamos por la configuracion inicial antes de entrar al dashboard.",
  },
  {
    id: "gym-info",
    eyebrow: "Paso 2 de 5",
    title: "Informacion del gimnasio",
    description: "Captura Nombre del Gimnasio, direccion, zona horaria, CURP y RFC para continuar.",
  },
  {
    id: "setup",
    eyebrow: "Paso 3 de 5",
    title: "Configuracion inicial",
    description: "Estas configuraciones son una vista previa visual. Podras modificarlas luego.",
  },
  {
    id: "plans",
    eyebrow: "Paso 4 de 5",
    title: "Seleccion de plan",
    description: "Elige una opcion y registra temporalmente el numero de tarjeta.",
  },
  {
    id: "finish",
    eyebrow: "Paso 5 de 5",
    title: "Todo listo",
    description: "Tu gimnasio ha sido configurado correctamente.",
  },
];

function normalizeGymInfo(values: GymInfo) {
  return {
    gymName: values.gymName.trim(),
    address: values.address.trim(),
    timeZone: values.timeZone.trim(),
    curp: values.curp.trim().toUpperCase(),
    rfc: values.rfc.trim().toUpperCase(),
  };
}

function validateGymInfo(values: GymInfo) {
  const data = normalizeGymInfo(values);
  const errors = { ...emptyErrors };

  if (data.gymName.length < 3) {
    errors.gymName = "Ingresa el nombre del gimnasio.";
  }

  if (data.address.length < 5) {
    errors.address = "Ingresa la direccion del gimnasio.";
  }

  if (data.timeZone.length < 3) {
    errors.timeZone = "Ingresa la zona horaria del gimnasio.";
  }

  if (!curpRegex.test(data.curp)) {
    errors.curp = "Ingresa una CURP valida de 18 caracteres.";
  }

  if (!rfcRegex.test(data.rfc)) {
    errors.rfc = "Ingresa un RFC valido con homoclave.";
  }

  return {
    data,
    errors,
    isValid: !Object.values(errors).some(Boolean),
  };
}

export function AdminOnboardingWrapper({
  open,
  currentStep,
  onStepChange,
  onBack,
  onNext,
  onComplete,
}: OnboardingWrapperProps) {
  const activeStep = stepMeta[currentStep] ?? stepMeta[0];
  const [mounted, setMounted] = useState(false);
  const [gymInfo, setGymInfo] = useState<GymInfo>(emptyGymInfo);
  const [gymInfoErrors, setGymInfoErrors] = useState<GymInfoErrors>(emptyErrors);
  const [storedGymInfo, setStoredGymInfo] = useState<GymInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<PlanId | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [storedCardNumber, setStoredCardNumber] = useState("");
  const [cardError, setCardError] = useState("");

  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? null;
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  function updateGymInfo(field: keyof GymInfo, value: string) {
    setGymInfo((previous) => ({
      ...previous,
      [field]: field === "curp" || field === "rfc" ? value.toUpperCase() : value,
    }));
  }

  function saveGymInfo() {
    const validation = validateGymInfo(gymInfo);

    if (!validation.isValid) {
      setGymInfoErrors(validation.errors);
      return false;
    }

    setGymInfo(validation.data);
    setStoredGymInfo(validation.data);
    setGymInfoErrors(emptyErrors);
    return true;
  }

  function openPlanDialog(planId: PlanId) {
    setActivePlanId(planId);
    setCardNumber(selectedPlanId === planId ? storedCardNumber : "");
    setCardError("");
    setDialogOpen(true);
  }

  function saveCardNumber() {
    if (!activePlan) return;

    const normalizedCard = cardNumber.replace(/\D/g, "");

    if (normalizedCard.length < 12) {
      setCardError("Ingresa un numero de tarjeta valido.");
      return;
    }

    setSelectedPlanId(activePlan.id);
    setStoredCardNumber(normalizedCard);
    setDialogOpen(false);
    setCardError("");
  }

  function handleNext() {
    if (activeStep.id === "gym-info" && !saveGymInfo()) {
      return;
    }

    if (activeStep.id === "plans" && !selectedPlanId) {
      setCardError("Selecciona un plan y registra un numero de tarjeta.");
      return;
    }

    onNext();
  }

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,133,0,0.16),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(0,188,125,0.14),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />

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
                {stepMeta.map((step, index) => {
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
                    {currentStep + 1} / {stepMeta.length}
                  </div>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                {activeStep.id === "welcome" ? <WelcomeStep /> : null}
                {activeStep.id === "gym-info" ? (
                  <GymInfoStep
                    gymInfo={gymInfo}
                    errors={gymInfoErrors}
                    storedGymInfo={storedGymInfo}
                    onChange={updateGymInfo}
                  />
                ) : null}
                {activeStep.id === "setup" ? <SetupStep /> : null}
                {activeStep.id === "plans" ? (
                  <PlansStep
                    selectedPlanId={selectedPlanId}
                    cardError={cardError}
                    onSelectPlan={openPlanDialog}
                  />
                ) : null}
                {activeStep.id === "finish" ? (
                  <FinishStep
                    storedGymInfo={storedGymInfo}
                    selectedPlan={selectedPlan}
                    storedCardNumber={storedCardNumber}
                  />
                ) : null}
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
                      className={cn(currentStep === stepMeta.length - 1 && "hidden")}
                    >
                      Omitir y salir
                    </Button>

                    {currentStep < stepMeta.length - 1 ? (
                      <Button type="button" onClick={handleNext}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="z-[160] overflow-hidden border-border bg-background p-0 text-foreground shadow-2xl ring-1 ring-border sm:max-w-lg">
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
                  Registra temporalmente el numero de tarjeta para seleccionar el plan.
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
              <label htmlFor="admin-card-number" className="text-sm font-semibold text-foreground">
                Numero de tarjeta
              </label>
              <div className="relative">
                <CreditCard
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="admin-card-number"
                  value={cardNumber}
                  onChange={(event) => {
                    setCardError("");
                    setCardNumber(event.target.value.replace(/[^\d\s-]/g, ""));
                  }}
                  className="h-12 border-border bg-card pl-9 font-mono text-base tracking-wide shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary/20"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              {cardError ? <p className="text-xs text-destructive">{cardError}</p> : null}
              <p className="text-xs leading-5 text-muted-foreground">
                Este dato solo se conserva en memoria para validar el flujo visual.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border bg-card px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={saveCardNumber}>
              Guardar tarjeta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>,
    document.body,
  );
}

function WelcomeStep() {
  return (
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
              Este recorrido valida la configuracion inicial sin salir del estado de bloqueo visual.
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
  );
}

function GymInfoStep({
  gymInfo,
  errors,
  storedGymInfo,
  onChange,
}: {
  gymInfo: GymInfo;
  errors: GymInfoErrors;
  storedGymInfo: GymInfo | null;
  onChange: (field: keyof GymInfo, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="admin-gym-name" className="text-sm font-semibold text-foreground">
            Nombre del Gimnasio
          </label>
          <div className="relative">
            <Building2
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-gym-name"
              value={gymInfo.gymName}
              onChange={(event) => onChange("gymName", event.target.value)}
              className={cn(
                "h-12 border-border bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70",
                errors.gymName ? "border-destructive focus-visible:ring-destructive/20" : "",
              )}
              placeholder="Gerpy Fitness Center"
              aria-invalid={errors.gymName ? "true" : "false"}
            />
          </div>
          {errors.gymName ? <p className="text-xs text-destructive">{errors.gymName}</p> : null}
        </div>

        <IconField
          id="admin-address"
          label="Direccion"
          value={gymInfo.address}
          placeholder="Av. Principal 123, Col. Centro"
          error={errors.address}
          icon={MapPin}
          onChange={(value) => onChange("address", value)}
        />
        <IconField
          id="admin-time-zone"
          label="Zona horaria"
          value={gymInfo.timeZone}
          placeholder="America/Mexico_City"
          error={errors.timeZone}
          icon={Clock3}
          onChange={(value) => onChange("timeZone", value)}
        />

        <TaxField
          id="admin-curp"
          label="CURP"
          value={gymInfo.curp}
          maxLength={18}
          placeholder="ABCD010101HDFRRN09"
          error={errors.curp}
          onChange={(value) => onChange("curp", value)}
        />
        <TaxField
          id="admin-rfc"
          label="RFC"
          value={gymInfo.rfc}
          maxLength={13}
          placeholder="XAXX010101000"
          error={errors.rfc}
          onChange={(value) => onChange("rfc", value)}
        />
      </div>

      {storedGymInfo ? (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Datos simulados en memoria para{" "}
          <span className="font-semibold text-foreground">{storedGymInfo.gymName}</span>.
        </div>
      ) : null}
    </div>
  );
}

function TaxField({
  id,
  label,
  value,
  maxLength,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  error: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 border-border bg-background/60 shadow-sm placeholder:text-muted-foreground/70",
          error ? "border-destructive focus-visible:ring-destructive/20" : "",
        )}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        aria-invalid={error ? "true" : "false"}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function IconField({
  id,
  label,
  value,
  placeholder,
  error,
  icon: Icon,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error: string;
  icon: typeof MapPin;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-12 border-border bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70",
            error ? "border-destructive focus-visible:ring-destructive/20" : "",
          )}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SetupStep() {
  return (
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
  );
}

function PlansStep({
  selectedPlanId,
  cardError,
  onSelectPlan,
}: {
  selectedPlanId: PlanId | null;
  cardError: string;
  onSelectPlan: (planId: PlanId) => void;
}) {
  return (
    <div className="space-y-4">
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
                  ? "border-(--brand-orange)/30 bg-(--brand-orange)/5 shadow-xl shadow-black/10"
                  : "border-border bg-background/55 shadow-sm",
                isSelected ? "ring-2 ring-(--brand-green)/40" : "",
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
                <Button
                  type="button"
                  className="w-full"
                  variant={isSelected ? "secondary" : "default"}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  {isSelected ? "Plan seleccionado" : "Seleccionar Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cardError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          {cardError}
        </p>
      ) : null}
    </div>
  );
}

function FinishStep({
  storedGymInfo,
  selectedPlan,
  storedCardNumber,
}: {
  storedGymInfo: GymInfo | null;
  selectedPlan: (typeof plans)[number] | null;
  storedCardNumber: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-background/55 p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-(--brand-green)/10 text-(--brand-green)">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Configuracion completada</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Al terminar, el wrapper puede cerrar el bloqueo y refrescar el dashboard para mostrar el estado real de la app.
        </p>
      </div>

      <Card className="border-border bg-background/55 shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Gimnasio</p>
            <p className="mt-1 font-semibold text-foreground">{storedGymInfo?.gymName || "Pendiente"}</p>
            <p className="text-sm text-muted-foreground">Direccion: {storedGymInfo?.address || "Pendiente"}</p>
            <p className="text-sm text-muted-foreground">Zona horaria: {storedGymInfo?.timeZone || "Pendiente"}</p>
            <p className="text-sm text-muted-foreground">CURP: {storedGymInfo?.curp || "Pendiente"}</p>
            <p className="text-sm text-muted-foreground">RFC: {storedGymInfo?.rfc || "Pendiente"}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Plan</p>
            <p className="mt-1 font-semibold text-foreground">{selectedPlan?.name ?? "Pendiente"}</p>
            <p className="text-sm text-muted-foreground">{selectedPlan?.price ?? "Sin precio"}</p>
            <p className="text-sm text-muted-foreground">
              Tarjeta: {storedCardNumber ? `•••• ${storedCardNumber.slice(-4)}` : "Pendiente"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
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
    setCurrentStep((step) => Math.min(stepMeta.length - 1, step + 1));
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
