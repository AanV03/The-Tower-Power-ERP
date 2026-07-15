import { AccountingDemoController } from "./components/AccountingDemoController";
import { getAccountingConfig } from "./components/config";
import { getMockAccountingData, mockAccountingState } from "./components/mock-data";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function AccountingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const dictionary = getDictionary(activeLocale);
  const config = getAccountingConfig(dictionary);

  // TODO: Connect useAccountingDashboardData or server loader here.
  // TODO: Replace mockAccountingData with API-backed dashboard payload.
  // TODO: Connect tenant/branch/period context when available.
  return (
    <AccountingDemoController
      locale={activeLocale}
      data={getMockAccountingData(dictionary)}
      state={mockAccountingState}
      labels={config.accountingLabels}
      accountTypeLabels={config.accountTypeLabels}
      normalBalanceLabels={config.normalBalanceLabels}
      accountStatusLabels={config.accountStatusLabels}
      journalEntryTypeOptions={config.journalEntryTypeOptions}
      journalEntryStatusConfig={config.journalEntryStatusConfig}
    />
  );
}
