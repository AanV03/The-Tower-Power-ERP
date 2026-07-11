"use client";

import {
  useCallback,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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

import { OtpCodeInput } from "@/components/auth/otp-code-input";
import { AuthShell } from "@/components/layout/auth-shell";
import {
  MultiStateBadge,
  type BadgeState,
} from "@/components/ui/multi-state-badge";
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
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "One special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

const strengthLabels = ["", "Weak", "Basic", "Fair", "Good", "Strong"];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function RuleItem({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-xs transition-colors duration-200",
        met ? "auth-success-text" : "auth-muted",
      )}
    >
      {met ? (
        <CheckCircle2
          className="auth-success-text size-3.5 shrink-0"
          aria-hidden="true"
        />
      ) : (
        <XCircle
          className="auth-muted size-3.5 shrink-0"
          aria-hidden="true"
        />
      )}

      <span>{label}</span>
    </li>
  );
}

function StrengthBar({ metCount }: { metCount: number }) {
  const colors = [
    "bg-destructive",
    "bg-warning",
    "bg-warning",
    "bg-success",
    "bg-success",
  ];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="auth-muted text-xs">Password strength</span>

        {metCount > 0 && (
          <span
            className={cn(
              "text-xs font-medium",
              metCount === 1 && "auth-error-text",
              metCount === 2 && "text-[var(--warning)]",
              metCount === 3 && "text-[var(--warning)]",
              metCount === 4 && "text-[var(--success)]",
              metCount === 5 && "auth-success-text",
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
              index < metCount
                ? colors[metCount - 1]
                : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
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
      <label
        htmlFor={id}
        className="auth-label block text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
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
            "auth-input h-10 w-full rounded-lg border py-2 text-sm outline-none transition-[box-shadow,border-color]",
            icon ? "pl-9" : "pl-3",
            rightAddon ? "pr-10" : "pr-3",
            hasError ? "auth-input-error" : "",
          )}
        />

        {rightAddon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAddon}
          </div>
        )}
      </div>

      {error && (
        <p
          id={ariaDescribedBy}
          className="auth-error-text flex items-center gap-1 text-xs"
        >
          <AlertCircle
            className="size-3 shrink-0"
            aria-hidden="true"
          />

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
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] =
    useState(false);

  const [submitBadgeState, setSubmitBadgeState] =
    useState<BadgeState>("idle");

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);

  const [setupQrCodeDataUrl, setSetupQrCodeDataUrl] =
    useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [touched, setTouched] = useState<
    Record<RegisterField, boolean>
  >({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const handleBlur = useCallback((field: RegisterField) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  }, []);

  const metRules = passwordRules.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));

  const metCount = metRules.filter((rule) => rule.met).length;
  const allRulesMet = metCount === passwordRules.length;
  const showChecklist = touched.password && password.length > 0;

  function validateClient() {
    const nextErrors = { ...emptyErrors };

    if (name.trim().length < 2) {
      nextErrors.name = "Full name is required.";
    }

    if (!validateEmail(email)) {
      nextErrors.email =
        email.length === 0
          ? "Email is required."
          : "Enter a valid email address.";
    }

    if (!allRulesMet) {
      nextErrors.password =
        "Password does not meet the requirements.";
    }

    if (confirm.length === 0) {
      nextErrors.confirm = "Confirm your password.";
    } else if (confirm !== password) {
      nextErrors.confirm = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  function applyServerErrors(
    payload: RegisterResponse | null,
  ) {
    const nextErrors = { ...emptyErrors };

    payload?.details?.forEach((issue) => {
      const field = issue.path?.[0];

      if (
        (field === "name" ||
          field === "email" ||
          field === "password") &&
        issue.message
      ) {
        nextErrors[field] = issue.message;
      }
    });

    setFieldErrors(nextErrors);

    setFormError(
      payload?.message ??
        payload?.error ??
        "Registration failed. Please try again.",
    );
  }

  async function startTwoFactorSetup() {
    const response = await fetch("/api/auth/2fa/generate", {
      method: "POST",
    });

    const payload = (await response
      .json()
      .catch(() => null)) as TwoFactorSetupResponse | null;

    if (
      !response.ok ||
      !payload?.ok ||
      !payload.qrCodeDataUrl
    ) {
      throw new Error(
        payload?.message ??
          "Could not generate 2FA setup.",
      );
    }

    setSetupQrCodeDataUrl(payload.qrCodeDataUrl);
    setSetupSecret(payload.secret ?? "");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError("");
    setTouched({
      name: true,
      email: true,
      password: true,
      confirm: true,
    });

    if (!validateClient()) {
      setSubmitBadgeState("error");
      return;
    }

    setSubmitBadgeState("processing");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as RegisterResponse | null;

      if (!response.ok) {
        applyServerErrors(payload);
        setSubmitBadgeState("error");
        return;
      }

      setSubmitBadgeState("success");

      await wait(450);
      await startTwoFactorSetup();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );

      setSubmitBadgeState("error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorVerify(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError("");

    if (twoFactorCode.length !== 6) {
      setFormError(
        "Enter the 6-digit authenticator code.",
      );

      return;
    }

    setIsVerifyingTwoFactor(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: twoFactorCode,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as TwoFactorSetupResponse | null;

      if (!response.ok || !payload?.ok) {
        setFormError(
          payload?.message ??
            "Invalid authentication code.",
        );

        return;
      }

      router.push("/es/dashboard");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not verify the authentication code.",
      );
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  }

  return (
    <AuthShell id="register-page">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="auth-icon-tile flex size-14 items-center justify-center rounded-2xl shadow-lg">
            {setupQrCodeDataUrl ? (
              <KeyRound
                className="size-7 text-white"
                aria-hidden="true"
              />
            ) : (
              <Dumbbell
                className="size-7 text-white"
                aria-hidden="true"
              />
            )}
          </div>

          <div>
            <h1 className="auth-heading text-2xl font-bold tracking-tight">
              {setupQrCodeDataUrl
                ? "Secure your account"
                : "Create your account"}
            </h1>

            <p className="auth-muted mt-1 text-sm">
              {setupQrCodeDataUrl
                ? "Scan the QR code and verify 2FA before entering the dashboard."
                : "Start managing your gym with The Tower Power."}
            </p>
          </div>
        </div>

        <div className="auth-card overflow-hidden rounded-2xl border ring-1 ring-[color:var(--auth-card-border)] backdrop-blur-xl">
          <div className="auth-accent-bar h-1 w-full" />

          <div className="px-8 py-8">
            {setupQrCodeDataUrl ? (
              <form
                id="register-2fa-form"
                onSubmit={handleTwoFactorVerify}
                noValidate
                className="space-y-5"
              >
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
                    Manual key:{" "}
                    <span className="font-mono">
                      {setupSecret}
                    </span>
                  </div>
                )}

                <OtpCodeInput
                  id="register-2fa-code"
                  label="Authenticator code"
                  value={twoFactorCode}
                  onChange={setTwoFactorCode}
                  hasError={Boolean(formError)}
                />

                {formError && (
                  <p
                    className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
                    role="alert"
                  >
                    <AlertCircle
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />

                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    isVerifyingTwoFactor ||
                    twoFactorCode.length !== 6
                  }
                  className="auth-primary-button relative mt-2 h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
              <form
                id="register-form"
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
              >
                <InputField
                  id="register-name"
                  label="Full name"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(value) => {
                    setName(value);
                    setSubmitBadgeState("idle");
                  }}
                  onBlur={() => handleBlur("name")}
                  hasError={Boolean(fieldErrors.name)}
                  error={fieldErrors.name}
                  ariaDescribedBy="register-name-error"
                  icon={
                    <User
                      className="size-4"
                      aria-hidden="true"
                    />
                  }
                  autoComplete="name"
                />

                <InputField
                  id="register-email"
                  label="Email"
                  type="email"
                  placeholder="you@gym.com"
                  value={email}
                  onChange={(value) => {
                    setEmail(value);
                    setSubmitBadgeState("idle");
                  }}
                  onBlur={() => handleBlur("email")}
                  hasError={Boolean(fieldErrors.email)}
                  error={fieldErrors.email}
                  ariaDescribedBy="register-email-error"
                  icon={
                    <Mail
                      className="size-4"
                      aria-hidden="true"
                    />
                  }
                  autoComplete="email"
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="register-password"
                    className="auth-label block text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock
                        className="size-4"
                        aria-hidden="true"
                      />
                    </span>

                    <input
                      id="register-password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setSubmitBadgeState("idle");
                      }}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={
                        fieldErrors.password
                          ? "true"
                          : "false"
                      }
                      aria-describedby="register-password-rules"
                      className={cn(
                        "auth-input h-10 w-full rounded-lg border py-2 pl-9 pr-10 text-sm outline-none transition-[box-shadow,border-color]",
                        fieldErrors.password
                          ? "auth-input-error"
                          : "",
                      )}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      className="auth-icon-button absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {showChecklist && (
                    <div
                      id="register-password-rules"
                      className="auth-card-rule mt-2 space-y-3 rounded-xl border p-4"
                    >
                      <StrengthBar
                        metCount={metCount}
                      />

                      <ul className="space-y-2 pt-1">
                        {metRules.map((rule) => (
                          <RuleItem
                            key={rule.id}
                            met={rule.met}
                            label={rule.label}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {fieldErrors.password &&
                    !showChecklist && (
                      <p className="auth-error-text flex items-center gap-1 text-xs">
                        <AlertCircle
                          className="size-3 shrink-0"
                          aria-hidden="true"
                        />

                        {fieldErrors.password}
                      </p>
                    )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="register-confirm"
                    className="auth-label block text-sm font-medium"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <span className="auth-field-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock
                        className="size-4"
                        aria-hidden="true"
                      />
                    </span>

                    <input
                      id="register-confirm"
                      type={
                        showConfirm ? "text" : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(event) => {
                        setConfirm(event.target.value);
                        setSubmitBadgeState("idle");
                      }}
                      onBlur={() => handleBlur("confirm")}
                      aria-invalid={
                        fieldErrors.confirm
                          ? "true"
                          : "false"
                      }
                      aria-describedby={
                        fieldErrors.confirm
                          ? "register-confirm-error"
                          : undefined
                      }
                      className={cn(
                        "auth-input h-10 w-full rounded-lg border py-2 pl-9 pr-10 text-sm outline-none transition-[box-shadow,border-color]",
                        fieldErrors.confirm
                          ? "auth-input-error"
                          : confirm.length > 0 &&
                              confirm === password
                            ? "auth-input-success"
                            : "",
                      )}
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirm
                          ? "Hide confirmation"
                          : "Show confirmation"
                      }
                      onClick={() =>
                        setShowConfirm(
                          (current) => !current,
                        )
                      }
                      className="auth-icon-button absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {confirm.length > 0 &&
                    !fieldErrors.confirm && (
                      <p className="auth-success-text flex items-center gap-1 text-xs">
                        <CheckCircle2
                          className="size-3 shrink-0"
                          aria-hidden="true"
                        />

                        Passwords match
                      </p>
                    )}

                  {fieldErrors.confirm && (
                    <p
                      id="register-confirm-error"
                      className="auth-error-text flex items-center gap-1 text-xs"
                    >
                      <AlertCircle
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />

                      {fieldErrors.confirm}
                    </p>
                  )}
                </div>

                {formError && (
                  <p
                    className="auth-error-alert flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
                    role="alert"
                  >
                    <AlertCircle
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />

                    {formError}
                  </p>
                )}

                <div className="space-y-2">
                  <button
                    id="register-submit"
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "auth-primary-button relative mt-2 h-10 w-full rounded-lg text-sm font-semibold outline-none transition-all duration-200",
                      "hover:brightness-110 active:scale-[0.99]",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <UserPlus
                          className="size-4"
                          aria-hidden="true"
                        />

                        Create account
                      </span>
                    )}
                  </button>

                  {submitBadgeState !== "idle" && (
                    <div className="flex justify-end">
                      <MultiStateBadge
                        state={submitBadgeState}
                      />
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {!setupQrCodeDataUrl && (
            <div className="auth-divider border-t px-8 py-5 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="auth-link font-semibold underline-offset-4 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {!setupQrCodeDataUrl && (
          <p className="auth-muted mt-6 text-center text-xs">
            By signing up you accept the{" "}
            <Link
              href="#"
              className="underline underline-offset-4 transition-colors hover:text-[var(--auth-foreground)]"
            >
              Terms of use
            </Link>{" "}
            and the{" "}
            <Link
              href="#"
              className="underline underline-offset-4 transition-colors hover:text-[var(--auth-foreground)]"
            >
              Privacy policy
            </Link>
            .
          </p>
        )}
      </div>
    </AuthShell>
  );
}