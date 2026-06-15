"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";

type RegisterField = "gymName" | "name" | "email" | "password";

type RegisterResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  details?: Array<{
    path?: Array<string | number>;
    message?: string;
  }>;
};

const emptyErrors: Record<RegisterField, string> = {
  gymName: "",
  name: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [gymName, setGymName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);

  function validateClient() {
    const nextErrors = { ...emptyErrors };

    if (gymName.trim().length < 3) {
      nextErrors.gymName = "Gym name must be at least 3 characters.";
    }

    if (name.trim().length < 2) {
      nextErrors.name = "Full name is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  function applyServerErrors(payload: RegisterResponse | null) {
    const nextErrors = { ...emptyErrors };

    payload?.details?.forEach((issue) => {
      const field = issue.path?.[0];
      if (
        (field === "gymName" || field === "name" || field === "email" || field === "password") &&
        issue.message
      ) {
        nextErrors[field] = issue.message;
      }
    });

    setFieldErrors(nextErrors);
    setFormError(payload?.message ?? "Registration failed. Please try again.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!validateClient()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymName: gymName.trim(),
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

      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
      <BackgroundGrid />

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-zinc-400 mb-8">Join the elite training facility.</p>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="register-gym-name" className="block text-zinc-300 mb-2">
              Gym Name
            </label>
            <input
              id="register-gym-name"
              type="text"
              value={gymName}
              onChange={(event) => setGymName(event.target.value)}
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500"
              aria-invalid={fieldErrors.gymName ? "true" : "false"}
              aria-describedby={fieldErrors.gymName ? "register-gym-name-error" : undefined}
            />
            {fieldErrors.gymName && (
              <p id="register-gym-name-error" className="mt-2 text-sm text-red-300">
                {fieldErrors.gymName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-name" className="block text-zinc-300 mb-2">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500"
              aria-invalid={fieldErrors.name ? "true" : "false"}
              aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="register-name-error" className="mt-2 text-sm text-red-300">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="block text-zinc-300 mb-2">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500"
              aria-invalid={fieldErrors.email ? "true" : "false"}
              aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="register-email-error" className="mt-2 text-sm text-red-300">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-zinc-300 mb-2">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500"
              aria-invalid={fieldErrors.password ? "true" : "false"}
              aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
            />
            {fieldErrors.password && (
              <p id="register-password-error" className="mt-2 text-sm text-red-300">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {formError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold uppercase tracking-wider hover:bg-amber-400 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-zinc-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-amber-500 hover:underline">Log in</a>
        </p>
      </div>
    </main>
  );
}
