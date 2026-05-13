import { buildBrandCss, type BrandConfig } from "@/lib/branding";
import type { Locale } from "@/lib/i18n";

export function BrandStyleProvider({
  brand,
  locale,
  children,
}: {
  brand: BrandConfig;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div
      data-brand-id={brand.id}
      data-locale={locale}
      className="min-h-screen bg-background text-foreground"
    >
      <style dangerouslySetInnerHTML={{ __html: buildBrandCss(brand) }} />
      {children}
    </div>
  );
}
