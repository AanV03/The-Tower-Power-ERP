import type { Locale } from "@/lib/i18n";

import { PayrollDashboard } from "./components/payroll-dashboard";

export default async function PayrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payrollPeriodId?: string }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  return <PayrollDashboard locale={locale as Locale} selectedPeriodId={resolvedSearchParams.payrollPeriodId} />;
}
