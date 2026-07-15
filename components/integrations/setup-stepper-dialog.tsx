"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Integration } from "./integration-card";

interface SetupStepperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onSave: (id: string, status: "connected") => void;
  labels: {
    title: string;
    step: string;
    auth: string;
    events: string;
    test: string;
    apiKeyLabel: string;
    apiKeyPlaceholder: string;
    selectEventsLabel: string;
    webhookLabel: string;
    testButton: string;
    testing: string;
    success: string;
    finish: string;
    cancel: string;
    next: string;
    back: string;
  };
}

const AUTOMATIONS = [
  {
    id: "sync-payments",
    title: "Sincronizar pagos",
    description: "Actualiza pagos y membresias cuando se cobre una transaccion.",
  },
  {
    id: "notify-new-members",
    title: "Notificar nuevos miembros",
    description: "Envia mensajes de bienvenida cuando alguien se registra.",
  },
  {
    id: "failed-payment-alerts",
    title: "Avisar pagos fallidos",
    description: "Crea alertas para seguimiento de cobranza sin trabajo manual.",
  },
  {
    id: "send-receipts",
    title: "Enviar comprobantes",
    description: "Entrega recibos y confirmaciones despues de cada pago.",
  },
];

export function SetupStepperDialog({
  isOpen,
  onClose,
  integration,
  onSave,
  labels,
}: SetupStepperDialogProps) {
  const [step, setStep] = React.useState(1);
  const [connectionState, setConnectionState] = React.useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [enabledAutomations, setEnabledAutomations] = React.useState<string[]>([
    "sync-payments",
    "failed-payment-alerts",
  ]);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    setStep(1);
    setConnectionState("idle");
    dialogRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !integration) return null;

  const formattedTitle = labels.title.replace("{name}", integration.name);
  const isWebhook = integration.authType === "webhook";
  const providerName = integration.name.split(" ")[0];
  const canContinueFromConnection = connectionState === "connected" || isWebhook;

  const handleConnect = () => {
    setConnectionState("connecting");
    window.setTimeout(() => {
      setConnectionState("connected");
    }, 900);
  };

  const toggleAutomation = (id: string) => {
    setEnabledAutomations((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const handleFinish = () => {
    onSave(integration.id, "connected");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-border/60 focus-visible:outline-none"
      >
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="space-y-1">
            <h2 id="dialog-title" className="text-lg font-semibold tracking-tight">
              {formattedTitle}
            </h2>
            <p className="text-xs text-muted-foreground">
              Conecta tu cuenta y elige que tareas quieres automatizar.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-8 rounded-full border border-transparent p-0 hover:bg-muted"
            aria-label="Cerrar modal"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="border-b border-border bg-background px-6 pb-3 pt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{labels.step.replace("{current}", String(step)).replace("{total}", "3")}</span>
            <span className="font-semibold text-foreground">
              {step === 1 ? "Conexion" : step === 2 ? "Validacion" : "Automatizaciones"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[320px] bg-card p-6">
          {step === 1 && (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <ExternalLink className="size-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                Conecta tu cuenta de {providerName}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Te llevaremos a {integration.name} para confirmar el acceso. Al terminar, volveras automaticamente a Gerpy.
              </p>

              {connectionState === "error" ? (
                <div className="mt-5 flex max-w-md items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-left">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  <p className="text-xs font-medium leading-5 text-foreground">
                    Hubo un problema al conectar. Asegurate de tener permisos de administrador en {providerName}.
                  </p>
                </div>
              ) : null}

              <Button
                type="button"
                onClick={isWebhook ? () => setConnectionState("connected") : handleConnect}
                disabled={connectionState === "connecting"}
                className="mt-6 min-w-56"
              >
                {connectionState === "connecting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Conectando...
                  </>
                ) : connectionState === "connected" ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Cuenta conectada
                  </>
                ) : (
                  <>
                    <ExternalLink className="size-4" aria-hidden="true" />
                    Conectar con {providerName}
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                <Check className="size-8" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">¡Conectado!</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Gerpy ya puede trabajar con {integration.name}. Puedes ajustar las automatizaciones en el siguiente paso.
              </p>

              <div className="mt-6 flex max-w-md items-start gap-3 rounded-lg border border-border bg-background p-4 text-left shadow-sm">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Tu conexion esta cifrada y segura</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Protegemos la conexion para que no tengas que iniciar sesion cada vez.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  ¿Que automatizaciones deseas activar?
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Puedes cambiar estas opciones despues desde esta misma pantalla.
                </p>
              </div>

              <div className="space-y-3">
                {AUTOMATIONS.map((automation) => {
                  const enabled = enabledAutomations.includes(automation.id);

                  return (
                    <button
                      key={automation.id}
                      type="button"
                      onClick={() => toggleAutomation(automation.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-lg border bg-background p-4 text-left shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        enabled ? "border-success/45 bg-success/5 ring-1 ring-success/15" : "border-border",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          {automation.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {automation.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                          enabled
                            ? "border-success bg-success ring-2 ring-success/20"
                            : "border-border bg-muted",
                        )}
                        aria-hidden="true"
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 size-5 rounded-full shadow-sm transition-transform",
                            enabled ? "bg-success-foreground" : "bg-background",
                            enabled ? "translate-x-5" : "translate-x-0.5",
                          )}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-background px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs hover:bg-muted"
          >
            {labels.cancel}
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((current) => current - 1)}
                className="flex items-center gap-1 text-xs hover:bg-muted"
              >
                <ChevronLeft className="size-3" />
                {labels.back}
              </Button>
            )}

            {step < 3 ? (
              <Button
                disabled={step === 1 && !canContinueFromConnection}
                onClick={() => setStep((current) => current + 1)}
                className="flex items-center gap-1 text-xs"
              >
                {labels.next}
                <ChevronRight className="size-3" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="bg-primary text-xs text-primary-foreground hover:bg-primary/90"
              >
                Guardar configuracion
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
