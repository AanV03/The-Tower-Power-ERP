# Accounting Operational Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the accounting page as a responsive ERP work center for accounts, journal entries, debit/credit lines, and balance validation using injected mock data.

**Architecture:** `page.tsx` remains a thin server component that imports mock/config data and passes it to a client dashboard. The dashboard composes focused presentational components that receive data, UI state, labels, config, and callbacks by props. No API calls, data-fetching `useEffect`, or component-owned API state are introduced.

**Tech Stack:** Next.js 15 app router, React 19, TypeScript, Tailwind CSS v4 tokens, existing Gerpy shadcn/base UI components, lucide-react icons.

## Global Constraints

- Scope: accounts and journal entries only; no bank reconciliation or tax filing workflow.
- Data source: mock-driven view with TypeScript schemas exported for future hooks.
- Logic: no API fetching, no `useEffect` for data loading, no hardcoded business arrays inside JSX.
- UX: primary actions are register journal entry, search accounts or entries, and validate balance.
- Visual system: use `erp-section`, `erp-page-grid`, `glass-effect`, `bg-card`, `bg-background`, `text-muted-foreground`, `border-border`, `primary`, `destructive`, `headerPrimaryActionClass`, `Button`, `Card`, `Badge`, `Input`, and `Table`.
- Responsive: mobile stacks content; tablet uses two-column side panels; desktop uses main editor plus right rail.
- Verification: run `pnpm run lint` and `pnpm run typecheck`.

---

## File Structure

- Modify `app/[locale]/(dashboard)/accounting/page.tsx`
  - Thin route component. Imports mocks/config and renders `AccountingDashboard`.

- Replace `app/[locale]/(dashboard)/accounting/components/AccountingDashboard.tsx`
  - Client layout composition for header, KPIs, editor, account panel, and recent entries.

- Replace `app/[locale]/(dashboard)/accounting/components/JournalEntryEditor.tsx`
  - Controlled/presentational journal entry editor with debit/credit lines and balance footer.

- Replace `app/[locale]/(dashboard)/accounting/components/JournalEntryList.tsx`
  - Recent journal entries panel using injected summaries and status config.

- Create `app/[locale]/(dashboard)/accounting/components/AccountingHeader.tsx`
  - Header, search field, period/branch context, and top actions.

- Create `app/[locale]/(dashboard)/accounting/components/AccountingKpiGrid.tsx`
  - Metric card grid for accounting control KPIs.

- Create `app/[locale]/(dashboard)/accounting/components/AccountsPanel.tsx`
  - Compact chart-of-accounts panel.

- Create `app/[locale]/(dashboard)/accounting/components/AccountingStateBlock.tsx`
  - Shared loading/empty/error rendering for panels.

- Create `app/[locale]/(dashboard)/accounting/components/types.ts`
  - All accounting view schemas and prop contracts.

- Create `app/[locale]/(dashboard)/accounting/components/config.ts`
  - Labels, columns, type options, status config, mock actions.

- Create `app/[locale]/(dashboard)/accounting/components/mock-data.ts`
  - Mock dashboard payload and UI state.

---

### Task 1: Define Accounting View Contracts And Config

**Files:**
- Create: `app/[locale]/(dashboard)/accounting/components/types.ts`
- Create: `app/[locale]/(dashboard)/accounting/components/config.ts`
- Create: `app/[locale]/(dashboard)/accounting/components/mock-data.ts`

**Interfaces:**
- Produces: `AccountingDashboardData`, `AccountingDashboardState`, `AccountingDashboardProps`, `JournalEntryEditorProps`, `AccountsPanelProps`, `JournalEntryListProps`.
- Produces: `accountingLabels`, `journalEntryTypeOptions`, `journalEntryStatusConfig`, `journalLineColumns`, `accountPanelColumns`, `accountTypeLabels`, `mockAccountingData`, `mockAccountingState`.
- Consumed by: all later tasks.

- [ ] **Step 1: Create `types.ts`**

