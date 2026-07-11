"use client";

import * as React from "react";
import { X, Key, Check, Loader2, Webhook, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const AVAILABLE_EVENTS = [
  { id: "member.created", desc: "Miembro registrado" },
  { id: "member.updated", desc: "Miembro modificado" },
  { id: "payment.succeeded", desc: "Pago exitoso" },
  { id: "payment.failed", desc: "Pago fallido" },
  { id: "membership.paused", desc: "Membresía pausada" },
  { id: "attendance.registered", desc: "Acceso validado" },
];

export function SetupStepperDialog({
  isOpen,
  onClose,
  integration,
  onSave,
  labels,
}: SetupStepperDialogProps) {
  const [step, setStep] = React.useState(1);
  const [apiKey, setApiKey] = React.useState("");
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([
    "member.created",
    "payment.succeeded",
  ]);
  const [testState, setTestState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Esc keys listener and focus trapping
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Reset stepper state on open
    setStep(1);
    setApiKey("");
    setTestState("idle");
    
    // Focus container
    dialogRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !integration) return null;

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTestConnection = () => {
    setTestState("loading");
    setTimeout(() => {
      if (apiKey.trim().length < 5) {
        setTestState("error");
      } else {
        setTestState("success");
      }
    }, 1500);
  };

  const handleFinish = () => {
    onSave(integration.id, "connected");
    onClose();
  };

  const formattedTitle = labels.title.replace("{name}", integration.name);
  const formattedPlaceholder = labels.apiKeyPlaceholder.replace("{name}", integration.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[var(--sidebar-border-color)] bg-card text-card-foreground shadow-[var(--glass-shadow)] glass-panel focus-visible:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--sidebar-border-color)]">
          <h2 id="dialog-title" className="text-lg font-semibold tracking-tight">
            {formattedTitle}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full border border-transparent hover:bg-[var(--glass-control-hover)]"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Stepper Progress bar */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{labels.step.replace("{current}", String(step)).replace("{total}", "3")}</span>
            <span className="font-semibold text-foreground">
              {step === 1 ? labels.auth : step === 2 ? labels.events : labels.test}
            </span>
          </div>
          <div className="flex gap-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-6 min-h-[200px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4">
              <label htmlFor="api-key" className="text-sm font-medium block">
                {labels.apiKeyLabel}
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="api-key"
                  type="password"
                  placeholder={formattedPlaceholder}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El token se almacena de forma encriptada en la base de datos de The Tower Power.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <span className="text-sm font-medium block">{labels.selectEventsLabel}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                {AVAILABLE_EVENTS.map((ev) => {
                  const isChecked = selectedEvents.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => toggleEvent(ev.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isChecked
                          ? "bg-[var(--glass-control-hover)] border-[var(--color-primary)] text-foreground"
                          : "bg-transparent border-[var(--sidebar-border-color)] text-muted-foreground hover:bg-[var(--glass-control-bg)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded flex items-center justify-center border shrink-0",
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted"
                        )}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{ev.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium block">{labels.webhookLabel}</span>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--sidebar-border-color)] bg-[var(--glass-control-bg)]">
                  <Webhook className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="text-xs font-mono select-all overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                    https://api.towerpower.com/v1/webhooks/{integration.id}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center justify-center text-center">
                {testState === "idle" && (
                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    className="border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)]"
                  >
                    {labels.testButton}
                  </Button>
                )}

                {testState === "loading" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>{labels.testing}</span>
                  </div>
                )}

                {testState === "success" && (
                  <div className="flex items-center gap-2 text-sm text-[var(--brand-green)] font-medium">
                    <Check className="w-5 h-5" />
                    <span>{labels.success}</span>
                  </div>
                )}

                {testState === "error" && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-[var(--brand-red)] font-medium">
                      Error: Credenciales inválidas
                    </p>
                    <Button
                      onClick={handleTestConnection}
                      variant="outline"
                      size="sm"
                      className="border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)]"
                    >
                      {labels.testButton}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--sidebar-border-color)] bg-[var(--header-glass-bg)]/20">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs border border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)]"
          >
            {labels.cancel}
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="text-xs border border-[var(--sidebar-border-color)] hover:bg-[var(--glass-control-hover)] flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                {labels.back}
              </Button>
            )}

            {step < 3 ? (
              <Button
                disabled={step === 1 && apiKey.trim().length === 0}
                onClick={() => setStep((s) => s + 1)}
                className="text-xs flex items-center gap-1"
              >
                {labels.next}
                <ChevronRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                disabled={testState !== "success"}
                onClick={handleFinish}
                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {labels.finish}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
