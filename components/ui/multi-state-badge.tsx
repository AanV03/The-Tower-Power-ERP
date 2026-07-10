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
    className: "border-[color:var(--auth-card-border)] bg-[var(--auth-panel-muted)] text-[var(--auth-muted-strong)]",
    icon: <span className="size-1.5 rounded-full bg-[var(--auth-icon)]" />,
  },
  processing: {
    label: "Processing",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: <Loader2 className="size-3 animate-spin" aria-hidden="true" />,
  },
  success: {
    label: "Success",
    className: "border-[color:var(--auth-success-border)] bg-[var(--auth-success-bg)] text-[var(--auth-success)]",
    icon: <CheckCircle2 className="size-3" aria-hidden="true" />,
  },
  error: {
    label: "Error",
    className: "border-[color:var(--auth-error-border)] bg-[var(--auth-error-bg)] text-[var(--auth-error)]",
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