```ts
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
};

export type AccountingDashboardProps = {
  locale: Locale;
  data: AccountingDashboardData;
  state: AccountingDashboardState;
  labels: AccountingLabels;
  actions?: AccountingActionHandlers;
  accountTypeLabels: Record<AccountType, string>;
  normalBalanceLabels: Record<NormalBalance, string>;
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
  "labels" | "actions" | "accountTypeLabels" | "normalBalanceLabels"
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
```

- [ ] **Step 2: Create `config.ts`**

```ts
import type {
  AccountingLabels,
  AccountType,
  JournalEntryStatus,
  JournalEntryType,
  NormalBalance,
  SelectOption,
  StatusVisualConfig,
} from "./types";

export const accountingLabels: AccountingLabels = {
  searchPlaceholder: "Buscar cuenta o poliza...",
  registerEntry: "Registrar poliza",
  refresh: "Actualizar",
  export: "Exportar",
  validate: "Validar cuadre",
  editorTitle: "Editor de poliza",
  editorDescription: "Captura cargos y abonos con validacion formal de cuadre.",
  date: "Fecha",
  type: "Tipo",
  concept: "Concepto general",
  reference: "Referencia",
  debit: "Debe",
  credit: "Haber",
  difference: "Diferencia",
  balanced: "Cuadrada",
  unbalanced: "Descuadrada",
  addLine: "Agregar partida",
  saveDraft: "Guardar borrador",
  accountsTitle: "Catalogo de cuentas",
  accountsDescription: "Cuentas disponibles para integrar la poliza.",
  entriesTitle: "Polizas recientes",
  entriesDescription: "Actividad contable del periodo actual.",
  emptyAccountsTitle: "Sin cuentas configuradas",
  emptyAccountsDescription: "Configura el catalogo contable antes de registrar polizas.",
  emptyEntriesTitle: "Sin polizas recientes",
  emptyEntriesDescription: "Crea la primera poliza para iniciar el control contable.",
  errorTitle: "No se pudo cargar contabilidad",
  retry: "Reintentar",
};

export const accountTypeLabels: Record<AccountType, string> = {
  asset: "Activo",
  liability: "Pasivo",
  equity: "Capital",
  income: "Ingreso",
  expense: "Gasto",
};

export const normalBalanceLabels: Record<NormalBalance, string> = {
  debit: "Deudora",
  credit: "Acreedora",
};

export const journalEntryTypeOptions: SelectOption<JournalEntryType>[] = [
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Egreso" },
  { value: "daily", label: "Diario" },
  { value: "adjustment", label: "Ajuste" },
];

export const journalEntryStatusConfig: Record<JournalEntryStatus, StatusVisualConfig> = {
  draft: { label: "Borrador", className: "border-border text-muted-foreground" },
  balanced: { label: "Cuadrada", className: "bg-emerald-500/15 text-emerald-600" },
  posted: { label: "Registrada", className: "bg-primary/15 text-primary" },
  void: { label: "Cancelada", className: "bg-destructive/15 text-destructive" },
};

export const journalLineColumns = [
  { id: "account", label: "Cuenta" },
  { id: "description", label: "Descripcion" },
  { id: "debit", label: "Debe", align: "right" },
  { id: "credit", label: "Haber", align: "right" },
] as const;

export const accountPanelColumns = [
  { id: "code", label: "Codigo" },
  { id: "name", label: "Cuenta" },
  { id: "normalBalance", label: "Naturaleza" },
  { id: "status", label: "Estado" },
] as const;
```

- [ ] **Step 3: Create `mock-data.ts`**

