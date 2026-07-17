"use client";

import { useMemo, useReducer } from "react";

import { AccountingDashboard } from "./AccountingDashboard";
import {
  accountingDemoReducer,
  createAccountingDemoState,
  filterAccountingDemoData,
} from "./demo-controller";
import type { AccountingDashboardProps } from "./types";

export function AccountingDemoController(props: AccountingDashboardProps) {
  const [demoState, dispatch] = useReducer(
    accountingDemoReducer,
    createAccountingDemoState(props.data, props.state),
  );

  const filteredData = useMemo(() => filterAccountingDemoData(demoState), [demoState]);

  return (
    <AccountingDashboard
      {...props}
      data={filteredData}
      state={demoState.uiState}
      actions={{
        onRegisterEntry: () => dispatch({ type: "register-entry" }),
        onSaveDraft: () => dispatch({ type: "save-draft" }),
        onRefresh: () => dispatch({ type: "refresh" }),
        onExport: () => dispatch({ type: "export" }),
        onRetry: () => dispatch({ type: "retry" }),
        onSearchChange: (value) => dispatch({ type: "search", value }),
        onSearchSubmit: () => dispatch({ type: "refresh" }),
        onAddLine: () => dispatch({ type: "add-line" }),
        onRemoveLine: (lineId) => dispatch({ type: "remove-line", lineId }),
        onLineChange: (lineId, field, value) =>
          dispatch({ type: "line-field", lineId, field, value }),
        onEntryFieldChange: (field, value) =>
          dispatch({ type: "entry-field", field: field as "date" | "type" | "concept" | "reference", value }),
        onSelectAccount: (accountId) => dispatch({ type: "select-account", accountId }),
        onSelectEntry: (entryId) => dispatch({ type: "select-entry", entryId }),
        onDeleteEntry: (entryId) => dispatch({ type: "delete-entry", entryId }),
        onCreateAccount: () => dispatch({ type: "create-account" }),
      }}
    />
  );
}
