import type {
  AccountType,
  AccountingAccount,
  AccountingDashboardData,
  AccountingDashboardState,
  JournalEntryDraft,
  JournalEntryLine,
  JournalEntryStatus,
  JournalEntryType,
  NormalBalance,
} from "./types";
import type { Dictionary, Locale } from "@/lib/i18n";

type EditableEntryField = "date" | "type" | "concept" | "reference";

const defaultFeedback: Dictionary["accounting"]["feedback"] = {
  draftSaved: "Borrador actualizado localmente.",
  refreshed: "Datos de demostración actualizados.",
  exported: "Exportación simulada lista.",
  deleted: "Póliza eliminada localmente.",
  mustBalance: "La póliza debe cuadrar antes de registrarse.",
  registered: "Póliza registrada localmente.",
  untitled: "Póliza sin concepto",
  noDate: "Sin fecha",
};

export type AccountingDemoState = {
  data: AccountingDashboardData;
  uiState: AccountingDashboardState;
  searchQuery: string;
  locale: Locale;
  feedback: Dictionary["accounting"]["feedback"];
};

export type AccountingDemoAction =
  | { type: "entry-field"; field: EditableEntryField; value: string }
  | { type: "line-field"; lineId: string; field: keyof JournalEntryLine; value: string | number }
  | { type: "add-line" }
  | { type: "remove-line"; lineId: string }
  | { type: "select-account"; accountId: string }
  | { type: "create-account" }
  | { type: "select-entry"; entryId: string }
  | { type: "delete-entry"; entryId: string }
  | { type: "search"; value: string }
  | { type: "register-entry" }
  | { type: "save-draft" }
  | { type: "refresh" }
  | { type: "export" }
  | { type: "retry" };

function toJournalEntryStatus(isBalanced: boolean): JournalEntryStatus {
  return isBalanced ? "balanced" : "draft";
}

export function recalculateEntry(entry: JournalEntryDraft): JournalEntryDraft {
  const debit = entry.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const credit = entry.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const difference = Math.abs(debit - credit);
  const isBalanced = debit === credit && debit > 0;

  return {
    ...entry,
    status: toJournalEntryStatus(isBalanced),
    totals: {
      debit,
      credit,
      difference,
      isBalanced,
    },
  };
}

export function updateJournalEntryField(
  entry: JournalEntryDraft,
  field: EditableEntryField,
  value: string,
): JournalEntryDraft {
  const nextValue = field === "type" ? (value as JournalEntryType) : value;

  return {
    ...entry,
    [field]: nextValue,
  };
}

export function updateJournalLine(
  entry: JournalEntryDraft,
  lineId: string,
  field: keyof JournalEntryLine,
  value: string | number,
): JournalEntryDraft {
  const lines = entry.lines.map((line) =>
    line.id === lineId
      ? {
          ...line,
          [field]: value,
        }
      : line,
  );

  return recalculateEntry({ ...entry, lines });
}

export function addJournalLine(entry: JournalEntryDraft): JournalEntryDraft {
  const lineNumber = entry.lines.length + 1;

  return {
    ...entry,
    lines: [
      ...entry.lines,
      {
        id: `line-${lineNumber}`,
        accountId: "",
        accountCode: "",
        accountName: "",
        description: "",
        debit: 0,
        credit: 0,
      },
    ],
  };
}

export function removeJournalLine(entry: JournalEntryDraft, lineId: string): JournalEntryDraft {
  if (entry.lines.length <= 2) {
    return recalculateEntry({
      ...entry,
      lines: entry.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              accountId: "",
              accountCode: "",
              accountName: "",
              description: "",
              debit: 0,
              credit: 0,
            }
          : line,
      ),
    });
  }

  return recalculateEntry({
    ...entry,
    lines: entry.lines.filter((line) => line.id !== lineId),
  });
}

function applyAccountToLine(line: JournalEntryLine, account: AccountingAccount): JournalEntryLine {
  return {
    ...line,
    accountId: account.id,
    accountCode: account.code,
    accountName: account.name,
  };
}

function selectAccount(entry: JournalEntryDraft, account: AccountingAccount): JournalEntryDraft {
  const targetLine = entry.lines.find((line) => !line.accountId)?.id ?? entry.lines[0]?.id;

  if (!targetLine) return entry;

  return {
    ...entry,
    lines: entry.lines.map((line) => (line.id === targetLine ? applyAccountToLine(line, account) : line)),
  };
}

function loadEntrySummary(state: AccountingDemoState, entryId: string): AccountingDemoState {
  const summary = state.data.recentEntries.find((entry) => entry.id === entryId);

  if (!summary) return state;

  return {
    ...state,
    data: {
      ...state.data,
      draftEntry: {
        ...state.data.draftEntry,
        id: summary.id,
        entryNumber: summary.entryNumber,
        concept: summary.concept,
        type: summary.type,
        status: summary.status,
      },
    },
  };
}

function metricToneForDifference(difference: number) {
  return difference > 0 ? "danger" : "success";
}

