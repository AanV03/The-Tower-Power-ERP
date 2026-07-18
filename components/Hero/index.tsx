"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { AuthBackground } from "@/components/backgrounds/auth-background";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type OperationId = "memberships" | "pos" | "dashboard" | "access";

const HERO_ROTATION_INTERVAL_MS = 5_000;
const operationOrder: OperationId[] = ["memberships", "pos", "dashboard", "access"];

const operationChartValues: Record<OperationId, number[]> = {
  memberships: [44, 62, 55, 73, 66, 82, 70, 91, 78, 86, 68, 80],
  pos: [38, 54, 46, 72, 58, 88, 66, 94, 81, 70, 92, 76],
  dashboard: [52, 61, 74, 83, 89, 94, 90, 85, 78, 69, 58, 47],
  access: [35, 48, 72, 88, 67, 93, 76, 84, 96, 71, 63, 50],
};

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

export default function Hero({ locale = "es" }: { locale?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isPointerInteractionRef = useRef(false);
  const dictionary = getDictionary(locale as Locale);
  const [activeOperation, setActiveOperation] = useState<OperationId>("pos");
  const [isOperationPanelHovered, setIsOperationPanelHovered] = useState(false);
  const [isOperationPanelFocused, setIsOperationPanelFocused] = useState(false);
  const [rotationRestartKey, setRotationRestartKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const heroStats = [
    { label: dictionary.landing.heroStats?.activeMembers ?? "Active members", value: 3842, trend: dictionary.landing.heroStats?.trendPlus12 ?? "+12%" },
    { label: dictionary.landing.heroStats?.monthlyRevenue ?? "Monthly revenue", value: 84.6, prefix: "$", suffix: "k", decimals: 1, trend: dictionary.landing.heroStats?.trendPlus18 ?? "+18%" },
    { label: dictionary.landing.heroStats?.checkinsToday ?? "Check-ins today", value: 716, trend: dictionary.landing.heroStats?.trendLive ?? "Live" },
  ];

  const operations = [
    {
      id: "memberships" as const,
      icon: Users,
      label: dictionary.modules.memberships,
      value: dictionary.landing.ops?.renewalsQueued ?? "Renewals queued",
      chartTitle: dictionary.landing.ops.renewalsHour,
      chartValues: operationChartValues.memberships,
    },
    {
      id: "pos" as const,
      icon: CreditCard,
      label: dictionary.modules.pos,
      value: dictionary.landing.ops?.salesSynced ?? "42 sales synced",
      chartTitle: dictionary.landing.ops.revenueHour,
      chartValues: operationChartValues.pos,
    },
    {
      id: "dashboard" as const,
      icon: CalendarClock,
      label: dictionary.common.dashboard,
      value: dictionary.landing.ops?.occupancy ?? "91% occupancy",
      chartTitle: dictionary.landing.ops.occupancyHour,
      chartValues: operationChartValues.dashboard,
    },
    {
      id: "access" as const,
      icon: ShieldCheck,
      label: dictionary.modules.access,
      value: dictionary.landing.ops?.devicesOnline ?? "Devices online",
      chartTitle: dictionary.landing.ops.accessHour,
      chartValues: operationChartValues.access,
    },
  ];

  const selectedOperation =
    operations.find(({ id }) => id === activeOperation) ?? operations[1];

  const selectOperation = (id: OperationId) => {
    setActiveOperation(id);
    setRotationRestartKey((key) => key + 1);
  };

  const handleOperationPanelBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsOperationPanelFocused(false);
    }
  };

  useEffect(() => {
    if (shouldReduceMotion || isOperationPanelHovered || isOperationPanelFocused) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveOperation((current) => {
        const currentIndex = operationOrder.indexOf(current);
        return operationOrder[(currentIndex + 1) % operationOrder.length];
      });
    }, HERO_ROTATION_INTERVAL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeOperation,
    isOperationPanelFocused,
    isOperationPanelHovered,
    rotationRestartKey,
    shouldReduceMotion,
  ]);

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

  const titleText = dictionary.landing.heroTitle ?? "ALL GYM OPS ONE PLATFORM";

  return (
    <section
      ref={containerRef}
      className="landing-hero relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[var(--landing-background)] px-4 py-16 sm:py-20 md:py-24 lg:py-28"
    >
      {/* Layer 1 */}
      <AuthBackground variant="hero" />
      {/* Layer 2 */}
     

      {/* Layer 3 — soft edge vignette, keeps center colorful */}

      <div className="relative z-10 grid w-full max-w-7xl items-start gap-6 sm:gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10">
        <div className="flex min-w-0 flex-col items-start pt-4 lg:pt-8">
          <h1
            ref={titleRef}
            className="flex max-w-5xl flex-wrap gap-x-1 sm:gap-x-2 overflow-hidden px-1 text-[clamp(1.8rem,5vw,3rem)] sm:text-[clamp(2.3rem,6vw,4.5rem)] lg:text-[clamp(2.6rem,5vw,5rem)] xl:text-[clamp(3rem,5.5vw,5.8rem)] font-black uppercase leading-[0.98] tracking-normal text-[var(--landing-text)]"
          >
            {titleText.split(" ").map((word, i) => (
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

          <p className="mt-4 sm:mt-5 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-[var(--landing-copy)]">
            {dictionary.landing.heroSubtitle ?? "The Tower Power brings memberships, billing, access, classes, payroll, stock, and finance into one connected operating layer."}
          </p>

          <div className="mt-6 sm:mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-3">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-3.5"
              >
                <div className="text-xl sm:text-2xl font-black text-[var(--landing-text)]">
                  <AnimateNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    delay={0.25 + index * 0.12}
                  />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--landing-muted)]">
                  {stat.label}
                </div>
                <div className="mt-2 text-xs font-bold text-[var(--landing-mint)]">
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative hidden self-start pt-4 lg:block lg:pt-8"
          onMouseEnter={() => setIsOperationPanelHovered(true)}
          onMouseLeave={() => setIsOperationPanelHovered(false)}
          onPointerDownCapture={() => {
            isPointerInteractionRef.current = true;
          }}
          onPointerUpCapture={() => {
            isPointerInteractionRef.current = false;
          }}
          onPointerCancelCapture={() => {
            isPointerInteractionRef.current = false;
          }}
          onFocusCapture={() => {
            if (!isPointerInteractionRef.current) {
              setIsOperationPanelFocused(true);
            }
          }}
          onBlurCapture={handleOperationPanelBlur}
        >
          <div className="border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-4 sm:p-5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50">
            <div className="mb-4 flex items-center justify-between border-b border-[color:var(--landing-border)] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--landing-accent-strong)]">
                  {dictionary.landing.ops?.commandTitle ?? "Operations command"}
                </p>
                <h2 className="mt-1.5 text-xl font-black uppercase text-[var(--landing-text)]">
                  {dictionary.landing.ops?.downtownBranch ?? "Downtown branch"}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--landing-accent-strong)]">
                <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                {dictionary.landing.ops?.trendLive ?? "Live"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {operations.map(({ id, icon: Icon, label, value }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activeOperation === id}
                  onClick={() => selectOperation(id)}
                  className={cn(
                    "border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent-strong)]",
                    activeOperation === id
                      ? "border-[color:var(--landing-accent-strong)] bg-[var(--landing-panel-hover)] shadow-[inset_0_0_0_1px_var(--landing-accent-strong)]"
                      : "border-[color:var(--landing-border)] bg-white/[0.04] hover:border-[color:var(--landing-accent-strong)]/70",
                  )}
                >
                  <Icon className="mb-4 h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
                  <p className="text-sm font-bold text-[var(--landing-text)]">{label}</p>
                  <p className="mt-1 text-sm text-[var(--landing-copy)]">{value}</p>
                </button>
              ))}
            </div>

            <div
              role="region"
              aria-labelledby="hero-operation-chart-title"
              aria-live="polite"
              className="mt-5 border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--landing-text)]">
                  <BarChart3 className="h-4 w-4 text-[var(--landing-accent-strong)]" aria-hidden="true" />
                  <motion.span
                    id="hero-operation-chart-title"
                    key={selectedOperation.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {selectedOperation.chartTitle}
                  </motion.span>
                </div>
                <BadgeCheck className="h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
              </div>
              <div className="flex h-28 items-end gap-2">
                {selectedOperation.chartValues.map((height, index) => (
                  <motion.div
                    key={`${selectedOperation.id}-${index}`}
                    aria-hidden="true"
                    className="origin-bottom flex-1 bg-[var(--landing-accent-strong)]"
                    initial={shouldReduceMotion ? false : { scaleY: 0, opacity: 0.45 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 180,
                            damping: 22,
                            delay: index * 0.045,
                          }
                    }
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 border border-[color:var(--landing-alert-border)] bg-[var(--landing-alert-bg)] p-4">
              <div>
                <p className="text-sm font-bold text-[var(--landing-text)]">
                  {dictionary.landing.ops?.alertTitle ?? "Low stock alert resolved"}
                </p>
                <p className="mt-1 text-sm text-[var(--landing-copy)]">
                  {dictionary.landing.ops?.alertDesc ?? "Protein bars transferred from North branch."}
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--landing-accent-strong)]">
                {dictionary.landing.ops?.synced ?? "Synced"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
