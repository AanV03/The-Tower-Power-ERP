"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";

const curtainPanels = Array.from({ length: 7 }, (_, index) => index);
const curtainDuration = 420;
const curtainStagger = 45;
const curtainCoverDelay =
  curtainDuration + (curtainPanels.length - 1) * curtainStagger + 90;

type CurtainPhase = "idle" | "enter" | "exit";

type LandingRouteTransitionContextValue = {
  startRouteTransition: (href: Route) => void;
};

const LandingRouteTransitionContext =
  createContext<LandingRouteTransitionContextValue | null>(null);

export function LandingRouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [curtainPhase, setCurtainPhase] = useState<CurtainPhase>("idle");
  const timersRef = useRef<number[]>([]);
  const pendingPathRef = useRef<string | null>(null);
  const isAwaitingRouteRef = useRef(false);

  const clearTransitionTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const openCurtainOnDestination = useCallback(() => {
    isAwaitingRouteRef.current = false;
    timersRef.current.push(
      window.setTimeout(() => setCurtainPhase("exit"), 120),
      window.setTimeout(() => setCurtainPhase("idle"), 720)
    );
  }, []);

  useEffect(() => {
    return () => clearTransitionTimers();
  }, [clearTransitionTimers]);

  useEffect(() => {
    if (!isAwaitingRouteRef.current || !pendingPathRef.current) {
      return;
    }

    if (pathname === pendingPathRef.current) {
      openCurtainOnDestination();
    }
  }, [openCurtainOnDestination, pathname]);

  const startRouteTransition = useCallback(
    (href: Route) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      clearTransitionTimers();
      pendingPathRef.current = String(href).split(/[?#]/)[0] || "/";
      isAwaitingRouteRef.current = false;
      setCurtainPhase("enter");

      timersRef.current = [
        window.setTimeout(() => {
          isAwaitingRouteRef.current = true;
          router.push(href);
        }, curtainCoverDelay),
        window.setTimeout(() => {
          if (isAwaitingRouteRef.current) {
            openCurtainOnDestination();
          }
        }, curtainCoverDelay + 1400),
      ];
    },
    [clearTransitionTimers, openCurtainOnDestination, router]
  );

  const value = useMemo(
    () => ({ startRouteTransition }),
    [startRouteTransition]
  );

  return (
    <LandingRouteTransitionContext.Provider value={value}>
      {children}

      {curtainPhase !== "idle" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] grid grid-cols-7"
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
    </LandingRouteTransitionContext.Provider>
  );
}

export function useLandingRouteTransition() {
  const context = useContext(LandingRouteTransitionContext);

  if (!context) {
    throw new Error(
      "useLandingRouteTransition must be used inside LandingRouteTransitionProvider"
    );
  }

  return context;
}
