import { ModulePage } from "@/components/shared/module-page";
import type { Locale } from "@/lib/i18n";

export default async function HrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ModulePage moduleId="hr" locale={locale as Locale} />;
}
