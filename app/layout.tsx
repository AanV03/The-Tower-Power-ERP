import type { Metadata, Viewport } from "next";
import { LandingRouteTransitionProvider } from "@/components/landing/landing-route-transition";
import "./globals.css";


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
      {/* antialiased makes text render much sharper on dark backgrounds */}
      <body className="bg-zinc-950 text-white antialiased" suppressHydrationWarning>
        <LandingRouteTransitionProvider>{children}</LandingRouteTransitionProvider>
      </body>
    </html>
  );
}
