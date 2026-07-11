import { AccountingDemoController } from "./components/AccountingDemoController";
import {
  accountingLabels,
  accountTypeLabels,
  journalEntryStatusConfig,
  journalEntryTypeOptions,
  normalBalanceLabels,
} from "./components/config";
import { mockAccountingData, mockAccountingState } from "./components/mock-data";
import type { Locale } from "@/lib/i18n";

export default async function AccountingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // TODO: Connect useAccountingDashboardData or server loader here.
  // TODO: Replace mockAccountingData with API-backed dashboard payload.
  // TODO: Connect tenant/branch/period context when available.
  return (
    <AccountingDemoController
      locale={locale as Locale}
      data={mockAccountingData}
      state={mockAccountingState}
      labels={accountingLabels}
      accountTypeLabels={accountTypeLabels}
      normalBalanceLabels={normalBalanceLabels}
      journalEntryTypeOptions={journalEntryTypeOptions}
      journalEntryStatusConfig={journalEntryStatusConfig}
    />
  );
}
