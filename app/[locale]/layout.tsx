import { notFound } from "next/navigation";

import { BrandStyleProvider } from "@/components/branding/brand-style-provider";
import { defaultBrand } from "@/lib/branding";
import { auth } from "@/auth";
import { getTenantContextFromCookies } from "@/lib/auth/server-session";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const customContext = await getTenantContextFromCookies().catch(() => null);
  const session = customContext ? null : await auth();
  const tenantId = customContext?.tenantId || session?.user?.tenantId;
  
  let brandColors = null;
  let brandIdentity = null;
  
  if (tenantId) {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { brandColors: true, brandIdentity: true },
      });
      if (tenant) {
        brandColors = tenant.brandColors;
        brandIdentity = tenant.brandIdentity;
      }
    } catch { /* ignore */ }
  }

  return (
    <BrandStyleProvider brand={defaultBrand} locale={locale as Locale} serverColors={brandColors as any} serverIdentity={brandIdentity as any}>
      {children}
    </BrandStyleProvider>
  );
}
