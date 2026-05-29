import { ModulePage } from "@/components/shared/module-page";
import type { Locale } from "@/lib/i18n";

export default async function AccountingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ModulePage moduleId="accounting" locale={locale as Locale} chartType="bar" />;
}
