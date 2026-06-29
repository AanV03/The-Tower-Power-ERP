import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerpy ERP | Gym Operations Platform",
  description: "ERP software for gym memberships, billing, access, inventory, payroll, and analytics.",
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
      {/* antialiased makes text render much sharper on dark backgrounds */}
      <body className="bg-zinc-950 text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
