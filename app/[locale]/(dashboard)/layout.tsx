import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileModuleNav } from "@/components/layout/mobile-module-nav";
import { BrandColorApplier } from "@/components/branding/brand-color-applier";
import { BrandColorScript } from "@/components/branding/brand-color-script";
import { getTenantContextFromCookies } from "@/lib/auth/server-session";
import type { Locale } from "@/lib/i18n";

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

  if (!customContext?.tenantId && !session?.user?.tenantId) {
    redirect(`/${locale}/signin`);
  }

  return (
    <div className="erp-app-shell flex h-screen overflow-hidden">
      <BrandColorScript />
      <BrandColorApplier />
      <AppSidebar locale={locale as Locale} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale={locale as Locale} />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MobileModuleNav locale={locale as Locale} />
          <main className="erp-main-scroll flex-1 overflow-y-auto overscroll-contain">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
