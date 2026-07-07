"use client";

import type { ReactNode } from "react";

import AuroraBackground from "@/components/AuroraBackground";
import BackgroundGrid from "@/components/BackgroundGrid";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export function AuthShell({ children, id, className }: AuthShellProps) {
  return (
    <main
      id={id}
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 text-white sm:px-6 sm:py-12",
        className,
      )}
    >
      <BackgroundGrid />
      <AuroraBackground />
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950" />
      <div className="absolute inset-0 z-[3] bg-zinc-950/10" />

      {children}
    </main>
  );
}
