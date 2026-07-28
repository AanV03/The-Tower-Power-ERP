import type { Dictionary } from "@/lib/i18n";
import type { AccountStatus, AccountType, DisplayColumn, JournalEntryStatus, JournalEntryType, NormalBalance, SelectOption, StatusVisualConfig } from "./types";

export function getAccountingConfig(dictionary: Dictionary) {
  const t = dictionary.accounting;
  return {
    accountingLabels: {
      searchPlaceholder: t.searchPlaceholder, registerEntry: t.registerEntry, refresh: t.refresh,
      export: t.export, validate: t.validate, editorTitle: t.editorTitle,
      editorDescription: t.editorDescription, date: t.date, type: t.type, concept: t.concept,
      reference: t.reference, debit: t.debit, credit: t.credit, difference: t.difference,
      balanced: t.balanced, unbalanced: t.unbalanced, addLine: t.addLine, removeLine: t.removeLine,
      account: t.columns.account, description: t.columns.description, saveDraft: t.saveDraft,
      accountsTitle: t.accountsTitle, accountsDescription: t.accountsDescription,
      entriesTitle: t.entriesTitle, entriesDescription: t.entriesDescription,
      emptyAccountsTitle: t.emptyAccountsTitle, emptyAccountsDescription: t.emptyAccountsDescription,
      emptyEntriesTitle: t.emptyEntriesTitle, emptyEntriesDescription: t.emptyEntriesDescription,
      errorTitle: t.errorTitle, retry: t.retry, kpiLabel: t.kpiLabel,
    },
    accountTypeLabels: t.accountTypes as Record<AccountType, string>,
    normalBalanceLabels: t.normalBalances as Record<NormalBalance, string>,
    accountStatusLabels: t.accountStatuses as Record<AccountStatus, string>,
    journalEntryTypeOptions: Object.entries(t.entryTypes).map(([value, label]) => ({ value, label })) as SelectOption<JournalEntryType>[],
    journalEntryStatusConfig: {
      draft: { label: t.entryStatuses.draft, className: "border-border text-muted-foreground" },
      balanced: { label: t.entryStatuses.balanced, className: "bg-emerald-500/15 text-emerald-600" },
      posted: { label: t.entryStatuses.posted, className: "bg-primary/15 text-primary" },
      void: { label: t.entryStatuses.void, className: "bg-destructive/15 text-destructive" },
    } as Record<JournalEntryStatus, StatusVisualConfig>,
    journalLineColumns: [
      { id: "account", label: t.columns.account }, { id: "description", label: t.columns.description },
      { id: "debit", label: t.debit, align: "right" }, { id: "credit", label: t.credit, align: "right" },
    ] as DisplayColumn[],
    accountPanelColumns: [
      { id: "code", label: t.columns.code }, { id: "name", label: t.columns.account },
      { id: "normalBalance", label: t.columns.normalBalance }, { id: "status", label: t.columns.status },
    ] as DisplayColumn[],
  };
}
