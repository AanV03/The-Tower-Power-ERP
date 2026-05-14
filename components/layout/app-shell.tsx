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
    <div className="min-h-screen bg-background">
      <Topbar locale={(parts[0] as any) ?? "es"} />

      <div className="flex min-h-screen">
        <AppSidebar locale={(parts[0] as any) ?? "es"} />

        <div className="flex-1 flex flex-col pt-16 min-h-[calc(100vh-4rem)]">
          <MobileModuleNav locale={(parts[0] as any) ?? "es"} />
          <main className={cn("flex-1 overflow-auto", className)}>{children}</main>
        </div>
      </div>
    </div>
  );
}
