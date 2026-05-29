"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import type { Route } from "next";
import { Eye, EyeOff, LogIn, Dumbbell, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ─── Password rule helpers ─────────────────────────────────────────── */
const rules = [
  { id: "length", test: (v: string) => v.length >= 8 },
  { id: "upper", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", test: (v: string) => /[0-9]/.test(v) },
  { id: "special", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── RuleItem ───────────────────────────────────────────────────────── */
function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-xs transition-colors duration-200",
        met ? "text-emerald-500" : "text-muted-foreground",
      )}
    >
      {met ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
      ) : (
        <XCircle className="size-3.5 shrink-0 text-muted-foreground/60" />
      )}
      <span>{label}</span>
    </li>
  );
}

/* ─── Strength bar ───────────────────────────────────────────────────── */
function StrengthBar({ metCount }: { metCount: number }) {
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  return (
    <div className="flex gap-1 mt-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            i < metCount ? colors[metCount - 1] : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function SignInPage() {
  const params = useParams();
  const router = useRouter();
  const localeParam = (params?.locale as string) ?? defaultLocale;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = getDictionary(locale);
  const auth = dictionary.auth;
  const callbackUrl = `/${locale}/dashboard` as Route;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* live validation */
  const emailError = touched.email && email.length > 0 && !validateEmail(email);
  const emailEmpty = touched.email && email.length === 0;

  const metRules = rules.map((r) => ({ ...r, label: auth.passwordRules[r.id], met: r.test(password) }));
  const metCount = metRules.filter((r) => r.met).length;
  const showChecklist = false;
  const passwordError = touched.password && password.length === 0;

  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const isFormValid = validateEmail(email) && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setTouched({ email: true, password: true });
    if (!isFormValid) return;
    setIsLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setIsLoading(false);

    if (result?.error) {
      setFormError("Credenciales invalidas o usuario suspendido.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "discord") {
    await signIn(provider, { callbackUrl });
  }

  return (
    <main
      id="signin-page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--brand-orange)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 size-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "var(--brand-navy)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "var(--brand-orange)" }}
          >
            <Dumbbell className="size-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {auth.signin.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {auth.signin.subtitle}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-card shadow-panel ring-1 ring-foreground/10">
          {/* Top accent stripe */}
          <div className="h-1 w-full" style={{ background: "var(--brand-orange)" }} />

          <div className="px-8 py-8">
            <form id="signin-form" onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="signin-email" className="block text-sm font-medium text-foreground">
                  {auth.fields.email}
                </label>
                <div className="relative">
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder={auth.placeholders.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={emailError || emailEmpty ? "true" : "false"}
                    aria-describedby={emailError || emailEmpty ? "signin-email-error" : undefined}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[box-shadow,border-color] outline-none",
                      "focus:border-ring focus:ring-2 focus:ring-ring/30",
                      emailError || emailEmpty
                        ? "border-destructive ring-2 ring-destructive/20"
                        : "border-input",
                    )}
                  />
                </div>
                {emailEmpty && (
                  <p id="signin-email-error" className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" /> {auth.errors.emailRequired}
                  </p>
                )}
                {emailError && (
                  <p id="signin-email-error" className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" /> {auth.errors.emailInvalid}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="signin-password" className="block text-sm font-medium text-foreground">
                  {auth.fields.password}
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={auth.placeholders.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby="signin-pw-rules"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-transparent px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-[box-shadow,border-color] outline-none",
                      "focus:border-ring focus:ring-2 focus:ring-ring/30",
                      passwordError
                        ? "border-destructive ring-2 ring-destructive/20"
                        : "border-input",
                    )}
                  />
                  <button
                    type="button"
                    id="signin-toggle-password"
                    aria-label={showPw ? auth.actions.hidePassword : auth.actions.showPassword}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Checklist & strength bar */}
                {showChecklist && (
                  <div
                    id="signin-pw-rules"
                    className="mt-2 rounded-lg border border-border bg-muted/40 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <StrengthBar metCount={metCount} />
                    <ul className="space-y-1.5 pt-1">
                      {metRules.map((r) => (
                        <RuleItem key={r.id} met={r.met} label={r.label} />
                      ))}
                    </ul>
                  </div>
                )}
                {passwordError && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" /> {auth.errors.passwordRequired}
                  </p>
                )}
              </div>

              {formError && (
                <p className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="size-3 shrink-0" /> {formError}
                </p>
              )}

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  {auth.signin.forgotPassword}
                </Link>
              </div>

              {/* Submit */}
              <button
                id="signin-submit"
                type="submit"
                disabled={isLoading}
                className={cn(
                  "relative w-full h-10 rounded-lg text-sm font-semibold text-white transition-all duration-200 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "hover:brightness-110 active:scale-[0.99]",
                )}
                style={{ background: "var(--brand-orange)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {auth.signin.loading}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="size-4" />
                    {auth.signin.submit}
                  </span>
                )}
              </button>
            </form>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className="h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Continuar con Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("discord")}
                className="h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Continuar con Discord
              </button>
            </div>
          </div>

          {/* Divider footer */}
          <div className="border-t border-border px-8 py-5 text-center text-sm text-muted-foreground bg-muted/30">
            {auth.signin.footerPrefix}{" "}
            <Link
              href={`/${locale}/signup`}
              className="font-semibold text-foreground hover:underline underline-offset-4 transition-colors"
              style={{ color: "var(--brand-orange)" }}
            >
              {auth.signin.footerAction}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {auth.legal.continuePrefix}{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            {auth.legal.terms}
          </Link>{" "}
          {auth.legal.and}{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            {auth.legal.privacy}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
