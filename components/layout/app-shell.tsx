"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileModuleNav } from "@/components/layout/mobile-module-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const pathname = usePathname();
  const parts = pathname?.split("/").filter(Boolean) ?? [];
  const moduleKey = parts[1] ?? ""; // /{locale}/{module} -> parts[0]=locale, parts[1]=module

  // Guarded modules list (placeholder - adapt to your org + permissions)
  const guardedModules = new Set([
    "dashboard",
    "crm",
    "sales",
    "inventory",
    "finance",
    "hr",
    "pos",
  ]);

  const shouldGuard = guardedModules.has(moduleKey);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Fixed Topbar */}
      <Topbar locale={(parts[0] as any) ?? "es"} />

      {/* Flex container for sidebar + content (fills remaining height after topbar) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidebar with sticky positioning within scroll context */}
        <AppSidebar locale={(parts[0] as any) ?? "es"} />

        {/* Main content area with flex column to handle mobile nav + main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileModuleNav locale={(parts[0] as any) ?? "es"} />
          {/* Main scrollable area */}
          <main className={cn("flex-1 overflow-auto", className)}>{children}</main>
        </div>
      </div>
    </div>
  );
}
