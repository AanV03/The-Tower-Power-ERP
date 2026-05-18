"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  UserPlus,
  Dumbbell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Password rule helpers ─────────────────────────────────────────── */
const rules = [
  { id: "length",  label: "Mínimo 8 caracteres",           test: (v: string) => v.length >= 8 },
  { id: "upper",   label: "Al menos una letra mayúscula",  test: (v: string) => /[A-Z]/.test(v) },
  { id: "number",  label: "Al menos un número",            test: (v: string) => /[0-9]/.test(v) },
  { id: "special", label: "Al menos un carácter especial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
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
  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Fortaleza de contraseña</span>
        {metCount > 0 && (
          <span
            className={cn(
              "text-xs font-medium",
              metCount === 1 && "text-red-500",
              metCount === 2 && "text-orange-400",
              metCount === 3 && "text-yellow-500",
              metCount === 4 && "text-emerald-500",
            )}
          >
            {strengthLabel[metCount]}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < metCount ? colors[metCount - 1] : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── InputField helper ──────────────────────────────────────────────── */
interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  icon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  autoComplete?: string;
  ariaDescribedBy?: string;
  hasError?: boolean;
}

function InputField({
  id, label, type = "text", placeholder, value, onChange, onBlur,
  error, icon, rightAddon, autoComplete, ariaDescribedBy, hasError,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={ariaDescribedBy}
          className={cn(
            "h-10 w-full rounded-lg border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[box-shadow,border-color] outline-none",
            icon ? "pl-9" : "pl-3",
            rightAddon ? "pr-10" : "pr-3",
            "focus:border-ring focus:ring-2 focus:ring-ring/30",
            hasError
              ? "border-destructive ring-2 ring-destructive/20"
              : "border-input",
          )}
        />
        {rightAddon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightAddon}</div>
        )}
      </div>
      {error && (
        <p id={ariaDescribedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function SignUpPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  /* Fields */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* Touch tracking */
  const [touched, setTouched] = useState({
    name: false, email: false, password: false, confirm: false,
  });

  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /* Validations */
  const metRules = rules.map((r) => ({ ...r, met: r.test(password) }));
  const metCount = metRules.filter((r) => r.met).length;
  const allRulesMet = metCount === rules.length;

  const showChecklist = touched.password && password.length > 0;

  const nameError = touched.name && name.trim().length < 2
    ? "El nombre debe tener al menos 2 caracteres"
    : undefined;

  const emailError = touched.email
    ? email.length === 0
      ? "El correo es obligatorio"
      : !validateEmail(email)
        ? "Ingresa un correo válido"
        : undefined
    : undefined;

  const passwordError = touched.password && password.length > 0 && !allRulesMet
    ? "La contraseña no cumple los requisitos"
    : touched.password && password.length === 0
      ? "La contraseña es obligatoria"
      : undefined;

  const confirmError = touched.confirm
    ? confirm.length === 0
      ? "Confirma tu contraseña"
      : confirm !== password
        ? "Las contraseñas no coinciden"
        : undefined
    : undefined;

  const isFormValid =
    name.trim().length >= 2 &&
    validateEmail(email) &&
    allRulesMet &&
    confirm === password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isFormValid) return;
    setIsLoading(true);
    /* TODO: connect auth provider */
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
  }

  return (
    <main
      id="signup-page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -right-32 size-[28rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--brand-orange)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-32 size-[28rem] rounded-full opacity-15 blur-3xl"
        style={{ background: "var(--brand-navy)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "var(--brand-orange)" }}
          >
            <Dumbbell className="size-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Crea tu cuenta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Únete a Gerpy ERP y empieza a gestionar tu gimnasio
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-card shadow-panel ring-1 ring-foreground/10">
          {/* Top accent stripe */}
          <div className="h-1 w-full" style={{ background: "var(--brand-orange)" }} />

          <div className="px-8 py-8">
            <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Name */}
              <InputField
                id="signup-name"
                label="Nombre completo"
                placeholder="Juan García"
                value={name}
                onChange={setName}
                onBlur={() => handleBlur("name")}
                hasError={!!nameError}
                error={nameError}
                ariaDescribedBy="signup-name-error"
                icon={<User className="size-4" />}
                autoComplete="name"
              />

              {/* Email */}
              <InputField
                id="signup-email"
                label="Correo electrónico"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={setEmail}
                onBlur={() => handleBlur("email")}
                hasError={!!emailError}
                error={emailError}
                ariaDescribedBy="signup-email-error"
                icon={<Mail className="size-4" />}
                autoComplete="email"
              />

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="size-4" />
                  </span>
                  <input
                    id="signup-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    aria-invalid={!!passwordError ? "true" : "false"}
                    aria-describedby="signup-pw-rules"
                    className={cn(
                      "h-10 w-full rounded-lg border bg-transparent pl-9 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[box-shadow,border-color] outline-none",
                      "focus:border-ring focus:ring-2 focus:ring-ring/30",
                      !!passwordError
                        ? "border-destructive ring-2 ring-destructive/20"
                        : "border-input",
                    )}
                  />
                  <button
                    type="button"
                    id="signup-toggle-password"
                    aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Password checklist */}
                {showChecklist && (
                  <div
                    id="signup-pw-rules"
                    className="mt-2 rounded-xl border border-border bg-muted/40 p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <StrengthBar metCount={metCount} />
                    <ul className="space-y-2 pt-1">
                      {metRules.map((r) => (
                        <RuleItem key={r.id} met={r.met} label={r.label} />
                      ))}
                    </ul>
                  </div>
                )}

                {passwordError && !showChecklist && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3 shrink-0" /> {passwordError}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="size-4" />
                  </span>
                  <input
                    id="signup-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onBlur={() => handleBlur("confirm")}
                    aria-invalid={!!confirmError ? "true" : "false"}
                    aria-describedby={confirmError ? "signup-confirm-error" : undefined}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-transparent pl-9 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[box-shadow,border-color] outline-none",
                      "focus:border-ring focus:ring-2 focus:ring-ring/30",
                      !!confirmError
                        ? "border-destructive ring-2 ring-destructive/20"
                        : confirm.length > 0 && confirm === password
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-input",
                    )}
                  />
                  <button
                    type="button"
                    id="signup-toggle-confirm"
                    aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirm.length > 0 && !confirmError && (
                  <p className="flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="size-3 shrink-0" /> Las contraseñas coinciden
                  </p>
                )}
                {confirmError && (
                  <p id="signup-confirm-error" className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3 shrink-0" /> {confirmError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={isLoading}
                className={cn(
                  "relative w-full h-10 rounded-lg text-sm font-semibold text-white transition-all duration-200 outline-none mt-2",
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
                    Creando cuenta…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="size-4" />
                    Crear cuenta
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-8 py-5 text-center text-sm text-muted-foreground bg-muted/30">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/${locale}/signin`}
              className="font-semibold hover:underline underline-offset-4 transition-colors"
              style={{ color: "var(--brand-orange)" }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al registrarte aceptas los{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Términos de uso
          </Link>{" "}
          y la{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
