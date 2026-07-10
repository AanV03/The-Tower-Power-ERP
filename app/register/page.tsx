"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
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
  Mail,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";

import BackgroundGrid from "@/components/BackgroundGrid";
import { cn } from "@/lib/utils";

type RegisterField = "name" | "email" | "password" | "confirm";

type RegisterResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  twoFactorSetupRequired?: boolean;
  details?: Array<{
    path?: Array<string | number>;
    message?: string;
  }>;
};

type TwoFactorSetupResponse = {
  ok?: boolean;
  message?: string;
  secret?: string;
  qrCodeDataUrl?: string;
};

const emptyErrors: Record<RegisterField, string> = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value: string) => /[0-9]/.test(value) },
  { id: "special", label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

const strengthLabels = ["", "Weak", "Basic", "Fair", "Good", "Strong"];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-xs transition-colors duration-200",
        met ? "text-emerald-400" : "text-zinc-500",
      )}
    >
      {met ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
      ) : (
        <XCircle className="size-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
      )}
      <span>{label}</span>
    </li>
  );
}

function StrengthBar({ metCount }: { metCount: number }) {
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-emerald-500"];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Password strength</span>
        {metCount > 0 && (
          <span
            className={cn(
              "text-xs font-medium",
              metCount === 1 && "text-red-400",
              metCount === 2 && "text-orange-400",
              metCount === 3 && "text-yellow-400",
              metCount === 4 && "text-lime-400",
              metCount === 5 && "text-emerald-400",
            )}
          >
            {strengthLabels[metCount]}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: passwordRules.length }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              index < metCount ? colors[metCount - 1] : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
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

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  icon?: ReactNode;
  rightAddon?: ReactNode;
  autoComplete?: string;
  ariaDescribedBy?: string;
  hasError?: boolean;
}

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  rightAddon,
  autoComplete,
  ariaDescribedBy,
  hasError,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-100">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={ariaDescribedBy}
          className={cn(
            "h-10 w-full rounded-lg border bg-black/30 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color]",
            icon ? "pl-9" : "pl-3",
            rightAddon ? "pr-10" : "pr-3",
            "focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25",
            hasError ? "border-red-400 ring-2 ring-red-400/20" : "border-white/10",
          )}
        />
        {rightAddon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightAddon}</div>}
      </div>
      {error && (
        <p id={ariaDescribedBy} className="flex items-center gap-1 text-xs text-red-300">
          <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [setupQrCodeDataUrl, setSetupQrCodeDataUrl] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [touched, setTouched] = useState<Record<RegisterField, boolean>>({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const handleBlur = useCallback((field: RegisterField) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }, []);

  const metRules = passwordRules.map((rule) => ({ ...rule, met: rule.test(password) }));
  const metCount = metRules.filter((rule) => rule.met).length;
  const allRulesMet = metCount === passwordRules.length;
  const showChecklist = touched.password && password.length > 0;

  function validateClient() {
    const nextErrors = { ...emptyErrors };

    if (name.trim().length < 2) {
      nextErrors.name = "Full name is required.";
    }

    if (!validateEmail(email)) {
      nextErrors.email = email.length === 0 ? "Email is required." : "Enter a valid email address.";
    }

    if (!allRulesMet) {
      nextErrors.password = "Password does not meet the requirements.";
    }

    if (confirm.length === 0) {
      nextErrors.confirm = "Confirm your password.";
    } else if (confirm !== password) {
      nextErrors.confirm = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  function applyServerErrors(payload: RegisterResponse | null) {
    const nextErrors = { ...emptyErrors };

    payload?.details?.forEach((issue) => {
      const field = issue.path?.[0];
      if (
        (field === "name" || field === "email" || field === "password") &&
        issue.message
      ) {
        nextErrors[field] = issue.message;
      }
    });

    setFieldErrors(nextErrors);
    setFormError(payload?.message ?? "Registration failed. Please try again.");
  }

  async function startTwoFactorSetup() {
    const response = await fetch("/api/auth/2fa/generate", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as TwoFactorSetupResponse | null;

    if (!response.ok || !payload?.ok || !payload.qrCodeDataUrl) {
      throw new Error(payload?.message ?? "Could not generate 2FA setup.");
    }

    setSetupQrCodeDataUrl(payload.qrCodeDataUrl);
    setSetupSecret(payload.secret ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (!validateClient()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const payload = (await response.json().catch(() => null)) as RegisterResponse | null;

      if (!response.ok) {
        applyServerErrors(payload);
        return;
      }

      await startTwoFactorSetup();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (twoFactorCode.length !== 6) {
      setFormError("Enter the 6-digit authenticator code.");
      return;
    }

    setIsVerifyingTwoFactor(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const payload = (await response.json().catch(() => null)) as TwoFactorSetupResponse | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.message ?? "Invalid authentication code.");
        return;
      }

      router.push("/es/dashboard");
      router.refresh();
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  }

  return (
    <main
      id="register-page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white"
    >
      <BackgroundGrid />
      <div className="absolute inset-0 z-1 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-zinc-950" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "var(--brand-orange)" }}
          >
            {setupQrCodeDataUrl ? (
              <KeyRound className="size-7 text-white" aria-hidden="true" />
            ) : (
              <Dumbbell className="size-7 text-white" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {setupQrCodeDataUrl ? "Secure your account" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {setupQrCodeDataUrl
                ? "Scan the QR code and verify 2FA before entering the dashboard."
                : "Start managing your gym with Gerpy ERP."}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="h-1 w-full" style={{ background: "var(--brand-orange)" }} />

          <div className="px-8 py-8">
            {setupQrCodeDataUrl ? (
              <form id="register-2fa-form" onSubmit={handleTwoFactorVerify} noValidate className="space-y-5">
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

                <InputField
                  id="register-2fa-code"
                  label="Authenticator code"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(value) => setTwoFactorCode(value.replace(/\D/g, "").slice(0, 6))}
                  onBlur={() => undefined}
                  hasError={false}
                  icon={<KeyRound className="size-4" aria-hidden="true" />}
                  autoComplete="one-time-code"
                />

                {formError && (
                  <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200" role="alert">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingTwoFactor || twoFactorCode.length !== 6}
                  className="relative mt-2 h-10 w-full rounded-lg text-sm font-semibold text-white outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "var(--brand-orange)" }}
                >
                  {isVerifyingTwoFactor ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Verifying...
                    </span>
                  ) : (
                    "Enable 2FA and continue"
                  )}
                </button>
              </form>
            ) : (
            <form id="register-form" onSubmit={handleSubmit} noValidate className="space-y-5">
              <InputField
                id="register-name"
                label="Full name"
                placeholder="Alex Rivera"
                value={name}
                onChange={setName}
                onBlur={() => handleBlur("name")}
                hasError={!!fieldErrors.name}
                error={fieldErrors.name}
                ariaDescribedBy="register-name-error"
                icon={<User className="size-4" aria-hidden="true" />}
                autoComplete="name"
              />

              <InputField
                id="register-email"
                label="Email"
                type="email"
                placeholder="you@gym.com"
                value={email}
                onChange={setEmail}
                onBlur={() => handleBlur("email")}
                hasError={!!fieldErrors.email}
                error={fieldErrors.email}
                ariaDescribedBy="register-email-error"
                icon={<Mail className="size-4" aria-hidden="true" />}
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <label htmlFor="register-password" className="block text-sm font-medium text-zinc-100">
                  Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Lock className="size-4" aria-hidden="true" />
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={() => handleBlur("password")}
                    aria-invalid={fieldErrors.password ? "true" : "false"}
                    aria-describedby="register-password-rules"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-black/30 py-2 pl-9 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color]",
                      "focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25",
                      fieldErrors.password ? "border-red-400 ring-2 ring-red-400/20" : "border-white/10",
                    )}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {showChecklist && (
                  <div
                    id="register-password-rules"
                    className="mt-2 space-y-3 rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <StrengthBar metCount={metCount} />
                    <ul className="space-y-2 pt-1">
                      {metRules.map((rule) => (
                        <RuleItem key={rule.id} met={rule.met} label={rule.label} />
                      ))}
                    </ul>
                  </div>
                )}

                {fieldErrors.password && !showChecklist && (
                  <p className="flex items-center gap-1 text-xs text-red-300">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-confirm" className="block text-sm font-medium text-zinc-100">
                  Confirm password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Lock className="size-4" aria-hidden="true" />
                  </span>
                  <input
                    id="register-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    onBlur={() => handleBlur("confirm")}
                    aria-invalid={fieldErrors.confirm ? "true" : "false"}
                    aria-describedby={fieldErrors.confirm ? "register-confirm-error" : undefined}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-black/30 py-2 pl-9 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color]",
                      "focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25",
                      fieldErrors.confirm
                        ? "border-red-400 ring-2 ring-red-400/20"
                        : confirm.length > 0 && confirm === password
                          ? "border-emerald-400 ring-2 ring-emerald-400/20"
                          : "border-white/10",
                    )}
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
                    onClick={() => setShowConfirm((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {confirm.length > 0 && !fieldErrors.confirm && (
                  <p className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                    Passwords match
                  </p>
                )}
                {fieldErrors.confirm && (
                  <p id="register-confirm-error" className="flex items-center gap-1 text-xs text-red-300">
                    <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                    {fieldErrors.confirm}
                  </p>
                )}
              </div>

              {formError && (
                <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200" role="alert">
                  <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                  {formError}
                </p>
              )}

              <button
                id="register-submit"
                type="submit"
                disabled={isLoading}
                className={cn(
                  "relative mt-2 h-10 w-full rounded-lg text-sm font-semibold text-white outline-none transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                  "hover:brightness-110 active:scale-[0.99]",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
                style={{ background: "var(--brand-orange)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="size-4" aria-hidden="true" />
                    Create account
                  </span>
                )}
              </button>
            </form>
            )}
          </div>

          {!setupQrCodeDataUrl && (
          <div className="border-t border-white/10 bg-black/20 px-8 py-5 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold underline-offset-4 transition-colors hover:underline"
              style={{ color: "var(--brand-orange)" }}
            >
              Sign in
            </Link>
          </div>
          )}
        </div>

        {!setupQrCodeDataUrl && (
        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing up you accept the{" "}
          <Link href="#" className="underline underline-offset-4 transition-colors hover:text-zinc-300">
            Terms of use
          </Link>{" "}
          and the{" "}
          <Link href="#" className="underline underline-offset-4 transition-colors hover:text-zinc-300">
            Privacy policy
          </Link>
          .
        </p>
        )}
      </div>
    </main>
  );
}
