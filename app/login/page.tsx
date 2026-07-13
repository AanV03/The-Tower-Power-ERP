"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Dumbbell, Eye, EyeOff, KeyRound, LogIn } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";
import { OtpCodeInput } from "@/components/auth/otp-code-input";
import { MultiStateBadge, type BadgeState } from "@/components/ui/multi-state-badge";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";

type LoginPayload = {
  ok?: boolean;
  twoFactorRequired?: boolean;
  twoFactorSetupRequired?: boolean;
  message?: string;
  error?: string;
  secret?: string;
  qrCodeDataUrl?: string;
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeRedirect(value: string | null, locale: Locale) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return localizedPath(locale, "dashboard");
}

function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="auth-error-text flex items-center gap-1 text-xs">
      <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function localeFromPathname(pathname: string | null): Locale {
  const firstSegment = pathname?.split("/").filter(Boolean)[0];
  return firstSegment && isLocale(firstSegment) ? firstSegment : "es";
}

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const dictionary = getDictionary(locale);
  const copy = {
    title: dictionary.auth.signin.title,
    subtitle: dictionary.auth.signin.subtitle,
    twoFactorTitle: dictionary.auth.twoFactor.verifyTitle,
    twoFactorSubtitle: dictionary.auth.twoFactor.verifySubtitle,
    setupTitle: dictionary.auth.twoFactor.setupTitle,
    setupSubtitle: dictionary.auth.twoFactor.setupSubtitle,
    email: dictionary.auth.fields.email,
    password: dictionary.auth.fields.password,
    code: dictionary.auth.twoFactor.code,
    emailPlaceholder: dictionary.auth.placeholders.email,
    passwordPlaceholder: dictionary.auth.placeholders.password,
    forgotPassword: dictionary.auth.signin.forgotPassword,
    submit: dictionary.auth.signin.submit,
    loading: dictionary.auth.signin.loading,
    manualKey: dictionary.auth.twoFactor.manualKey,
    verify: dictionary.auth.twoFactor.verify,
    verifying: dictionary.auth.twoFactor.verifying,
    enableTwoFactor: dictionary.auth.twoFactor.enable,
    useAnotherAccount: dictionary.auth.twoFactor.useAnotherAccount,
    footerPrefix: dictionary.auth.signin.footerPrefix,
    footerAction: dictionary.auth.signin.footerAction,
    emailRequired: dictionary.auth.errors.emailRequired,
    emailInvalid: dictionary.auth.errors.emailInvalid,
    passwordRequired: dictionary.auth.errors.passwordRequired,
    invalidCredentials: dictionary.auth.errors.invalidCredentials,
    invalidCode: dictionary.auth.twoFactor.invalidCode,
    showPassword: dictionary.auth.actions.showPassword,
    hidePassword: dictionary.auth.actions.hidePassword,
    backToHome: dictionary.auth.backToHome,
  };
  const [redirectTo, setRedirectTo] = useState<string>(() => localizedPath(locale, "dashboard"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [setupQrCodeDataUrl, setSetupQrCodeDataUrl] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitBadgeState, setSubmitBadgeState] = useState<BadgeState>("idle");

  useEffect(() => {
    setRedirectTo(safeRedirect(new URLSearchParams(window.location.search).get("next"), locale));
  }, [locale]);

  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }, []);

  const emailEmpty = touched.email && email.length === 0;
  const emailInvalid = touched.email && email.length > 0 && !validateEmail(email);
  const passwordError = touched.password && password.length === 0;
  const isFormValid = validateEmail(email) && password.length > 0;

  async function completeLogin() {
    router.push(redirectTo as any);
    router.refresh();
  }

  async function startTwoFactorSetup() {
    const response = await fetch("/api/auth/2fa/generate", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as LoginPayload | null;

    if (!response.ok || !payload?.ok || !payload.qrCodeDataUrl) {
      throw new Error(payload?.message ?? dictionary.auth.twoFactor.setupFailed);
    }

    setSetupQrCodeDataUrl(payload.qrCodeDataUrl);
    setSetupSecret(payload.secret ?? "");
    setTwoFactorCode("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setTouched({ email: true, password: true });

    if (!isFormValid) {
      setSubmitBadgeState("error");
      return;
    }

    setSubmitBadgeState("processing");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => null)) as LoginPayload | null;

      if (!response.ok) {
        setFormError(payload?.message ?? copy.invalidCredentials);
        setSubmitBadgeState("error");
        return;
      }

      if (payload?.twoFactorRequired) {
        setSubmitBadgeState("success");
        setTwoFactorRequired(true);
        setPassword("");
        return;
      }

      if (payload?.twoFactorSetupRequired) {
        await startTwoFactorSetup();
        setSubmitBadgeState("success");
        setPassword("");
        return;
      }

      setSubmitBadgeState("success");
      await wait(450);
      await completeLogin();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : copy.invalidCredentials);
      setSubmitBadgeState("error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (twoFactorCode.length !== 6) {
      setFormError(copy.invalidCode);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const payload = (await response.json().catch(() => null)) as LoginPayload | null;

      if (!response.ok) {
        setFormError(payload?.message ?? copy.invalidCode);
        return;
      }

      await completeLogin();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorSetupVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (twoFactorCode.length !== 6) {
      setFormError(copy.invalidCode);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const payload = (await response.json().catch(() => null)) as LoginPayload | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.message ?? copy.invalidCode);
        return;
      }

      await completeLogin();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell id="login-page" locale={locale} backLabel={copy.backToHome}>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="auth-icon-tile flex size-14 items-center justify-center rounded-2xl shadow-lg"
          >
            {twoFactorRequired ? (
              <KeyRound className="size-7 text-white" aria-hidden="true" />
            ) : setupQrCodeDataUrl ? (
              <KeyRound className="size-7 text-white" aria-hidden="true" />
            ) : (
              <Dumbbell className="size-7 text-white" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="auth-heading text-2xl font-bold tracking-tight">
              {setupQrCodeDataUrl ? copy.setupTitle : twoFactorRequired ? copy.twoFactorTitle : copy.title}
            </h1>
            <p className="auth-muted mt-1 text-sm">
              {setupQrCodeDataUrl ? copy.setupSubtitle : twoFactorRequired ? copy.twoFactorSubtitle : copy.subtitle}
            </p>
          </div>
        </div>

        <div className="auth-card overflow-hidden rounded-2xl border ring-1 ring-[color:var(--auth-card-border)] backdrop-blur-xl">
          <div className="auth-accent-bar h-1 w-full" />

          <div className="px-8 py-8">
            {setupQrCodeDataUrl ? (
              <form id="login-2fa-setup-form" onSubmit={handleTwoFactorSetupVerify} noValidate className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupQrCodeDataUrl}
                    alt="The Tower Power 2FA QR code"
                    className="mx-auto aspect-square w-full max-w-64 rounded-lg"
                  />
                </div>

                {setupSecret && (
                  <div className="auth-manual-key rounded-lg border p-3 text-xs">
                    {copy.manualKey}: <span className="font-mono">{setupSecret}</span>
                  </div>
                )}

                <OtpCodeInput
                  id="login-2fa-setup-code"
                  label={copy.code}
                  value={twoFactorCode}
                  onChange={setTwoFactorCode}
                  hasError={!!formError}
                />

                {formError && (
                  <p className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="auth-primary-button relative h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      {copy.verifying}
                    </span>
                  ) : (
                    copy.enableTwoFactor
                  )}
                </button>
              </form>
            ) : !twoFactorRequired ? (
              <form id="login-form" onSubmit={handleLogin} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="auth-label block text-sm font-medium">
                    {copy.email}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder={copy.emailPlaceholder}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSubmitBadgeState("idle");
                    }}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={emailEmpty || emailInvalid ? "true" : "false"}
                    aria-describedby={emailEmpty || emailInvalid ? "login-email-error" : undefined}
                    className={cn(
                      "auth-input h-10 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[box-shadow,border-color]",
                      emailEmpty || emailInvalid
                        ? "auth-input-error"
                        : "",
                    )}
                  />
                  {emailEmpty && <FieldError id="login-email-error">{copy.emailRequired}</FieldError>}
                  {emailInvalid && <FieldError id="login-email-error">{copy.emailInvalid}</FieldError>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="auth-label block text-sm font-medium">
                    {copy.password}
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={copy.passwordPlaceholder}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setSubmitBadgeState("idle");
                      }}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={passwordError ? "true" : "false"}
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      className={cn(
                        "auth-input h-10 w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-[box-shadow,border-color]",
                        passwordError
                          ? "auth-input-error"
                          : "",
                      )}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                      onClick={() => setShowPassword((current) => !current)}
                      className="auth-icon-button absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordError && <FieldError id="login-password-error">{copy.passwordRequired}</FieldError>}
                </div>

                {formError && (
                  <p className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <div className="flex justify-end">
                  <Link
                    href={localizedPath(locale, "password-recovery")}
                    className="auth-muted text-xs underline-offset-4 transition-colors hover:text-[var(--auth-foreground)] hover:underline"
                  >
                    {copy.forgotPassword}
                  </Link>
                </div>

                <div className="space-y-2">
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "auth-primary-button relative h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200",
                      "hover:brightness-110 active:scale-[0.99]",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner />
                        {copy.loading}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <LogIn className="size-4" aria-hidden="true" />
                        {copy.submit}
                      </span>
                    )}
                  </button>
                  {submitBadgeState !== "idle" && (
                    <div className="flex justify-end">
                      <MultiStateBadge state={submitBadgeState} />
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <form id="login-2fa-form" onSubmit={handleTwoFactorVerify} noValidate className="space-y-5">
                <OtpCodeInput
                  id="login-2fa-code"
                  label={copy.code}
                  value={twoFactorCode}
                  onChange={setTwoFactorCode}
                  hasError={!!formError}
                />

                {formError && (
                  <p className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="auth-primary-button relative h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      {copy.verifying}
                    </span>
                  ) : (
                    copy.verify
                  )}
                </button>

                <button
                  type="button"
                  className="auth-secondary-button h-10 w-full rounded-lg border text-sm font-medium transition-colors"
                  onClick={() => {
                    setTwoFactorRequired(false);
                    setTwoFactorCode("");
                    setFormError(null);
                    setTouched({ email: false, password: false });
                  }}
                >
                  {copy.useAnotherAccount}
                </button>
              </form>
            )}
          </div>

          {!twoFactorRequired && !setupQrCodeDataUrl && (
            <div className="auth-divider border-t px-8 py-5 text-center text-sm">
              {copy.footerPrefix}{" "}
              <Link
                href={localizedPath(locale, "register")}
                className="auth-link font-semibold underline-offset-4 transition-colors hover:underline"
              >
                {copy.footerAction}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
