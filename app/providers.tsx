"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

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
