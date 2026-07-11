"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Clock3, CreditCard, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  OnboardingLayout,
  OnboardingPanel,
} from "../_components/onboarding-layout";
import { OnboardingNavButton } from "../_components/onboarding-nav-button";

type OnboardingStep = {
  label: string;
  href: string;
  icon: any;
};

const steps: OnboardingStep[] = [
  { label: "Info Gimnasio", href: "/onboarding/gym-info", icon: Building2 },
  { label: "Planes", href: "/onboarding/plans", icon: CreditCard },
];

type OnboardingGymInfo = {
  gymName: string;
  address: string;
  timeZone: string;
  curp: string;
  rfc: string;
};

const emptyErrors: Record<keyof OnboardingGymInfo, string> = {
  gymName: "",
  address: "",
  timeZone: "",
  curp: "",
  rfc: "",
};

const curpRegex = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
const rfcRegex = /^([A-ZÑ&]{3,4})\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$/;

export default function GymInfoPage() {
  const router = useRouter();
  const [form, setForm] = useState<OnboardingGymInfo>({
    gymName: "",
    address: "",
    timeZone: "",
    curp: "",
    rfc: "",
  });
  const [errors, setErrors] = useState(emptyErrors);
  const [storedGymInfo, setStoredGymInfo] = useState<OnboardingGymInfo | null>(null);

  function handleChange(field: keyof OnboardingGymInfo, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: field === "curp" || field === "rfc" ? value.toUpperCase() : value,
    }));
  }

  function validateForm(values: OnboardingGymInfo) {
    const nextErrors = { ...emptyErrors };
    const normalizedValues = {
      gymName: values.gymName.trim(),
      address: values.address.trim(),
      timeZone: values.timeZone.trim(),
      curp: values.curp.trim().toUpperCase(),
      rfc: values.rfc.trim().toUpperCase(),
    };

    if (normalizedValues.gymName.length < 3) {
      nextErrors.gymName = "Ingresa el nombre del gimnasio.";
    }

    if (normalizedValues.address.length < 5) {
      nextErrors.address = "Ingresa la direccion del gimnasio.";
    }

    if (normalizedValues.timeZone.length < 3) {
      nextErrors.timeZone = "Ingresa la zona horaria del gimnasio.";
    }

    if (!curpRegex.test(normalizedValues.curp)) {
      nextErrors.curp = "Ingresa una CURP valida de 18 caracteres.";
    }

    if (!rfcRegex.test(normalizedValues.rfc)) {
      nextErrors.rfc = "Ingresa un RFC valido con homoclave.";
    }

    return {
      data: normalizedValues,
      errors: nextErrors,
      isValid: !Object.values(nextErrors).some(Boolean),
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateForm(form);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors(emptyErrors);
    setStoredGymInfo(validation.data);
    router.push("/onboarding/plans" as any);
  }

  return (
    <OnboardingLayout currentStep={1} steps={steps}>
      <OnboardingPanel
        title="Info Gimnasio"
        description="Captura los datos del negocio antes de elegir el plan y registrar la tarjeta."
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="gym-name" className="text-sm font-semibold text-foreground">
                Nombre del gimnasio
              </label>
              <div className="relative">
                <Building2
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="gym-name"
                  value={form.gymName}
                  onChange={(event) => handleChange("gymName", event.target.value)}
                  className={cn(
                    "h-12 border-white/10 bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70",
                    errors.gymName ? "border-destructive focus-visible:ring-destructive/20" : "",
                  )}
                  placeholder="The Tower Power Fitness Center"
                  aria-invalid={errors.gymName ? "true" : "false"}
                />
              </div>
              {errors.gymName ? <p className="text-xs text-destructive">{errors.gymName}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="gym-address" className="text-sm font-semibold text-foreground">
                Direccion
              </label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="gym-address"
                  value={form.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  className={cn(
                    "h-12 border-white/10 bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70",
                    errors.address ? "border-destructive focus-visible:ring-destructive/20" : "",
                  )}
                  placeholder="Av. Principal 123, Col. Centro"
                  aria-invalid={errors.address ? "true" : "false"}
                />
              </div>
              {errors.address ? <p className="text-xs text-destructive">{errors.address}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="gym-time-zone" className="text-sm font-semibold text-foreground">
                Zona horaria
              </label>
              <div className="relative">
                <Clock3
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="gym-time-zone"
                  value={form.timeZone}
                  onChange={(event) => handleChange("timeZone", event.target.value)}
                  className={cn(
                    "h-12 border-white/10 bg-background/60 pl-9 shadow-sm placeholder:text-muted-foreground/70",
                    errors.timeZone ? "border-destructive focus-visible:ring-destructive/20" : "",
                  )}
                  placeholder="America/Mexico_City"
                  aria-invalid={errors.timeZone ? "true" : "false"}
                />
              </div>
              {errors.timeZone ? <p className="text-xs text-destructive">{errors.timeZone}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="gym-curp" className="text-sm font-semibold text-foreground">
                CURP
              </label>
              <Input
                id="gym-curp"
                value={form.curp}
                onChange={(event) => handleChange("curp", event.target.value)}
                className={cn(
                  "h-12 border-white/10 bg-background/60 shadow-sm placeholder:text-muted-foreground/70",
                  errors.curp ? "border-destructive focus-visible:ring-destructive/20" : "",
                )}
                placeholder="ABCD010101HDFRRN09"
                maxLength={18}
                autoComplete="off"
                aria-invalid={errors.curp ? "true" : "false"}
              />
              {errors.curp ? <p className="text-xs text-destructive">{errors.curp}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="gym-rfc" className="text-sm font-semibold text-foreground">
                RFC
              </label>
              <Input
                id="gym-rfc"
                value={form.rfc}
                onChange={(event) => handleChange("rfc", event.target.value)}
                className={cn(
                  "h-12 border-white/10 bg-background/60 shadow-sm placeholder:text-muted-foreground/70",
                  errors.rfc ? "border-destructive focus-visible:ring-destructive/20" : "",
                )}
                placeholder="XAXX010101000"
                maxLength={13}
                autoComplete="off"
                aria-invalid={errors.rfc ? "true" : "false"}
              />
              {errors.rfc ? <p className="text-xs text-destructive">{errors.rfc}</p> : null}
            </div>
          </div>

          {storedGymInfo ? (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              Datos simulados en memoria para{" "}
              <span className="font-semibold text-foreground">{storedGymInfo.gymName}</span>.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <OnboardingNavButton href="/onboarding/welcome" direction="left" variant="outline">
              Regresar
            </OnboardingNavButton>
            <button
              type="submit"
              className="ml-auto rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Guardar/Continuar
            </button>
          </div>
        </form>
      </OnboardingPanel>
    </OnboardingLayout>
  );
}
