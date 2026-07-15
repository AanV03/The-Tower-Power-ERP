"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountingHeader } from "./AccountingHeader";
import { AccountingKpiGrid } from "./AccountingKpiGrid";
import { AccountsPanel } from "./AccountsPanel";
import { JournalEntryEditor } from "./JournalEntryEditor";
import { JournalEntryList } from "./JournalEntryList";
import type { AccountingDashboardProps } from "./types";

export function AccountingDashboard(props: AccountingDashboardProps) {
  const { data, state, labels, actions } = props;
  const canRegister =
    data.draftEntry.totals.isBalanced && state.editor !== "loading" && state.page !== "error";

  return (
    <section className="erp-section space-y-6" role="main" aria-label={data.title}>
      {state.message ? (
        <div className={`flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
          state.page === "error"
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
        }`}>
          <span className="flex items-center gap-2 font-medium">
            {state.page === "error" ? (
              <AlertCircle className="size-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            )}
            {state.message}
          </span>
          {state.page === "error" ? (
            <Button variant="destructive" size="sm" onClick={actions?.onRetry}>
              {labels.retry}
            </Button>
          ) : null}
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

      <AccountingKpiGrid metrics={data.metrics} status={state.page} ariaLabel={labels.kpiLabel} />

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
            accountStatusLabels={props.accountStatusLabels}
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
