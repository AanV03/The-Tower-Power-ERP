"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { gsap } from "gsap";
import { animate, motion } from "framer-motion";
import { AuthBackground } from "@/components/backgrounds/auth-background";

const heroStats = [
  { label: "Active members", value: 3842, trend: "+12%" },
  { label: "Monthly revenue", value: 84.6, prefix: "$", suffix: "k", decimals: 1, trend: "+18%" },
  { label: "Check-ins today", value: 716, trend: "Live" },
];

const operations = [
  { icon: Users, label: "Memberships", value: "Renewals queued" },
  { icon: CreditCard, label: "POS", value: "42 sales synced" },
  { icon: CalendarClock, label: "Classes", value: "91% occupancy" },
  { icon: ShieldCheck, label: "Access", value: "Devices online" },
];

type AnimateNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
};

function formatAnimatedNumber(
  value: number,
  prefix: string,
  suffix: string,
  decimals: number
) {
  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("en-US");

  return `${prefix}${formatted}${suffix}`;
}

function AnimateNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 0,
}: AnimateNumberProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    formatAnimatedNumber(0, prefix, suffix, decimals)
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(formatAnimatedNumber(value, prefix, suffix, decimals));
      return;
    }

    const controls = animate(0, value, {
      duration: 1.15,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(formatAnimatedNumber(latest, prefix, suffix, decimals));
      },
    });

    return () => controls.stop();
  }, [decimals, delay, prefix, suffix, value]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      {displayValue}
    </motion.span>
  );
}

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
      className="landing-hero relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[var(--landing-background)] px-4 py-28 sm:px-6 sm:py-32 lg:px-8"
    >
      {/* Layer 1 */}
      <AuthBackground variant="hero" />
      {/* Layer 2 */}
     

      {/* Layer 3 — soft edge vignette, keeps center colorful */}

      <div className="relative z-10 grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="flex min-w-0 flex-col items-start">
          <h1
            ref={titleRef}
            className="flex max-w-5xl flex-wrap gap-x-2 overflow-hidden px-1 text-[clamp(2.65rem,14vw,7.5rem)] font-black uppercase leading-[0.92] tracking-normal text-[var(--landing-text)] sm:gap-x-4 sm:text-[clamp(3.7rem,10vw,8rem)] lg:text-[clamp(4.6rem,8.6vw,8.5rem)]"
          >
            {"ALL GYM OPS ONE PLATFORM".split(" ").map((word, i) => (
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

          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--landing-copy)] sm:text-lg md:text-xl">
            Gerpy brings memberships, billing, access, classes, payroll,
            stock, and finance into one connected operating layer for fitness
            teams that move fast across every branch.
          </p>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-4"
              >
                <div className="text-2xl font-black text-[var(--landing-text)]">
                  <AnimateNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    delay={0.25 + index * 0.12}
                  />
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--landing-muted)]">
                  {stat.label}
                </div>
                <div className="mt-3 text-sm font-bold text-[var(--landing-mint)]">
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50">
            <div className="mb-5 flex items-center justify-between border-b border-[color:var(--landing-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--landing-accent-strong)]">
                  Operations command
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-[var(--landing-text)]">
                  Downtown branch
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--landing-accent-strong)]">
                <Activity className="h-4 w-4" aria-hidden="true" />
                Live
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {operations.map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-[color:var(--landing-border)] bg-white/[0.04] p-4">
                  <Icon className="mb-4 h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
                  <p className="text-sm font-bold text-[var(--landing-text)]">{label}</p>
                  <p className="mt-1 text-sm text-[var(--landing-copy)]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--landing-text)]">
                  <BarChart3 className="h-4 w-4 text-[var(--landing-accent-strong)]" aria-hidden="true" />
                  Revenue by hour
                </div>
                <BadgeCheck className="h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
              </div>
              <div className="flex h-28 items-end gap-2">
                {[38, 54, 46, 72, 58, 88, 66, 94, 81, 70, 92, 76].map(
                  (height, index) => (
                    <motion.div
                      key={index}
                      className="origin-bottom flex-1 bg-[var(--landing-accent-strong)]"
                      initial={{ scaleY: 0, opacity: 0.45 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 22,
                        delay: index * 0.075,
                      }}
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 border border-[color:var(--landing-alert-border)] bg-[var(--landing-alert-bg)] p-4">
              <div>
                <p className="text-sm font-bold text-[var(--landing-text)]">
                  Low stock alert resolved
                </p>
                <p className="mt-1 text-sm text-[var(--landing-copy)]">
                  Protein bars transferred from North branch.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--landing-accent-strong)]">
                Synced
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
