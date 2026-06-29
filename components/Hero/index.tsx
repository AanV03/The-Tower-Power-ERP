"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CreditCard,
  Dumbbell,
  ShieldCheck,
  Users,
} from "lucide-react";
import BackgroundGrid from "../BackgroundGrid";
import AuroraBackground from "../AuroraBackground";

const heroStats = [
  { label: "Active members", value: "3,842", trend: "+12%" },
  { label: "Monthly revenue", value: "$84.6k", trend: "+18%" },
  { label: "Check-ins today", value: "716", trend: "Live" },
];

const operations = [
  { icon: Users, label: "Memberships", value: "Renewals queued" },
  { icon: CreditCard, label: "POS", value: "42 sales synced" },
  { icon: CalendarClock, label: "Classes", value: "91% occupancy" },
  { icon: ShieldCheck, label: "Access", value: "Devices online" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let active = true;

    import("gsap").then(({ gsap }) => {
      if (!active || !containerRef.current) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".char",
          {
            yPercent: 120,
            skewY: 8,
            opacity: 0,
          },
          {
            yPercent: 0,
            skewY: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.03,
            ease: "power4.out",
          }
        );
      }, containerRef);

      cleanup = () => ctx.revert();
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-zinc-950 flex items-center justify-center"
    >
      {/* Layer 1 */}
      <BackgroundGrid />
      <AuroraBackground />
      {/* Layer 2 */}
     

      {/* Layer 3 */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 z-[2]" />

      <div className="relative z-10 grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="flex flex-col items-start">
          <div className="mb-6 inline-flex items-center gap-2 border border-amber-400/25 bg-zinc-950/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
            Gym ERP platform
          </div>

          <h1
            ref={titleRef}
            className="flex max-w-5xl flex-wrap gap-x-3 overflow-hidden px-1 text-[clamp(3.2rem,15vw,7.5rem)] font-black uppercase leading-[0.9] tracking-normal text-white sm:gap-x-4 md:text-[clamp(4.6rem,9vw,8.5rem)]"
          >
            {"RUN EVERY CLUB".split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden py-1 sm:py-2"
              >
                {word.split("").map((char, j) => (
                  <span
                    key={j}
                    className="char inline-block will-change-transform"
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg md:text-xl">
            Gerpy centralizes memberships, access control, POS, classes,
            payroll, inventory, and finance for gyms that need one operating
            system across every branch.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={"/en/dashboard" as Route}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors duration-300 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              View dashboard
            </Link>
            <Link
              href={"/register" as Route}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors duration-300 hover:border-amber-400/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              Start setup
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="border border-white/10 bg-zinc-900/70 p-4"
              >
                <div className="text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  {stat.label}
                </div>
                <div className="mt-3 text-sm font-bold text-emerald-400">
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="border border-white/12 bg-zinc-950/90 p-5 shadow-2xl shadow-black/50">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  Operations command
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  Downtown branch
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Activity className="h-4 w-4" aria-hidden="true" />
                Live
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {operations.map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-white/10 bg-white/[0.04] p-4">
                  <Icon className="mb-4 h-5 w-5 text-amber-400" aria-hidden="true" />
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="mt-1 text-sm text-zinc-400">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-white/10 bg-black/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <BarChart3 className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  Revenue by hour
                </div>
                <BadgeCheck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="flex h-28 items-end gap-2">
                {[38, 54, 46, 72, 58, 88, 66, 94, 81, 70, 92, 76].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-amber-400/80"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 border border-amber-400/25 bg-amber-400/10 p-4">
              <div>
                <p className="text-sm font-bold text-white">
                  Low stock alert resolved
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Protein bars transferred from North branch.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                Synced
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