```ts
import type { AccountingDashboardData, AccountingDashboardState } from "./types";

export const mockAccountingData: AccountingDashboardData = {
  title: "Contabilidad",
  subtitle: "Cuentas, polizas y control formal de cargos y abonos.",
  periodLabel: "Periodo: Julio 2026",
  branchLabel: "Sucursal: Consolidado",
  metrics: [
    { id: "accounts", label: "Cuentas activas", value: "84", helper: "Catalogo operativo", tone: "default" },
    { id: "drafts", label: "Polizas borrador", value: "6", helper: "Requieren revision", tone: "warning" },
    { id: "posted", label: "Polizas registradas", value: "128", helper: "Mes actual", tone: "success" },
    { id: "difference", label: "Diferencia por cuadrar", value: "$0.00", helper: "Debe vs haber", tone: "success" },
  ],
  accounts: [
    { id: "acc-bank", code: "1100-01", name: "Bancos nacionales", type: "asset", normalBalance: "debit", status: "active", branchScope: "Consolidado" },
    { id: "acc-ar", code: "1200-05", name: "Cuentas por cobrar", type: "asset", normalBalance: "debit", status: "active", branchScope: "Consolidado" },
    { id: "acc-revenue", code: "4100-01", name: "Ingresos por membresias", type: "income", normalBalance: "credit", status: "active", branchScope: "Todas" },
    { id: "acc-payroll", code: "5100-03", name: "Gasto de nomina", type: "expense", normalBalance: "debit", status: "active", branchScope: "Centro" },
    { id: "acc-tax", code: "2100-02", name: "Impuestos por pagar", type: "liability", normalBalance: "credit", status: "locked", branchScope: "Fiscal" },
  ],
  recentEntries: [
    { id: "je-124", entryNumber: "POL-00124", dateLabel: "Hoy, 10:30", concept: "Nomina quincenal", type: "expense", amount: "$142,500.00", status: "posted" },
    { id: "je-123", entryNumber: "POL-00123", dateLabel: "Hoy, 09:15", concept: "Cobro factura 4920", type: "income", amount: "$15,000.00", status: "balanced" },
    { id: "je-122", entryNumber: "POL-00122", dateLabel: "Ayer", concept: "Depreciacion de equipo", type: "daily", amount: "$4,200.00", status: "posted" },
    { id: "je-121", entryNumber: "POL-00121", dateLabel: "Ayer", concept: "Pago servicio electrico", type: "expense", amount: "$1,850.00", status: "draft" },
  ],
  draftEntry: {
    id: "draft-001",
    entryNumber: "POL-BORRADOR",
    date: "2026-07-10",
    type: "income",
    concept: "Cobro de factura de membresias",
    reference: "FAC-4920",
    currency: "MXN",
    status: "balanced",
    lines: [
      { id: "line-1", accountId: "acc-bank", accountCode: "1100-01", accountName: "Bancos nacionales", description: "Entrada bancaria", debit: 15000, credit: 0 },
      { id: "line-2", accountId: "acc-ar", accountCode: "1200-05", accountName: "Cuentas por cobrar", description: "Cancelacion de saldo", debit: 0, credit: 15000 },
    ],
    totals: { debit: 15000, credit: 15000, difference: 0, isBalanced: true },
  },
};

export const mockAccountingState: AccountingDashboardState = {
  page: "idle",
  accounts: "idle",
  entries: "idle",
  editor: "idle",
};
```

- [ ] **Step 4: Verify types compile after import**

Run: `pnpm run typecheck`

Expected: TypeScript reports no new errors from accounting type/config files.

---

### Task 2: Wire Thin Page And Dashboard Layout

**Files:**
- Modify: `app/[locale]/(dashboard)/accounting/page.tsx`
- Replace: `app/[locale]/(dashboard)/accounting/components/AccountingDashboard.tsx`
- Create: `app/[locale]/(dashboard)/accounting/components/AccountingHeader.tsx`
- Create: `app/[locale]/(dashboard)/accounting/components/AccountingKpiGrid.tsx`

**Interfaces:**
- Consumes: exports from Task 1.
- Produces: visible accounting page shell with header, actions, context, KPIs, and layout slots.

- [ ] **Step 1: Update `page.tsx`**

```tsx
import { AccountingDashboard } from "./components/AccountingDashboard";
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
    <AccountingDashboard
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
```

- [ ] **Step 2: Create `AccountingHeader.tsx`**

