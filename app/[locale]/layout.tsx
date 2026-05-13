import { notFound } from "next/navigation";

import { BrandStyleProvider } from "@/components/branding/brand-style-provider";
import { defaultBrand } from "@/lib/branding";
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

  return (
    <BrandStyleProvider brand={defaultBrand} locale={locale as Locale}>
      {children}
    </BrandStyleProvider>
  );
}
