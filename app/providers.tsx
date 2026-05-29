"use client";

import type { ComponentProps, ComponentType, PropsWithChildren } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

const ThemeProvider = NextThemesProvider as ComponentType<
  PropsWithChildren<ComponentProps<typeof NextThemesProvider>>
>;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
