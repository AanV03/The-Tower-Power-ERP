# Accounting Operational Center Design

## Scope

Build `app/[locale]/(dashboard)/accounting` as a formal accounting work center for accounts and journal entries. The module focuses on:

- Chart of accounts visibility.
- Journal entry creation with debit and credit lines.
- Balance validation before posting.
- Recent journal entry traceability.

Out of scope for this iteration:

- Bank reconciliation.
- Tax filing workflows.
- Real API integrations.
- Persistent client state beyond mock-driven view behavior.

## Primary User Actions

1. Register a journal entry.
   - Primary action in the header and editor footer.
   - Enabled only when the draft entry is balanced and has valid required fields.

2. Search accounts or journal entries.
   - Persistent search field in the header or toolbar.
   - Uses callback props such as `onSearchChange` and `onSearchSubmit`, not local filtering logic.

3. Validate accounting balance.
   - Always visible in the editor summary.
   - Shows debit total, credit total, and difference.
   - Uses status badges and inline feedback instead of modal interruptions.

## UX Structure

The recommended layout is an operational ERP workspace:

1. Header
   - Module title and subtitle.
   - Period and branch context.
   - Primary button: "Registrar poliza".
   - Secondary icon buttons: refresh, export, search trigger if needed.

2. KPI grid
   - Active accounts.
   - Draft journal entries.
   - Posted journal entries.
   - Balance difference.

3. Main workspace
   - Left/main: `JournalEntryEditor`.
   - Right/sidebar: `AccountsPanel` and `JournalEntryList`.

4. Status and feedback layer
   - Loading skeletons.
   - Empty states for missing accounts or journal entries.
   - Error banner with retry callback.
   - Success notification state through `feedback` props.

## Component Architecture

`page.tsx`

- Imports mock data.
- Defines table/field/action configuration.
- Passes all data into `AccountingDashboard`.
- Contains TODO comments for future hooks.

`AccountingDashboard`

- Receives all render data by props.
- Owns layout composition only.
- Does not fetch data.
- Does not keep API state.

`AccountingHeader`

- Displays title, subtitle, period, branch, and action buttons.
- Receives `actions`, `search`, and labels through props.

`AccountingKpiGrid`

- Receives `metrics`.
- Reuses Gerpy card language and existing Tailwind tokens.

`JournalEntryEditor`

- Receives `entry`, `lineColumns`, `typeOptions`, `status`, `labels`, and callbacks.
- Renders general fields and debit/credit lines.
- Calculates no hidden business state. Balance totals come from props.
- Can display read-only mock values until hooks are connected.

`AccountsPanel`

- Receives accounts, columns/list config, loading/empty/error state.
- Shows compact account rows with account code, name, type, normal balance, status.

`JournalEntryList`

- Receives recent entries, status config, and click callback.
- Shows entry number, concept, date, type, amount, and posting status.

`AccountingStateBlock`

- Shared empty/loading/error display for side panels.
- Keeps conditional UI consistent.

## Mock Data Schema

```ts
export type AccountingUiStatus = "idle" | "loading" | "empty" | "error" | "success";

export type AccountingMetricTone = "default" | "success" | "warning" | "danger";

export type AccountingMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: AccountingMetricTone;
};

export type AccountStatus = "active" | "inactive" | "locked";
export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type NormalBalance = "debit" | "credit";

export type AccountingAccount = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  status: AccountStatus;
  branchScope: string;
};

export type JournalEntryStatus = "draft" | "balanced" | "posted" | "void";
export type JournalEntryType = "income" | "expense" | "daily" | "adjustment";

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
```

## Configurable Constants

Keep these outside JSX and pass them as props:

- `ACCOUNTING_ACTIONS`
- `ACCOUNTING_METRIC_CONFIG`
- `ACCOUNT_TYPE_LABELS`
- `JOURNAL_ENTRY_TYPE_OPTIONS`
- `JOURNAL_ENTRY_STATUS_CONFIG`
- `JOURNAL_LINE_COLUMNS`
- `ACCOUNT_PANEL_COLUMNS`

This prevents hardcoded labels and allows localization or API metadata later.

## Logic Injection Guide

`page.tsx`

```ts
// TODO: Connect useAccountingDashboardData or server loader here.
// TODO: Replace mockAccountingData with API-backed dashboard payload.
// TODO: Connect tenant/branch/period context when available.
```

`AccountingDashboard`

```ts
// TODO: Wire searchQuery, selectedPeriod, and selectedBranch from parent hooks.
// TODO: Connect action callbacks to mutations: create draft, post entry, refresh.
```

`JournalEntryEditor`

```ts
// TODO: Connect onFieldChange to controlled form hook.
// TODO: Connect onLineChange to journal entry form reducer.
// TODO: Connect onAddLine and onRemoveLine to line array hook.
// TODO: Connect onValidateBalance to accounting validation service if server-side validation is required.
// TODO: Connect onSubmit to postJournalEntry mutation.
```

`AccountsPanel`

```ts
// TODO: Connect account search to useAccountsQuery.
// TODO: Connect account row selection to editor line account picker.
```

`JournalEntryList`

```ts
// TODO: Connect entry click to selected journal entry drawer or detail route.
// TODO: Connect filters to useJournalEntriesQuery.
```

## UI State Table

| State | Condition | UI behavior |
| --- | --- | --- |
| Page loading | `state.page === "loading"` | Show KPI/editor/list skeletons. |
| Page error | `state.page === "error"` | Show top error banner and retry action. |
| Accounts loading | `state.accounts === "loading"` | Show account list skeleton. |
| Accounts empty | `accounts.length === 0` | Show empty state with "Configurar catalogo". |
| Entries loading | `state.entries === "loading"` | Show recent entries skeleton. |
| Entries empty | `recentEntries.length === 0` | Show empty state with "Crear primera poliza". |
| Editor disabled | `state.editor === "loading" || state.page === "error"` | Disable editor controls and primary submit. |
| Entry balanced | `draftEntry.totals.isBalanced === true` | Show success badge and enable submit. |
| Entry unbalanced | `draftEntry.totals.isBalanced === false` | Show warning/danger badge and difference row. |
| Submit success | `state.page === "success"` | Show compact success feedback. |

## Visual System

Use existing Gerpy design tokens:

- `erp-section` for page spacing.
- `erp-page-grid` for metrics.
- `glass-effect` or card variants for dashboard cards.
- `bg-card`, `bg-background`, `text-muted-foreground`, `border-border`, `primary`, `destructive`.
- `headerPrimaryActionClass` for the primary header CTA.
- Existing shadcn/base UI components: `Button`, `Card`, `Badge`, `Input`, `Table`.

Avoid:

- Large marketing hero sections.
- Decorative gradients or visual noise.
- Nested cards inside cards.
- Component-owned API state.
- Hardcoded data inside presentational components.

## Responsive Behavior

- Mobile: stacked header, KPI grid in one column, editor first, accounts and entries below.
- Tablet: KPI grid in two columns, editor full width, side panels in two columns.
- Desktop: editor in main column, accounts/recent entries in right rail.
- All tables and debit/credit lines must use horizontal overflow where needed.
- Footer totals must wrap cleanly on small screens.

## Verification Plan

- Run `pnpm run lint`.
- Inspect responsive layout in desktop and mobile widths.
- Verify no component imports API routes or hooks.
- Verify no `useEffect` for data fetching.
- Verify mock data schema is exported and reusable.
