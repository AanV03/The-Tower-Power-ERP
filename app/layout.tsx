import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge Your Legacy | Elite Gym",
  description: "High-performance training facility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* antialiased makes text render much sharper on dark backgrounds */}
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}