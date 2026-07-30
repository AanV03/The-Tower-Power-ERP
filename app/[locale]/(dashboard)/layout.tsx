import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AdminOnboardingGate } from "@/components/layout/admin-onboarding-wrapper";
import { Topbar } from "@/components/layout/topbar";
import { MobileModuleNav } from "@/components/layout/mobile-module-nav";
import { BrandColorApplier } from "@/components/branding/brand-color-applier";
import { getTenantContextFromCookies } from "@/lib/auth/server-session";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/localized-routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  noStore();
  const { locale } = await params;
  const customContext = await getTenantContextFromCookies().catch(() => null);
  const session = customContext ? null : await auth();
  const tenantId = customContext?.tenantId || session?.user?.tenantId;

  if (!customContext?.tenantId && !session?.user?.tenantId) {
    redirect(localizedPath(locale, "login"));
  }
  
  let brandColors = null;
  let brandIdentity = null;
  let onboardingEligible = false;
  let onboardingCompleted = true;
  
  if (tenantId) {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { brandColors: true, brandIdentity: true, createdAt: true },
      });
      if (tenant) {
        brandColors = tenant.brandColors;
        brandIdentity = tenant.brandIdentity;
        onboardingCompleted = Boolean((tenant.brandIdentity as any)?.adminOnboardingCompleted);
        onboardingEligible = tenant.createdAt >= new Date("2026-07-05T00:00:00.000Z");
      }
    } catch { /* ignore */ }
  }

  return (
    <AdminOnboardingGate
      enabled={Boolean(tenantId && onboardingEligible && !onboardingCompleted)}
      serverIdentity={brandIdentity as any}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <BrandColorApplier />
        {/* Sidebar - Left Panel, full height */}
        <AppSidebar locale={locale as Locale} serverIdentity={brandIdentity as any} />

        {/* Right Container - Topbar + Content Column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Topbar locale={locale as Locale} />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileModuleNav locale={locale as Locale} />
            {/* ONLY THIS SCROLLS */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </AdminOnboardingGate>
  );
}
