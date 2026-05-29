import { ModulePage } from "@/components/shared/module-page";
import type { Locale } from "@/lib/i18n";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ModulePage moduleId="analytics" locale={locale as Locale} chartType="bar" />;
}
