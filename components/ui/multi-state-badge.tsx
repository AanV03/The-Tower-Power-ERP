"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeState = "idle" | "processing" | "success" | "error";

interface MultiStateBadgeProps {
  state: BadgeState;
  className?: string;
}

const badgeContent: Record<
  BadgeState,
  {
    label: string;
    className: string;
    icon: ReactNode;
  }
> = {
  idle: {
    label: "Ready",
    className: "border-white/10 bg-black/20 text-zinc-300",
    icon: <span className="size-1.5 rounded-full bg-zinc-400" />,
  },
  processing: {
    label: "Processing",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    icon: <Loader2 className="size-3 animate-spin" aria-hidden="true" />,
  },
  success: {
    label: "Success",
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    icon: <CheckCircle2 className="size-3" aria-hidden="true" />,
  },
  error: {
    label: "Error",
    className: "border-red-400/30 bg-red-500/10 text-red-200",
    icon: <XCircle className="size-3" aria-hidden="true" />,
  },
};

export function MultiStateBadge({ state, className }: MultiStateBadgeProps) {
  const content = badgeContent[state];

  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-24 items-center justify-center overflow-hidden rounded-full border px-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
        content.className,
        className
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          className="inline-flex items-center gap-1.5"
          initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {content.icon}
          {content.label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
