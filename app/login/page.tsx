"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Dumbbell, Eye, EyeOff, KeyRound, LogIn } from "lucide-react";

import BackgroundGrid from "@/components/BackgroundGrid";
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

const copy = {
  title: "Welcome back",
  subtitle: "Sign in to your Gerpy ERP account",
  twoFactorTitle: "Verify access",
  twoFactorSubtitle: "Enter the 6-digit code from your authenticator app.",
  setupTitle: "Secure your account",
  setupSubtitle: "Scan the QR code and verify 2FA before entering Gerpy.",
  email: "Email",
  password: "Password",
  code: "Authentication code",
  emailPlaceholder: "you@gym.com",
  passwordPlaceholder: "Password",
  forgotPassword: "Forgot your password?",
  submit: "Sign in",
  loading: "Signing in...",
  verify: "Verify code",
  verifying: "Verifying...",
  enableTwoFactor: "Enable 2FA and continue",
  useAnotherAccount: "Use another account",
  footerPrefix: "Do not have an account?",
  footerAction: "Create account",
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  passwordRequired: "Password is required.",
  invalidCredentials: "Invalid credentials or suspended user.",
  invalidCode: "Invalid authentication code.",
  showPassword: "Show password",
  hidePassword: "Hide password",
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeRedirect(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/es/dashboard";
}

function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1 text-xs text-red-300">
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

export default function LoginPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState("/es/dashboard");
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

  useEffect(() => {
    setRedirectTo(safeRedirect(new URLSearchParams(window.location.search).get("next")));
  }, []);

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
      throw new Error(payload?.message ?? "Could not generate 2FA setup.");
    }

    setSetupQrCodeDataUrl(payload.qrCodeDataUrl);
    setSetupSecret(payload.secret ?? "");
    setTwoFactorCode("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

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
        return;
      }

      if (payload?.twoFactorRequired) {
        setTwoFactorRequired(true);
        setPassword("");
        return;
      }

      if (payload?.twoFactorSetupRequired) {
        await startTwoFactorSetup();
        setPassword("");
        return;
      }

      await completeLogin();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : copy.invalidCredentials);
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
    <main
      id="login-page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white"
    >
      <BackgroundGrid />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "var(--brand-orange)" }}
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
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {setupQrCodeDataUrl ? copy.setupTitle : twoFactorRequired ? copy.twoFactorTitle : copy.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {setupQrCodeDataUrl ? copy.setupSubtitle : twoFactorRequired ? copy.twoFactorSubtitle : copy.subtitle}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="h-1 w-full" style={{ background: "var(--brand-orange)" }} />

          <div className="px-8 py-8">
            {setupQrCodeDataUrl ? (
              <form id="login-2fa-setup-form" onSubmit={handleTwoFactorSetupVerify} noValidate className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupQrCodeDataUrl}
                    alt="Gerpy 2FA QR code"
                    className="mx-auto aspect-square w-full max-w-64 rounded-lg"
                  />
                </div>

                {setupSecret && (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-zinc-300">
                    Manual key: <span className="font-mono text-zinc-100">{setupSecret}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="login-2fa-setup-code" className="block text-sm font-medium text-zinc-100">
                    {copy.code}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <KeyRound className="size-4" aria-hidden="true" />
                    </span>
                    <input
                      id="login-2fa-setup-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pl-9 text-center font-mono text-sm tracking-[0.35em] text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color] focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="relative h-10 w-full rounded-lg text-sm font-semibold text-white outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "var(--brand-orange)" }}
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
                  <label htmlFor="login-email" className="block text-sm font-medium text-zinc-100">
                    {copy.email}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder={copy.emailPlaceholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={emailEmpty || emailInvalid ? "true" : "false"}
                    aria-describedby={emailEmpty || emailInvalid ? "login-email-error" : undefined}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color]",
                      "focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25",
                      emailEmpty || emailInvalid
                        ? "border-red-400 ring-2 ring-red-400/20"
                        : "border-white/10",
                    )}
                  />
                  {emailEmpty && <FieldError id="login-email-error">{copy.emailRequired}</FieldError>}
                  {emailInvalid && <FieldError id="login-email-error">{copy.emailInvalid}</FieldError>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-zinc-100">
                    {copy.password}
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={copy.passwordPlaceholder}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={passwordError ? "true" : "false"}
                      aria-describedby={passwordError ? "login-password-error" : undefined}
                      className={cn(
                        "h-10 w-full rounded-lg border bg-black/30 px-3 py-2 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color]",
                        "focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25",
                        passwordError
                          ? "border-red-400 ring-2 ring-red-400/20"
                          : "border-white/10",
                      )}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordError && <FieldError id="login-password-error">{copy.passwordRequired}</FieldError>}
                </div>

                {formError && (
                  <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <div className="flex justify-end">
                  <Link
                    href="#"
                    className="text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {copy.forgotPassword}
                  </Link>
                </div>

                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "relative h-10 w-full rounded-lg text-sm font-semibold text-white outline-none transition-all duration-200",
                    "focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                    "hover:brightness-110 active:scale-[0.99]",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                  style={{ background: "var(--brand-orange)" }}
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
              </form>
            ) : (
              <form id="login-2fa-form" onSubmit={handleTwoFactorVerify} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="login-2fa-code" className="block text-sm font-medium text-zinc-100">
                    {copy.code}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <KeyRound className="size-4" aria-hidden="true" />
                    </span>
                    <input
                      id="login-2fa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 pl-9 text-center font-mono text-sm tracking-[0.35em] text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color] focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="relative h-10 w-full rounded-lg text-sm font-semibold text-white outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "var(--brand-orange)" }}
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
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/20 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
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
            <div className="border-t border-white/10 bg-black/20 px-8 py-5 text-center text-sm text-zinc-400">
              {copy.footerPrefix}{" "}
              <Link
                href="/register"
                className="font-semibold underline-offset-4 transition-colors hover:underline"
                style={{ color: "var(--brand-orange)" }}
              >
                {copy.footerAction}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
