import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll"; // Your Lenis wrapper

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
        
        {/* We wrap the children here so every page gets smooth scrolling! */}
        <SmoothScroll>
          {children}
        </SmoothScroll>
        
      </body>
    </html>
  );
}