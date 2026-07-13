"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Dumbbell, Mail } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function PasswordRecoveryForm({ locale = "es" }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const emailInvalid = touched && email.length > 0 && !validateEmail(email);
  const emailEmpty = touched && email.length === 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateEmail(email)) {
      setErrorMessage(email.length === 0 ? dictionary.auth.errors.emailRequired : dictionary.auth.errors.emailInvalid);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ??
            payload?.error ??
            "Password recovery is not available right now. Please try again later."
        );
      }

      setSuccessMessage(
        payload?.message ??
          "If an account exists for that email, recovery instructions will be sent shortly."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Password recovery is not available right now. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell locale={locale} backLabel={dictionary.auth.backToHome}>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="auth-icon-tile flex size-14 items-center justify-center rounded-2xl shadow-lg"
          >
            <Dumbbell className="size-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="auth-heading text-2xl font-bold tracking-tight">
              {dictionary.auth.passwordRecovery.title}
            </h1>
            <p className="auth-muted mt-1 text-sm">
              {dictionary.auth.passwordRecovery.subtitle}
            </p>
          </div>
        </div>

        <div className="auth-card overflow-hidden rounded-2xl border ring-1 ring-[color:var(--auth-card-border)] backdrop-blur-xl">
          <div className="auth-accent-bar h-1 w-full" />

          <form onSubmit={handleSubmit} noValidate className="space-y-5 px-8 py-8">
            <div className="space-y-1.5">
              <label htmlFor="password-recovery-email" className="auth-label block text-sm font-medium">
                {dictionary.auth.fields.email}
              </label>
              <div className="relative">
                <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <input
                  id="password-recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder={dictionary.auth.placeholders.email}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  onBlur={() => setTouched(true)}
                  aria-invalid={emailEmpty || emailInvalid ? "true" : "false"}
                  className={cn(
                    "auth-input h-10 w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none transition-[box-shadow,border-color]",
                    emailEmpty || emailInvalid ? "auth-input-error" : ""
                  )}
                />
              </div>
            </div>

            {successMessage && (
              <p className="auth-success-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="status">
                <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                {successMessage}
              </p>
            )}

            {errorMessage && (
              <p className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="alert">
                <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "auth-primary-button relative h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200",
                "hover:brightness-110 active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {isSubmitting ? dictionary.auth.passwordRecovery.loading : dictionary.auth.passwordRecovery.submit}
            </button>
          </form>

          <div className="auth-divider border-t px-8 py-5 text-center text-sm">
            {dictionary.auth.passwordRecovery.footerPrefix}{" "}
            <Link
              href={localizedPath(locale, "login")}
              className="auth-link font-semibold underline-offset-4 transition-colors hover:underline"
            >
              {dictionary.auth.passwordRecovery.footerAction}
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
