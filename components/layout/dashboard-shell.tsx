import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileModuleNav } from "@/components/layout/mobile-module-nav";
import { Topbar } from "@/components/layout/topbar";
import type { Locale } from "@/lib/i18n";

export function DashboardShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar locale={locale} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar locale={locale} />
        <MobileModuleNav locale={locale} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
