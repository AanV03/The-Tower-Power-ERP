import { InventoryDashboard } from "@/components/modules/inventory/inventory-dashboard";
import type { Locale } from "@/lib/i18n";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <InventoryDashboard locale={locale as Locale} />;
}
