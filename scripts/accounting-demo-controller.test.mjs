import { test } from "node:test";
import assert from "node:assert/strict";

import {
  addJournalLine,
  accountingDemoReducer,
  createAccountingDemoState,
  removeJournalLine,
  updateJournalEntryField,
  updateJournalLine,
} from "../app/[locale]/(dashboard)/accounting/components/demo-controller.ts";

const balancedEntry = {
  id: "draft-001",
  entryNumber: "POL-BORRADOR",
  date: "2026-07-11",
  type: "income",
  concept: "Cobro de factura",
  reference: "FAC-1",
  currency: "MXN",
  status: "balanced",
  lines: [
    {
      id: "line-1",
      accountId: "acc-bank",
      accountCode: "1100-01",
      accountName: "Bancos nacionales",
      description: "Entrada",
      debit: 15000,
      credit: 0,
    },
    {
      id: "line-2",
      accountId: "acc-ar",
      accountCode: "1200-05",
      accountName: "Cuentas por cobrar",
      description: "Cancelacion",
      debit: 0,
      credit: 15000,
    },
  ],
  totals: { debit: 15000, credit: 15000, difference: 0, isBalanced: true },
};

test("updates journal entry fields without mutating the original entry", () => {
  const updated = updateJournalEntryField(balancedEntry, "concept", "Pago de nomina");

  assert.equal(updated.concept, "Pago de nomina");
  assert.equal(balancedEntry.concept, "Cobro de factura");
});

test("updates a line and recalculates debit credit balance", () => {
  const updated = updateJournalLine(balancedEntry, "line-2", "credit", 12000);

  assert.equal(updated.lines[1].credit, 12000);
  assert.deepEqual(updated.totals, {
    debit: 15000,
    credit: 12000,
    difference: 3000,
    isBalanced: false,
  });
  assert.equal(updated.status, "draft");
});

test("adds a blank line and keeps existing totals", () => {
  const updated = addJournalLine(balancedEntry);

  assert.equal(updated.lines.length, 3);
  assert.equal(updated.lines[2].accountId, "");
  assert.deepEqual(updated.totals, balancedEntry.totals);
});

test("does not remove a line when only two journal lines remain", () => {
  const updated = removeJournalLine(balancedEntry, "line-1");

  assert.equal(updated.lines.length, 2);
  assert.notEqual(updated, balancedEntry);
});

test("registers a balanced entry into recent entries and resets the draft", () => {
  const state = createAccountingDemoState(
    {
      title: "Contabilidad",
      subtitle: "",
      periodLabel: "",
      branchLabel: "",
      metrics: [],
      accounts: [],
      recentEntries: [],
      draftEntry: balancedEntry,
    },
    { page: "idle", accounts: "idle", entries: "idle", editor: "idle" },
  );

  const updated = accountingDemoReducer(state, { type: "register-entry" });

  assert.equal(updated.data.recentEntries.length, 1);
  assert.equal(updated.data.recentEntries[0].entryNumber, "POL-BORRADOR");
  assert.equal(updated.data.draftEntry.concept, "");
  assert.equal(updated.uiState.page, "success");
});

test("deletes a recent journal entry", () => {
  const state = createAccountingDemoState(
    {
      title: "Contabilidad",
      subtitle: "",
      periodLabel: "",
      branchLabel: "",
      metrics: [],
      accounts: [],
      recentEntries: [
        {
          id: "je-1",
          entryNumber: "POL-001",
          dateLabel: "Hoy",
          concept: "Entrada",
          type: "income",
          amount: "$100.00",
          status: "posted",
        },
      ],
      draftEntry: balancedEntry,
    },
    { page: "idle", accounts: "idle", entries: "idle", editor: "idle" },
  );

  const updated = accountingDemoReducer(state, { type: "delete-entry", entryId: "je-1" });

  assert.equal(updated.data.recentEntries.length, 0);
  assert.equal(updated.uiState.message, "Poliza eliminada localmente.");
});

test("refresh and export produce visible demo feedback", () => {
  const state = createAccountingDemoState(
    {
      title: "Contabilidad",
      subtitle: "",
      periodLabel: "",
      branchLabel: "",
      metrics: [],
      accounts: [],
      recentEntries: [],
      draftEntry: balancedEntry,
    },
    { page: "idle", accounts: "idle", entries: "idle", editor: "idle" },
  );

  const refreshed = accountingDemoReducer(state, { type: "refresh" });
  const exported = accountingDemoReducer(state, { type: "export" });

  assert.equal(refreshed.uiState.message, "Datos demo actualizados.");
  assert.equal(exported.uiState.message, "Exportacion simulada lista.");
});
