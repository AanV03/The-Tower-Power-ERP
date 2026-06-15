"use client";

import type { ComponentProps, ComponentType, PropsWithChildren } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

const ThemeProvider = NextThemesProvider as ComponentType<
  PropsWithChildren<ComponentProps<typeof NextThemesProvider>>
>;

export function Providers({ children, ...props }: React.ComponentProps<typeof NextThemesProvider> & { children: React.ReactNode }) {
  const Provider = NextThemesProvider as any;
  return (
    <Provider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
      <Toaster />
    </Provider>
  );
}
