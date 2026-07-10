"use client";

import type { ComponentProps, ComponentType, PropsWithChildren } from "react";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

const ThemeProvider = NextThemesProvider as ComponentType<
  PropsWithChildren<ComponentProps<typeof NextThemesProvider>>
>;

export function Providers({ children, ...props }: React.ComponentProps<typeof NextThemesProvider> & { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
