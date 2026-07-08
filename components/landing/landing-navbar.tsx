"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell, Search } from "lucide-react";
import { useLandingRouteTransition } from "@/components/landing/landing-route-transition";

const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Operations", href: "#operations" },
  { label: "Contact", href: "#contact" },
];

const curtainPanels = Array.from({ length: 7 }, (_, index) => index);
const curtainDuration = 420;
const curtainStagger = 45;
const curtainCoverDelay = curtainDuration + (curtainPanels.length - 1) * curtainStagger + 90;

export function LandingNavbar() {
  const { startRouteTransition } = useLandingRouteTransition();
  const [curtainPhase, setCurtainPhase] = useState<"idle" | "enter" | "exit">("idle");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const clearTransitionTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const target = document.querySelector<HTMLElement>(href);

    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    event.preventDefault();
    clearTransitionTimers();
    setCurtainPhase("enter");

    timersRef.current = [
      window.setTimeout(() => {
        window.history.pushState(null, "", href);
        target.scrollIntoView({ block: "start", behavior: "auto" });
      }, curtainCoverDelay),
      window.setTimeout(() => setCurtainPhase("exit"), curtainCoverDelay + 140),
      window.setTimeout(() => setCurtainPhase("idle"), curtainCoverDelay + 680),
    ];
  };

  const handleRouteClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: Route
  ) => {
    event.preventDefault();
    startRouteTransition(href);
  };

  return (
    <header className="relative z-50 border-b border-white/10 bg-[#07080b]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-px w-[78vw] max-w-6xl origin-center -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_18px_rgba(251,191,36,0.65)] sm:w-[82vw] lg:w-[86vw]"
        animate={{ opacity: [0.22, 0.82, 0.22], scaleX: [0.92, 1, 0.92] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-3px] z-10 size-1.5 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.85)]"
        animate={{ opacity: [0.35, 0.95, 0.35], scale: [0.85, 1.25, 0.85] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {curtainPhase !== "idle" ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[100] grid grid-cols-7 pointer-events-none"
        >
          {curtainPanels.map((panel) => (
            <motion.div
              key={panel}
              className="origin-top bg-amber-500"
              initial={{ scaleY: curtainPhase === "enter" ? 0 : 1 }}
              animate={{ scaleY: curtainPhase === "enter" ? 1 : 0 }}
              transition={{
                duration: curtainDuration / 1000,
                ease: [0.83, 0, 0.17, 1],
                delay: (panel * curtainStagger) / 1000,
              }}
              style={{
                transformOrigin: curtainPhase === "enter" ? "top" : "bottom",
              }}
            />
          ))}
        </div>
      ) : null}

      <nav
        aria-label="Main navigation"
        className="grid w-full grid-cols-[1fr_auto] items-stretch md:grid-cols-[minmax(260px,0.9fr)_auto_minmax(260px,0.9fr)]"
      >
        <Link
          href={"/" as Route}
          className="group inline-flex min-w-0 items-center gap-3  px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:px-6 lg:px-8"
          aria-label="Gerpy home"
        >
          <span className="grid size-9 shrink-0 place-items-center bg-amber-500 text-black">
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-black uppercase tracking-normal text-white sm:text-sm">
              Gerpy ERP
            </span>
            <span
              className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:block"
            >
              Gym operating system
            </span>
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-3 px-8 md:flex lg:gap-4 lg:px-12">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleSectionClick(event, link.href)}
              className="group relative inline-flex min-h-10 min-w-32 items-center justify-center border border-white/12 bg-white/[0.025] px-4 text-xs font-black uppercase tracking-[0.22em] text-zinc-200 transition-colors hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              <span
                aria-hidden="true"
                className="absolute -left-px -top-px size-2 border-l border-t border-amber-400/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute -right-px -top-px size-2 border-r border-t border-amber-400/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -left-px size-2 border-b border-l border-amber-400/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px size-2 border-b border-r border-amber-400/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-amber-400 transition-transform group-hover:scale-x-100"
              />
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 lg:px-8">
          <a
            href="#modules"
            aria-label="Search modules"
            className="hidden size-10 place-items-center border border-white/10 text-zinc-300 transition-colors hover:border-amber-400/50 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:grid lg:size-11"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href={"/register" as Route}
            onClick={(event) => handleRouteClick(event, "/register" as Route)}
            className="inline-flex min-h-10 items-center justify-center gap-2 bg-amber-500 px-4 text-xs font-black uppercase tracking-[0.16em] text-black transition-all duration-300 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:px-5 lg:min-h-11 lg:px-7"
          >
            <span className="hidden sm:inline">Start setup</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