function formatCurrency(value: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

function formatDateLabel(date: string, noDate: string) {
  if (!date) return noDate;

  return date;
}

function createBlankDraft(entry: JournalEntryDraft): JournalEntryDraft {
  return {
    ...entry,
    id: `draft-${Date.now()}`,
    entryNumber: "POL-BORRADOR",
    concept: "",
    reference: "",
    status: "draft",
    lines: [
      {
        id: "line-1",
        accountId: "",
        accountCode: "",
        accountName: "",
        description: "",
        debit: 0,
        credit: 0,
      },
      {
        id: "line-2",
        accountId: "",
        accountCode: "",
        accountName: "",
        description: "",
        debit: 0,
        credit: 0,
      },
    ],
    totals: { debit: 0, credit: 0, difference: 0, isBalanced: false },
  };
}

function createLocalAccount(accounts: AccountingAccount[]): AccountingAccount {
  const nextNumber = accounts.length + 1;

  return {
    id: `acc-local-${nextNumber}`,
    code: String(1000 + nextNumber),
    name: `Cuenta nueva ${nextNumber}`,
    type: "asset",
    normalBalance: "debit",
    status: "active",
    branchScope: "Tenant",
  };
}

function syncDifferenceMetric(data: AccountingDashboardData, locale: Locale): AccountingDashboardData {
  return {
    ...data,
    metrics: data.metrics.map((metric) =>
      metric.id === "difference"
        ? {
            ...metric,
            value: formatCurrency(data.draftEntry.totals.difference, data.draftEntry.currency, locale),
            tone: metricToneForDifference(data.draftEntry.totals.difference),
          }
        : metric,
    ),
  };
}

export function createAccountingDemoState(
  data: AccountingDashboardData,
  uiState: AccountingDashboardState,
  locale: Locale = "es",
  feedback: Dictionary["accounting"]["feedback"] = defaultFeedback,
) {
  return {
    data,
    uiState,
    searchQuery: "",
    locale,
    feedback,
  };
}

export function accountingDemoReducer(
  state: AccountingDemoState,
  action: AccountingDemoAction,
): AccountingDemoState {
  switch (action.type) {
    case "entry-field":
      return {
        ...state,
        data: syncDifferenceMetric({
          ...state.data,
          draftEntry: updateJournalEntryField(state.data.draftEntry, action.field, action.value),
        }, state.locale),
      };
    case "line-field":
      return {
        ...state,
        data: syncDifferenceMetric({
          ...state.data,
          draftEntry: updateJournalLine(
            state.data.draftEntry,
            action.lineId,
            action.field,
            action.value,
          ),
        }, state.locale),
      };
    case "add-line":
      return {
        ...state,
        data: {
          ...state.data,
          draftEntry: addJournalLine(state.data.draftEntry),
        },
      };
    case "remove-line":
      return {
        ...state,
        data: syncDifferenceMetric({
          ...state.data,
          draftEntry: removeJournalLine(state.data.draftEntry, action.lineId),
        }, state.locale),
      };
    case "select-account": {
      const account = state.data.accounts.find((item) => item.id === action.accountId);

      if (!account) return state;

      return {
        ...state,
        data: {
          ...state.data,
          draftEntry: selectAccount(state.data.draftEntry, account),
        },
      };
    }
    case "create-account": {
      const account = createLocalAccount(state.data.accounts);

      return {
        ...state,
        data: {
          ...state.data,
          accounts: [account, ...state.data.accounts],
        },
        uiState: { ...state.uiState, page: "success", message: "Cuenta agregada localmente." },
      };
    }
    case "select-entry":
      return loadEntrySummary(state, action.entryId);
    case "delete-entry":
      return {
        ...state,
        data: {
          ...state.data,
          recentEntries: state.data.recentEntries.filter((entry) => entry.id !== action.entryId),
        },
        uiState: { ...state.uiState, page: "success", message: state.feedback.deleted },
      };
    case "search":
      return { ...state, searchQuery: action.value };
    case "register-entry":
      if (!state.data.draftEntry.totals.isBalanced) {
        return {
          ...state,
          uiState: {
            ...state.uiState,
            message: state.feedback.mustBalance,
          },
        };
      }

      return {
        ...state,
        data: syncDifferenceMetric({
          ...state.data,
          recentEntries: [
            {
              id: `je-${Date.now()}`,
              entryNumber: state.data.draftEntry.entryNumber,
              dateLabel: formatDateLabel(state.data.draftEntry.date, state.feedback.noDate),
              concept: state.data.draftEntry.concept || state.feedback.untitled,
              type: state.data.draftEntry.type,
              amount: formatCurrency(
                Math.max(state.data.draftEntry.totals.debit, state.data.draftEntry.totals.credit),
                state.data.draftEntry.currency,
                state.locale,
              ),
              status: "posted",
            },
            ...state.data.recentEntries,
          ],
          draftEntry: createBlankDraft(state.data.draftEntry),
        }, state.locale),
        uiState: {
          ...state.uiState,
          page: "success",
          message: state.feedback.registered,
        },
      };
    case "save-draft":
      return {
        ...state,
        uiState: { ...state.uiState, page: "success", message: state.feedback.draftSaved },
      };
    case "refresh":
      return { ...state, uiState: { ...state.uiState, page: "success", message: state.feedback.refreshed } };
    case "retry":
      return { ...state, uiState: { ...state.uiState, page: "idle", message: undefined } };
    case "export":
      return {
        ...state,
        uiState: { ...state.uiState, page: "success", message: state.feedback.exported },
      };
    default:
      return state;
  }
}

export function filterAccountingDemoData(state: AccountingDemoState): AccountingDashboardData {
  const query = state.searchQuery.trim().toLowerCase();

  if (!query) return state.data;

  return {
    ...state.data,
    accounts: state.data.accounts.filter((account) =>
      [account.code, account.name, account.branchScope, account.type, account.normalBalance, account.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    ),
    recentEntries: state.data.recentEntries.filter((entry) =>
      [entry.entryNumber, entry.concept, entry.type, entry.status, entry.amount, entry.dateLabel]
        .join(" ")
        .toLowerCase()
        .includes(query),
    ),
  };
}

export type AccountingDemoFieldOptions = {
  accountTypes: AccountType[];
  normalBalances: NormalBalance[];
};
