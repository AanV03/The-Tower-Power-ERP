import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileModuleNav } from "@/components/layout/mobile-module-nav";
import { BrandColorApplier } from "@/components/branding/brand-color-applier";
import { BrandColorScript } from "@/components/branding/brand-color-script";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      <BrandColorScript />
      {/* Applies persisted brand colors from localStorage to :root */}
      <BrandColorApplier />
      {/* Sidebar - Left Panel, full height */}
      <AppSidebar locale={locale as Locale} />

      {/* Right Container - Topbar + Content Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar locale={locale as Locale} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileModuleNav locale={locale as Locale} />
          {/* ONLY THIS SCROLLS */}
          <main className="flex-1 overflow-y-auto overscroll-contain">{children}</main>
        </div>
      </div>
    </div>
  );
}
