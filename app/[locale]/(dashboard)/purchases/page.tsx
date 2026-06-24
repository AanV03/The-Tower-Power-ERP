import { PurchasesWorkflow } from "@/components/modules/purchases/purchases-workflow";
import type { Locale } from "@/lib/i18n";

export default async function PurchasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PurchasesWorkflow locale={locale as Locale} />;
}
