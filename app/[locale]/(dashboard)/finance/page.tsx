import { ModulePage } from "@/components/shared/module-page";
import type { Locale } from "@/lib/i18n";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ModulePage moduleId="finance" locale={locale as Locale} />;
}
