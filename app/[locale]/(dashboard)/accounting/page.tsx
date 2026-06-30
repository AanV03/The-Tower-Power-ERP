import { AccountingDashboard } from "./components/AccountingDashboard";
import type { Locale } from "@/lib/i18n";

export default async function AccountingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AccountingDashboard locale={locale as Locale} />;
}
