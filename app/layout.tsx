import type { Metadata, Viewport } from "next";

import { Providers } from "@/app/providers";
import { LandingRouteTransitionProvider } from "@/components/landing/landing-route-transition";

import "./globals.css";

export const metadata: Metadata = {
  title: "The Tower Power | Gym Operations Platform",
  description:
    "ERP software for gym memberships, billing, access, inventory, payroll, and analytics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <LandingRouteTransitionProvider>
            {children}
          </LandingRouteTransitionProvider>
        </Providers>
      </body>
    </html>
  );
}