```tsx
"use client";

import { Calculator, Download, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import type { AccountingActionHandlers, AccountingLabels } from "./types";

export function AccountingHeader({
  title,
  subtitle,
  periodLabel,
  branchLabel,
  labels,
  actions,
  canRegister,
}: {
  title: string;
  subtitle: string;
  periodLabel: string;
  branchLabel: string;
  labels: AccountingLabels;
  actions?: AccountingActionHandlers;
  canRegister: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Calculator className="size-7 text-primary" aria-hidden="true" />
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            <span className="rounded-md border border-border bg-background px-2.5 py-1">{periodLabel}</span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1">{branchLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className={cn(headerPrimaryActionClass, "focus-visible:ring-2 focus-visible:ring-offset-2")}
            disabled={!canRegister}
            onClick={actions?.onRegisterEntry}
          >
            {labels.registerEntry}
          </Button>
          <Button variant="outline" size="icon" aria-label={labels.refresh} title={labels.refresh} onClick={actions?.onRefresh}>
            <RefreshCw className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" aria-label={labels.export} title={labels.export} onClick={actions?.onExport}>
            <Download className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          className="h-10 pl-9"
          placeholder={labels.searchPlaceholder}
          onChange={(event) => actions?.onSearchChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") actions?.onSearchSubmit?.();
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `AccountingKpiGrid.tsx`**

```tsx
"use client";

import { AlertTriangle, CheckCircle2, CircleDollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import type { AccountingMetric, AccountingUiStatus } from "./types";

const toneClass = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/15 text-emerald-600",
  warning: "bg-[var(--brand-yellow)] text-[var(--brand-ink)]",
  danger: "bg-destructive/15 text-destructive",
};

const icons = [FileText, AlertTriangle, CheckCircle2, CircleDollarSign];

