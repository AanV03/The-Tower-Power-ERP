import { ModulePage } from "@/components/modules/module-page";
import type { Locale } from "@/lib/i18n";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <ModulePage moduleId="dashboard" locale={locale as Locale} />;
}
