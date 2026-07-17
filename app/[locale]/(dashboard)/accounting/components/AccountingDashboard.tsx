"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, WalletCards } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingHeader } from "./AccountingHeader";
import { AccountingKpiGrid } from "./AccountingKpiGrid";
import { AccountsPanel } from "./AccountsPanel";
import { JournalEntryEditor, JournalEntryLinesEditor } from "./JournalEntryEditor";
import { JournalEntryList } from "./JournalEntryList";
import type { AccountingDashboardProps } from "./types";

export function AccountingDashboard(props: AccountingDashboardProps) {
  const { data, state, labels, actions } = props;
  const [activeTab, setActiveTab] = useState<"accounts" | "journal">("accounts");
  const lastMessageRef = useRef<string | undefined>(undefined);
  const canRegister =
    data.draftEntry.totals.isBalanced && state.editor !== "loading" && state.page !== "error";
  const primaryAction =
    activeTab === "accounts"
      ? {
          label: "Registrar cuenta",
          handler: actions?.onCreateAccount,
          enabled: state.accounts !== "loading" && state.page !== "error",
        }
      : {
          label: "Registrar poliza",
          handler: actions?.onRegisterEntry,
          enabled: canRegister,
        };

  useEffect(() => {
    if (!state.message || state.message === lastMessageRef.current) return;

    lastMessageRef.current = state.message;

    if (state.page === "error") {
      toast.error(state.message, actions?.onRetry ? {
        action: {
          label: labels.retry,
          onClick: actions.onRetry,
        },
      } : undefined);
      return;
    }

    toast.success(state.message);
  }, [actions, labels.retry, state.message, state.page]);

  return (
    <section className="erp-section space-y-6" role="main" aria-label={data.title}>
      <AccountingHeader
        title={data.title}
        subtitle={data.subtitle}
        periodLabel={data.periodLabel}
        branchLabel={data.branchLabel}
        labels={labels}
        actions={actions}
        primaryActionLabel={primaryAction.label}
        onPrimaryAction={primaryAction.handler}
        canPrimaryAction={primaryAction.enabled}
      />

      <AccountingKpiGrid metrics={data.metrics} status={state.page} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "accounts" | "journal")}
        className="accounting-tabs space-y-4"
      >
        <TabsList className="grid min-h-11 w-full grid-cols-2 overflow-visible rounded-lg border bg-muted/60 p-1">
          <TabsTrigger
            value="accounts"
            className="h-9 gap-2 rounded-md px-3 py-2 text-sm after:hidden hover:bg-background/60 data-active:shadow-sm"
          >
            <WalletCards className="size-4" aria-hidden="true" />
            Cuentas
          </TabsTrigger>
          <TabsTrigger
            value="journal"
            className="h-9 gap-2 rounded-md px-3 py-2 text-sm after:hidden hover:bg-background/60 data-active:shadow-sm"
          >
            <FileText className="size-4" aria-hidden="true" />
            Polizas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-0">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
            <AccountsPanel
              accounts={data.accounts}
              status={state.accounts}
              labels={labels}
              actions={actions}
              accountTypeLabels={props.accountTypeLabels}
              normalBalanceLabels={props.normalBalanceLabels}
            />
            <JournalEntryLinesEditor
              entry={data.draftEntry}
              status={state.editor}
              labels={labels}
              actions={actions}
            />
          </div>
        </TabsContent>

        <TabsContent value="journal" className="mt-0">
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
            <JournalEntryList
              entries={data.recentEntries}
              status={state.entries}
              labels={labels}
              actions={actions}
              journalEntryStatusConfig={props.journalEntryStatusConfig}
              journalEntryTypeOptions={props.journalEntryTypeOptions}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
