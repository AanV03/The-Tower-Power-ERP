import type { Locale } from "@/lib/i18n";

export type AccountingUiStatus = "idle" | "loading" | "empty" | "error" | "success";
export type AccountingMetricTone = "default" | "success" | "warning" | "danger";
export type AccountStatus = "active" | "inactive" | "locked";
export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type NormalBalance = "debit" | "credit";
export type JournalEntryStatus = "draft" | "balanced" | "posted" | "void";
export type JournalEntryType = "income" | "expense" | "daily" | "adjustment";

export type AccountingMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: AccountingMetricTone;
};

export type AccountingAccount = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  status: AccountStatus;
  branchScope: string;
};

export type JournalEntryLine = {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
};

export type JournalEntryDraft = {
  id: string;
  entryNumber: string;
  date: string;
  type: JournalEntryType;
  concept: string;
  reference: string;
  currency: string;
  status: JournalEntryStatus;
  lines: JournalEntryLine[];
  totals: {
    debit: number;
    credit: number;
    difference: number;
    isBalanced: boolean;
  };
};

export type JournalEntrySummary = {
  id: string;
  entryNumber: string;
  dateLabel: string;
  concept: string;
  type: JournalEntryType;
  amount: string;
  status: JournalEntryStatus;
};

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type StatusVisualConfig = {
  label: string;
  className: string;
};

export type DisplayColumn = {
  id: string;
  label: string;
  align?: "left" | "right";
};

export type AccountingLabels = {
  searchPlaceholder: string;
  registerEntry: string;
  refresh: string;
  export: string;
  validate: string;
  editorTitle: string;
  editorDescription: string;
  date: string;
  type: string;
  concept: string;
  reference: string;
  debit: string;
  credit: string;
  difference: string;
  balanced: string;
  unbalanced: string;
  addLine: string;
  removeLine: string;
  account: string;
  description: string;
  saveDraft: string;
  accountsTitle: string;
  accountsDescription: string;
  entriesTitle: string;
  entriesDescription: string;
  emptyAccountsTitle: string;
  emptyAccountsDescription: string;
  emptyEntriesTitle: string;
  emptyEntriesDescription: string;
  errorTitle: string;
  retry: string;
  kpiLabel: string;
};

export type AccountingDashboardData = {
  title: string;
  subtitle: string;
  periodLabel: string;
  branchLabel: string;
  metrics: AccountingMetric[];
  accounts: AccountingAccount[];
  recentEntries: JournalEntrySummary[];
  draftEntry: JournalEntryDraft;
};

export type AccountingDashboardState = {
  page: AccountingUiStatus;
  accounts: AccountingUiStatus;
  entries: AccountingUiStatus;
  editor: AccountingUiStatus;
  message?: string;
};

export type AccountingActionHandlers = {
  onRegisterEntry?: () => void;
  onSaveDraft?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onRetry?: () => void;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onAddLine?: () => void;
  onRemoveLine?: (lineId: string) => void;
  onLineChange?: (lineId: string, field: keyof JournalEntryLine, value: string | number) => void;
  onEntryFieldChange?: (field: keyof JournalEntryDraft, value: string) => void;
  onSelectAccount?: (accountId: string) => void;
  onSelectEntry?: (entryId: string) => void;
  onDeleteEntry?: (entryId: string) => void;
  onCreateAccount?: () => void;
};

export type AccountingDashboardProps = {
  locale: Locale;
  data: AccountingDashboardData;
  state: AccountingDashboardState;
  labels: AccountingLabels;
  actions?: AccountingActionHandlers;
  accountTypeLabels: Record<AccountType, string>;
  normalBalanceLabels: Record<NormalBalance, string>;
  accountStatusLabels: Record<AccountStatus, string>;
  journalEntryTypeOptions: SelectOption<JournalEntryType>[];
  journalEntryStatusConfig: Record<JournalEntryStatus, StatusVisualConfig>;
};

export type JournalEntryEditorProps = Pick<
  AccountingDashboardProps,
  "locale" | "labels" | "actions" | "journalEntryTypeOptions" | "journalEntryStatusConfig"
> & {
  entry: JournalEntryDraft;
  status: AccountingUiStatus;
};

export type AccountsPanelProps = Pick<
  AccountingDashboardProps,
  "labels" | "actions" | "accountTypeLabels" | "normalBalanceLabels" | "accountStatusLabels"
> & {
  accounts: AccountingAccount[];
  status: AccountingUiStatus;
};

export type JournalEntryListProps = Pick<
  AccountingDashboardProps,
  "labels" | "actions" | "journalEntryStatusConfig" | "journalEntryTypeOptions"
> & {
  entries: JournalEntrySummary[];
  status: AccountingUiStatus;
};