export function AccountingKpiGrid({
  metrics,
  status,
}: {
  metrics: AccountingMetric[];
  status: AccountingUiStatus;
}) {
  if (status === "loading") {
    return <CardGridSkeleton count={4} columns={4} />;
  }

  return (
    <div className="erp-page-grid" aria-label="Indicadores contables">
      {metrics.map((metric, index) => {
        const Icon = icons[index] ?? FileText;

        return (
          <Card key={metric.id} className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <span className={cn("rounded-md p-1.5", toneClass[metric.tone])}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-normal text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Replace `AccountingDashboard.tsx` layout**

```tsx
"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountingHeader } from "./AccountingHeader";
import { AccountingKpiGrid } from "./AccountingKpiGrid";
import { AccountsPanel } from "./AccountsPanel";
import { JournalEntryEditor } from "./JournalEntryEditor";
import { JournalEntryList } from "./JournalEntryList";
import type { AccountingDashboardProps } from "./types";

export function AccountingDashboard(props: AccountingDashboardProps) {
  const { data, state, labels, actions } = props;
  const canRegister = data.draftEntry.totals.isBalanced && state.editor !== "loading" && state.page !== "error";

  return (
    <section className="erp-section space-y-6" role="main" aria-label={data.title}>
      {state.page === "error" ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle className="size-4" aria-hidden="true" />
            {state.message ?? labels.errorTitle}
          </span>
          <Button variant="destructive" size="sm" onClick={actions?.onRetry}>{labels.retry}</Button>
        </div>
      ) : null}

      <AccountingHeader
        title={data.title}
        subtitle={data.subtitle}
        periodLabel={data.periodLabel}
        branchLabel={data.branchLabel}
        labels={labels}
        actions={actions}
        canRegister={canRegister}
      />

      <AccountingKpiGrid metrics={data.metrics} status={state.page} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <JournalEntryEditor
          locale={props.locale}
          entry={data.draftEntry}
          status={state.editor}
          labels={labels}
          actions={actions}
          journalEntryTypeOptions={props.journalEntryTypeOptions}
          journalEntryStatusConfig={props.journalEntryStatusConfig}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <AccountsPanel
            accounts={data.accounts}
            status={state.accounts}
            labels={labels}
            actions={actions}
            accountTypeLabels={props.accountTypeLabels}
            normalBalanceLabels={props.normalBalanceLabels}
          />
          <JournalEntryList
            entries={data.recentEntries}
            status={state.entries}
            labels={labels}
            actions={actions}
            journalEntryStatusConfig={props.journalEntryStatusConfig}
            journalEntryTypeOptions={props.journalEntryTypeOptions}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm run typecheck`

Expected: Errors for missing `AccountsPanel`, `JournalEntryEditor`, or `JournalEntryList` are acceptable until later tasks; no errors should originate from `AccountingHeader` or `AccountingKpiGrid`.

---

### Task 3: Build Shared State Block And Side Panels

**Files:**
- Create: `app/[locale]/(dashboard)/accounting/components/AccountingStateBlock.tsx`
- Create: `app/[locale]/(dashboard)/accounting/components/AccountsPanel.tsx`
- Replace: `app/[locale]/(dashboard)/accounting/components/JournalEntryList.tsx`

**Interfaces:**
- Consumes: Task 1 types/config.
- Produces: reusable panel states and right rail content.

- [ ] **Step 1: Create `AccountingStateBlock.tsx`**

```tsx
"use client";

import { ErrorEmpty, NoDataEmpty } from "@/components/empty-state";
import { ListSkeleton } from "@/components/skeletons";
import type { AccountingUiStatus } from "./types";

export function AccountingStateBlock({
  status,
  emptyTitle,
  emptyDescription,
  errorTitle,
  retryLabel,
  onRetry,
}: {
  status: AccountingUiStatus;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  retryLabel: string;
  onRetry?: () => void;
}) {
  if (status === "loading") return <ListSkeleton items={5} />;

  if (status === "error") {
    return (
      <ErrorEmpty
        title={errorTitle}
        action={onRetry ? { label: retryLabel, onClick: onRetry } : undefined}
      />
    );
  }

  if (status === "empty") {
    return <NoDataEmpty title={emptyTitle} description={emptyDescription} />;
  }

  return null;
}
```

- [ ] **Step 2: Create `AccountsPanel.tsx`**

```tsx
"use client";

import { Lock, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AccountingStateBlock } from "./AccountingStateBlock";
import type { AccountsPanelProps } from "./types";

const accountStatusClass = {
  active: "bg-emerald-500/15 text-emerald-600",
  inactive: "border-border text-muted-foreground",
  locked: "bg-[var(--brand-yellow)] text-[var(--brand-ink)]",
};

export function AccountsPanel({
  accounts,
  status,
  labels,
  actions,
  accountTypeLabels,
  normalBalanceLabels,
}: AccountsPanelProps) {
  const stateBlock = status !== "idle" || accounts.length === 0;

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <WalletCards className="size-4 text-primary" aria-hidden="true" />
          {labels.accountsTitle}
        </CardTitle>
        <CardDescription>{labels.accountsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {stateBlock ? (
          <AccountingStateBlock
            status={accounts.length === 0 && status === "idle" ? "empty" : status}
            emptyTitle={labels.emptyAccountsTitle}
            emptyDescription={labels.emptyAccountsDescription}
            errorTitle={labels.errorTitle}
            retryLabel={labels.retry}
            onRetry={actions?.onRetry}
          />
        ) : (
          accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => actions?.onSelectAccount?.(account.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{account.code} - {account.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {accountTypeLabels[account.type]} - {normalBalanceLabels[account.normalBalance]} - {account.branchScope}
                  </p>
                </div>
                <Badge variant="outline" className={cn("shrink-0", accountStatusClass[account.status])}>
                  {account.status === "locked" ? <Lock className="size-3" aria-hidden="true" /> : null}
                  {account.status === "active" ? "Activa" : account.status === "locked" ? "Bloqueada" : "Inactiva"}
                </Badge>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Replace `JournalEntryList.tsx`**

```tsx
"use client";

import { FileClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AccountingStateBlock } from "./AccountingStateBlock";
import type { JournalEntryListProps } from "./types";

export function JournalEntryList({
  entries,
  status,
  labels,
  actions,
  journalEntryStatusConfig,
  journalEntryTypeOptions,
}: JournalEntryListProps) {
  const stateBlock = status !== "idle" || entries.length === 0;

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileClock className="size-4 text-primary" aria-hidden="true" />
          {labels.entriesTitle}
        </CardTitle>
        <CardDescription>{labels.entriesDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {stateBlock ? (
          <AccountingStateBlock
            status={entries.length === 0 && status === "idle" ? "empty" : status}
            emptyTitle={labels.emptyEntriesTitle}
            emptyDescription={labels.emptyEntriesDescription}
            errorTitle={labels.errorTitle}
            retryLabel={labels.retry}
            onRetry={actions?.onRetry}
          />
        ) : (
          entries.map((entry) => {
            const statusConfig = journalEntryStatusConfig[entry.status];
            const typeLabel = journalEntryTypeOptions.find((option) => option.value === entry.type)?.label ?? entry.type;

            return (
              <button
                key={entry.id}
                type="button"
                className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => actions?.onSelectEntry?.(entry.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{entry.entryNumber}</span>
                      <span className="text-xs text-muted-foreground">{entry.dateLabel}</span>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-foreground">{entry.concept}</p>
                    <p className="mt-1 text-xs uppercase text-muted-foreground">{typeLabel}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">{entry.amount}</p>
                    <Badge variant="outline" className={cn("mt-2", statusConfig.className)}>{statusConfig.label}</Badge>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm run typecheck`

Expected: Only `JournalEntryEditor` may still report mismatched interface until Task 4.

---

### Task 4: Replace Journal Entry Editor

**Files:**
- Replace: `app/[locale]/(dashboard)/accounting/components/JournalEntryEditor.tsx`

**Interfaces:**
- Consumes: `JournalEntryEditorProps`.
- Produces: presentational editor with formal debit/credit table, balance status, disabled submit when unbalanced.

- [ ] **Step 1: Replace `JournalEntryEditor.tsx`**

```tsx
"use client";

import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import type { JournalEntryEditorProps } from "./types";

export function JournalEntryEditor({
  locale,
  entry,
  status,
  labels,
  actions,
  journalEntryTypeOptions,
  journalEntryStatusConfig,
}: JournalEntryEditorProps) {
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency: entry.currency });
  const disabled = status === "loading" || status === "error";
  const statusConfig = journalEntryStatusConfig[entry.totals.isBalanced ? "balanced" : "draft"];

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{labels.editorTitle}</CardTitle>
            <CardDescription>{labels.editorDescription}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("w-fit", entry.totals.isBalanced ? statusConfig.className : "bg-destructive/15 text-destructive")}
          >
            {entry.totals.isBalanced ? <CheckCircle2 className="size-3" aria-hidden="true" /> : <AlertCircle className="size-3" aria-hidden="true" />}
            {entry.totals.isBalanced ? labels.balanced : labels.unbalanced}
          </Badge>
        </div>

        <div className="grid gap-3 rounded-lg border border-border bg-background/70 p-3 sm:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">{labels.date}</span>
            <Input
              type="date"
              value={entry.date}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("date", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">{labels.type}</span>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              value={entry.type}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("type", event.target.value)}
            >
              {journalEntryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">{labels.concept}</span>
            <Input
              value={entry.concept}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("concept", event.target.value)}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-4">
            <span className="text-xs font-semibold uppercase text-muted-foreground">{labels.reference}</span>
            <Input
              value={entry.reference}
              disabled={disabled}
              onChange={(event) => actions?.onEntryFieldChange?.("reference", event.target.value)}
            />
          </label>
        </div>
      </CardHeader>

      <CardContent>
        {status === "loading" ? (
          <TableSkeleton rows={4} columns={5} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="min-w-[220px]">Cuenta</TableHead>
                  <TableHead className="min-w-[220px]">Descripcion</TableHead>
                  <TableHead className="min-w-[120px] text-right">{labels.debit}</TableHead>
                  <TableHead className="min-w-[120px] text-right">{labels.credit}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          value={`${line.accountCode} - ${line.accountName}`}
                          disabled={disabled}
                          onChange={(event) => actions?.onLineChange?.(line.id, "accountName", event.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">{line.accountId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.description}
                        disabled={disabled}
                        onChange={(event) => actions?.onLineChange?.(line.id, "description", event.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-right tabular-nums"
                        type="number"
                        value={line.debit || ""}
                        disabled={disabled}
                        onChange={(event) => actions?.onLineChange?.(line.id, "debit", Number(event.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-right tabular-nums"
                        type="number"
                        value={line.credit || ""}
                        disabled={disabled}
                        onChange={(event) => actions?.onLineChange?.(line.id, "credit", Number(event.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={disabled || entry.lines.length <= 2}
                        onClick={() => actions?.onRemoveLine?.(line.id)}
                        aria-label="Eliminar partida"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t border-border bg-muted/20 p-3">
              <Button variant="ghost" size="sm" disabled={disabled} onClick={actions?.onAddLine}>
                <Plus className="size-4" aria-hidden="true" />
                {labels.addLine}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t border-border/70 pt-4">
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase text-muted-foreground">{labels.debit}</p>
            <p className="text-lg font-semibold tabular-nums">{formatter.format(entry.totals.debit)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase text-muted-foreground">{labels.credit}</p>
            <p className="text-lg font-semibold tabular-nums">{formatter.format(entry.totals.credit)}</p>
          </div>
          <div className={cn("rounded-lg border p-3", entry.totals.isBalanced ? "border-emerald-500/25 bg-emerald-500/10" : "border-destructive/25 bg-destructive/10")}>
            <p className="text-xs uppercase text-muted-foreground">{labels.difference}</p>
            <p className={cn("text-lg font-semibold tabular-nums", entry.totals.isBalanced ? "text-emerald-600" : "text-destructive")}>
              {formatter.format(entry.totals.difference)}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={disabled} onClick={actions?.onSaveDraft}>{labels.saveDraft}</Button>
          <Button disabled={disabled || !entry.totals.isBalanced} onClick={actions?.onRegisterEntry}>{labels.registerEntry}</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm run typecheck`

Expected: Accounting components compile with no TypeScript errors.

---

### Task 5: Final Verification And Polish

**Files:**
- Modify any accounting component only if verification finds a concrete issue.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: lint-clean, typecheck-clean, responsive accounting page.

- [ ] **Step 1: Run linter**

Run: `pnpm run lint`

Expected: PASS. If Next lint is unavailable in this installed Next version, record the exact failure and run `pnpm run typecheck` as the primary static verification.

- [ ] **Step 2: Run typecheck**

Run: `pnpm run typecheck`

Expected: PASS.

- [ ] **Step 3: Manual responsive inspection**

Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000/es/accounting` or the localized route used by the dashboard shell.

Verify:

- Mobile width: header stacks, search fits, metrics are one column, editor appears before side panels, totals wrap.
- Tablet width: side panels use two columns below editor.
- Desktop width: editor is the main column and accounts/recent entries sit in the right rail.
- Register buttons are disabled only when `draftEntry.totals.isBalanced` is false or editor/page state disables them.
- Empty/error/loading state props can be simulated by changing `mockAccountingState`.

- [ ] **Step 4: Confirm no forbidden logic**

Run:

```bash
rg -n "useEffect|fetch\\(|axios|prisma|/api/" app/[locale]/(dashboard)/accounting
```

Expected: no matches for data fetching or API access. Existing `use client` declarations are acceptable.

- [ ] **Step 5: Commit implementation**

```bash
git add app/[locale]/(dashboard)/accounting docs/superpowers/plans/2026-07-11-accounting-operational-center.md
git commit -m "feat: build accounting operational center"
```
