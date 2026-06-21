"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import BackgroundGrid from "@/components/BackgroundGrid";
import DumbbellMonitor from "@/components/DumbbellMonitor";

type LoginPayload = {
  ok?: boolean;
  twoFactorRequired?: boolean;
  message?: string;
  error?: string;
};

function safeRedirect(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/es/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [redirectTo, setRedirectTo] = useState("/es/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    setRedirectTo(safeRedirect(new URLSearchParams(window.location.search).get("next")));

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { duration: 1, ease: "power4.out" },
      });

      timeline
        .fromTo(
          leftPanelRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1 },
        )
        .fromTo(
          cardRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1 },
          "-=0.7",
        );
    }, pageRef);

    return () => context.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    if (!cardRef.current) return;

    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

  async function completeLogin() {
    router.push(redirectTo as any);
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => null)) as LoginPayload | null;

      if (!response.ok) {
        setError(payload?.message ?? "Invalid email or password.");
        return;
      }

      if (payload?.twoFactorRequired) {
        setTwoFactorRequired(true);
        setPassword("");
        return;
      }

      await completeLogin();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const payload = (await response.json().catch(() => null)) as LoginPayload | null;

      if (!response.ok) {
        setError(payload?.message ?? "Invalid authentication code.");
        return;
      }

      await completeLogin();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main ref={pageRef} className="relative min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
      <BackgroundGrid />

      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 z-[1]" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 gap-12">
        <div ref={leftPanelRef} className="flex flex-col items-center lg:items-start w-full lg:w-1/2 text-center lg:text-left">
          <DumbbellMonitor />

          <h1 className="text-6xl font-black text-white mt-8">
            FORGE<span className="text-amber-500">.</span>
          </h1>

          <p className="text-zinc-400 mt-4 text-lg max-w-sm">
            Elite facility management. Engineered for performance and precision.
          </p>

          <p className="text-zinc-500 mt-2 text-sm font-mono">
            System Status:{" "}
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </p>
        </div>

        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-2xl transition-transform duration-300"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            {twoFactorRequired ? "Verify Access" : "Welcome Back"}
          </h2>
          <p className="text-zinc-400 mb-8">
            {twoFactorRequired
              ? "Enter the six-digit code from your authenticator."
              : "Access your facility control center."}
          </p>

          {!twoFactorRequired ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="login-email" className="block text-zinc-300 mb-2 text-sm">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-zinc-800 px-4 py-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-zinc-300 mb-2 text-sm">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-zinc-800 px-4 py-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Checking..." : "Access Dashboard"}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleTwoFactorVerify}>
              <div>
                <label htmlFor="login-2fa-code" className="block text-zinc-300 mb-2 text-sm">
                  Authentication Code
                </label>
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
                  className="w-full rounded-xl bg-black/40 border border-zinc-800 px-4 py-3 text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length !== 6}
                className="w-full py-4 rounded-xl bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
                onClick={() => {
                  setTwoFactorRequired(false);
                  setTwoFactorCode("");
                  setError(null);
                }}
              >
                Use another account
              </button>
            </form>
          )}

          <p className="text-center text-zinc-500 mt-6 text-sm">
            Need an account?{" "}
            <Link href="/register" className="text-amber-500 hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
