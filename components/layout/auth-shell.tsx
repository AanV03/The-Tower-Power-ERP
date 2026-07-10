"use client";

import type { ReactNode } from "react";

import { AuthBackground } from "@/components/backgrounds/auth-background";
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
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--auth-background)] px-4 py-10 text-[var(--auth-foreground)] sm:px-6 sm:py-12",
        className,
      )}
    >
      <AuthBackground />

      {children}
    </main>
  );
}
