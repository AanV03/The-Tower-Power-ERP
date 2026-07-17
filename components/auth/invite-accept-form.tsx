"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  User,
  UserCheck,
} from "lucide-react";

import { OtpCodeInput } from "@/components/auth/otp-code-input";
import { AuthShell } from "@/components/layout/auth-shell";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";

interface InviteAcceptFormProps {
  token: string;
  locale: Locale;
}

export function InviteAcceptForm({ token, locale }: InviteAcceptFormProps) {
  const router = useRouter();
  const dictionary = getDictionary(locale);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [setupQrCodeDataUrl, setSetupQrCodeDataUrl] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  async function startTwoFactorSetup() {
    const response = await fetch("/api/auth/2fa/generate", {
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      message?: string;
      secret?: string;
      qrCodeDataUrl?: string;
    } | null;

    if (!response.ok || !payload?.ok || !payload.qrCodeDataUrl) {
      throw new Error(
        payload?.message ?? dictionary.auth.twoFactor.setupFailed
      );
    }

    setSetupQrCodeDataUrl(payload.qrCodeDataUrl);
    setSetupSecret(payload.secret ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (password.length < 8) {
      setFormError(dictionary.auth.errors.passwordRequirements);
      return;
    }

    if (password !== confirm) {
      setFormError(dictionary.auth.errors.confirmMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          name: name.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
        twoFactorSetupRequired?: boolean;
      } | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ??
            payload?.error ??
            "No se pudo activar la cuenta."
        );
      }

      setSuccessMessage(payload?.message || "Cuenta activada correctamente.");
      
      // Immediately start 2FA setup as required by the security policy
      await startTwoFactorSetup();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Error al procesar la invitación."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (twoFactorCode.length !== 6) {
      setFormError(dictionary.auth.twoFactor.codeRequired);
      return;
    }

    setIsVerifyingTwoFactor(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: twoFactorCode,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.message ?? dictionary.auth.twoFactor.invalidCode
        );
      }

      router.push(localizedPath(locale, "dashboard"));
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Error al verificar 2FA."
      );
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  }

  return (
    <AuthShell locale={locale} backLabel={dictionary.auth.backToHome}>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="auth-icon-tile flex size-14 items-center justify-center rounded-2xl shadow-lg">
            {setupQrCodeDataUrl ? (
              <KeyRound className="size-7 text-white" aria-hidden="true" />
            ) : (
              <Dumbbell className="size-7 text-white" aria-hidden="true" />
            )}
          </div>

          <div>
            <h1 className="auth-heading text-2xl font-bold tracking-tight">
              {setupQrCodeDataUrl
                ? dictionary.auth.twoFactor.setupTitle
                : "Aceptar Invitación"}
            </h1>
            <p className="auth-muted mt-1 text-sm">
              {setupQrCodeDataUrl
                ? dictionary.auth.twoFactor.setupSubtitle
                : "Configura tu cuenta para unirte al gimnasio."}
            </p>
          </div>
        </div>

        <div className="auth-card overflow-hidden rounded-2xl border ring-1 ring-[color:var(--auth-card-border)] backdrop-blur-xl">
          <div className="auth-accent-bar h-1 w-full" />

          <div className="px-8 py-8">
            {setupQrCodeDataUrl ? (
              // 2FA Setup Form
              <form onSubmit={handleTwoFactorVerify} className="space-y-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Escanea el código QR en tu aplicación autenticadora para configurar tu cuenta.
                  </p>
                  {setupQrCodeDataUrl && (
                    <div className="rounded-xl border bg-white p-3 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={setupQrCodeDataUrl}
                        alt="2FA QR Code"
                        className="size-40"
                      />
                    </div>
                  )}
                  {setupSecret && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {dictionary.auth.twoFactor.manualKey}
                      </p>
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-bold select-all">
                        {setupSecret}
                      </code>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-center">
                    <OtpCodeInput
                      id="invite-accept-2fa-code"
                      label={dictionary.auth.twoFactor.code}
                      value={twoFactorCode}
                      onChange={setTwoFactorCode}
                      hasError={Boolean(formError)}
                    />
                  </div>
                </div>

                {formError && (
                  <p className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingTwoFactor}
                  className={cn(
                    "auth-primary-button relative h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200",
                    "hover:brightness-110 active:scale-[0.99]",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {isVerifyingTwoFactor ? "Verificando..." : "Completar Activación"}
                </button>
              </form>
            ) : (
              // Password Setup Form
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="accept-name" className="auth-label block text-sm font-medium">
                    Nombre Completo (Opcional)
                  </label>
                  <div className="relative">
                    <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <User className="size-4" aria-hidden="true" />
                    </span>
                    <input
                      id="accept-name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input h-10 w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none transition-[box-shadow,border-color]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="accept-password" className="auth-label block text-sm font-medium">
                    Contraseña nueva
                  </label>
                  <div className="relative">
                    <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="size-4" aria-hidden="true" />
                    </span>
                    <input
                      id="accept-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input h-10 w-full rounded-lg border px-3 py-2 pl-9 pr-10 text-sm outline-none transition-[box-shadow,border-color]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-icon-button absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="accept-confirm" className="auth-label block text-sm font-medium">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="size-4" aria-hidden="true" />
                    </span>
                    <input
                      id="accept-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repite la contraseña"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="auth-input h-10 w-full rounded-lg border px-3 py-2 pl-9 pr-10 text-sm outline-none transition-[box-shadow,border-color]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="auth-icon-button absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {successMessage && (
                  <p className="auth-success-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="status">
                    <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                    {successMessage}
                  </p>
                )}

                {formError && (
                  <p className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "auth-primary-button relative h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200",
                    "hover:brightness-110 active:scale-[0.99]",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {isLoading ? "Guardando..." : "Confirmar e iniciar 2FA"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
