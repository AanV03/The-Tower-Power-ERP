import { ModulePage } from "@/components/modules/module-page";
import type { Locale } from "@/lib/i18n";

export default async function PosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <ModulePage moduleId="pos" locale={locale as Locale} />;
}
