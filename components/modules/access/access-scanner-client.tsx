"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Activity, CheckCircle2, Loader2, ScanLine, ShieldX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type AccessDevice = {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
};

type ScanState = {
  status: "IDLE" | "GRANTED" | "DENIED";
  message: string;
  memberName?: string;
  planName?: string;
};

const labels = {
  es: {
    title: "Control de Acceso",
    subtitle: "Simulador de escaner para torniquetes, QR y recepcion.",
    inputLabel: "Codigo de miembro, correo o telefono",
    placeholder: "Escanea o escribe el codigo...",
    validate: "Validar",
    ready: "Lector en espera",
    granted: "ACCESO PERMITIDO",
    denied: "ACCESO DENEGADO",
    devices: "Dispositivos",
    noDevices: "No hay dispositivos registrados. El simulador puede validar miembros sin hardware.",
    device: "Dispositivo",
    code: "Codigo",
    type: "Tipo",
    status: "Estado",
  },
  en: {
    title: "Access Control",
    subtitle: "Scanner simulator for turnstiles, QR readers, and front desk access.",
    inputLabel: "Member code, email, or phone",
    placeholder: "Scan or type the code...",
    validate: "Validate",
    ready: "Reader waiting",
    granted: "ACCESS GRANTED",
    denied: "ACCESS DENIED",
    devices: "Devices",
    noDevices: "No devices registered. The simulator can validate members without hardware.",
    device: "Device",
    code: "Code",
    type: "Type",
    status: "Status",
  },
  fr: {
    title: "Controle d'Acces",
    subtitle: "Simulateur de lecteur pour tourniquets, QR et reception.",
    inputLabel: "Code membre, e-mail ou telephone",
    placeholder: "Scannez ou saisissez le code...",
    validate: "Valider",
    ready: "Lecteur en attente",
    granted: "ACCES AUTORISE",
    denied: "ACCES REFUSE",
    devices: "Dispositifs",
    noDevices: "Aucun dispositif enregistre. Le simulateur peut valider les membres sans materiel.",
    device: "Dispositif",
    code: "Code",
    type: "Type",
    status: "Statut",
  },
};

const deviceStatusStyles: Record<string, string> = {
  ONLINE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  OFFLINE: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  MAINTENANCE: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export function AccessScannerClient({
  locale,
  devices,
}: {
  locale: Locale;
  devices: AccessDevice[];
}) {
  const t = labels[locale] ?? labels.es;
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanValue, setScanValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [scanState, setScanState] = useState<ScanState>({
    status: "IDLE",
    message: t.ready,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [scanState.status]);

  async function handleValidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessCode = scanValue.trim();

    if (!accessCode) {
      inputRef.current?.focus();
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/access/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          deviceCode: devices[0]?.code,
        }),
      });
      const result = await response.json().catch(() => null);

      if (response.ok && result?.status === "GRANTED") {
        setScanState({
          status: "GRANTED",
          message: result.message ?? "Acceso Permitido",
          memberName: result.member?.name,
          planName: result.planName,
        });
        toast.success(result.message ?? "Acceso Permitido");
      } else {
        setScanState({
          status: "DENIED",
          message: result?.message ?? "Acceso Denegado",
        });
        toast.error(result?.message ?? "Acceso Denegado");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo validar el acceso.";
      setScanState({ status: "DENIED", message });
      toast.error(message);
    } finally {
      setScanValue("");
      setIsValidating(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">{t.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          {t.subtitle}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="rounded-lg border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <ScanLine className="size-5 text-primary" />
              Simulador de Escaner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleValidate} className="space-y-3">
              <label htmlFor="access-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.inputLabel}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  ref={inputRef}
                  id="access-code"
                  value={scanValue}
                  onChange={(event) => setScanValue(event.target.value)}
                  placeholder={t.placeholder}
                  className="h-16 flex-1 rounded-lg border-2 border-border bg-background px-5 text-xl font-semibold text-foreground shadow-inner outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="submit"
                  disabled={isValidating}
                  className="h-16 min-w-36 rounded-lg bg-[var(--brand-orange)] px-6 text-base font-bold text-white hover:bg-[var(--brand-orange)]/90"
                >
                  {isValidating ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
                  {t.validate}
                </Button>
              </div>
            </form>

            <div
              className={cn(
                "flex min-h-[260px] flex-col items-center justify-center rounded-lg border p-8 text-center transition-all duration-300",
                scanState.status === "GRANTED" && "border-green-400 bg-green-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.35)]",
                scanState.status === "DENIED" && "border-red-400 bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.35)]",
                scanState.status === "IDLE" && "border-dashed border-border bg-muted/30 text-muted-foreground",
              )}
            >
              {scanState.status === "GRANTED" ? (
                <CheckCircle2 className="mb-4 size-20" />
              ) : scanState.status === "DENIED" ? (
                <ShieldX className="mb-4 size-20" />
              ) : (
                <ScanLine className="mb-4 size-20 opacity-60" />
              )}
              <p className="text-3xl font-black tracking-wide">
                {scanState.status === "GRANTED" ? t.granted : scanState.status === "DENIED" ? t.denied : t.ready}
              </p>
              <p className="mt-3 max-w-md text-sm font-semibold opacity-90">{scanState.message}</p>
              {scanState.memberName ? (
                <p className="mt-4 text-lg font-bold">{scanState.memberName}</p>
              ) : null}
              {scanState.planName ? (
                <p className="mt-1 text-sm font-medium opacity-90">{scanState.planName}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Activity className="size-4 text-muted-foreground" />
              {t.devices}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t.noDevices}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.device}</TableHead>
                      <TableHead>{t.code}</TableHead>
                      <TableHead>{t.type}</TableHead>
                      <TableHead>{t.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-semibold text-foreground">{device.name}</TableCell>
                        <TableCell className="font-mono text-xs">{device.code}</TableCell>
                        <TableCell className="text-xs">{device.type}</TableCell>
                        <TableCell>
                          <Badge className={deviceStatusStyles[device.status]} variant="outline">
                            {device.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
