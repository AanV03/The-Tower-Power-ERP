"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Dumbbell, Mail } from "lucide-react";

import BackgroundGrid from "@/components/BackgroundGrid";
import { cn } from "@/lib/utils";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signInHref() {
  return "/login" as Route;
}

export function PasswordRecoveryForm() {
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
      setErrorMessage(email.length === 0 ? "Email is required." : "Enter a valid email address.");
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white">
      <BackgroundGrid />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "var(--brand-orange)" }}
          >
            <Dumbbell className="size-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Password Recovery
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Enter your email and Gerpy will send recovery instructions if the account exists.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="h-1 w-full" style={{ background: "var(--brand-orange)" }} />

          <form onSubmit={handleSubmit} noValidate className="space-y-5 px-8 py-8">
            <div className="space-y-1.5">
              <label htmlFor="password-recovery-email" className="block text-sm font-medium text-zinc-100">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <input
                  id="password-recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@gym.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  onBlur={() => setTouched(true)}
                  aria-invalid={emailEmpty || emailInvalid ? "true" : "false"}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-black/30 px-3 py-2 pl-9 text-sm text-white placeholder:text-zinc-500 outline-none transition-[box-shadow,border-color]",
                    "focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25",
                    emailEmpty || emailInvalid ? "border-red-400 ring-2 ring-red-400/20" : "border-white/10"
                  )}
                />
              </div>
            </div>

            {successMessage && (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200" role="status">
                <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                {successMessage}
              </p>
            )}

            {errorMessage && (
              <p className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200" role="alert">
                <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "relative h-10 w-full rounded-lg text-sm font-semibold text-white outline-none transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                "hover:brightness-110 active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
              style={{ background: "var(--brand-orange)" }}
            >
              {isSubmitting ? "Sending recovery email..." : "Send recovery email"}
            </button>
          </form>

          <div className="border-t border-white/10 bg-black/20 px-8 py-5 text-center text-sm text-zinc-400">
            Remembered your password?{" "}
            <Link
              href={signInHref()}
              className="font-semibold underline-offset-4 transition-colors hover:underline"
              style={{ color: "var(--brand-orange)" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
