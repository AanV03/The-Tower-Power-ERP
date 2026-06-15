import { HrDashboard } from "@/components/modules/hr/hr-dashboard";
import type { Locale } from "@/lib/i18n";

export default async function HrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HrDashboard locale={locale as Locale} />;
}
