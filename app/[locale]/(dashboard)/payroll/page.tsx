import { PayrollDashboard } from "@/components/modules/payroll/payroll-dashboard";
import type { Locale } from "@/lib/i18n";

export default async function PayrollPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PayrollDashboard locale={locale as Locale} />;
}
