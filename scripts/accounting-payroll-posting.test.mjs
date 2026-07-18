import { test } from "node:test";
import assert from "node:assert/strict";

import { isBalancedJournal } from "../lib/accounting/payroll-posting.ts";

test("isBalancedJournal accepts matching debit and credit totals", () => {
  assert.equal(
    isBalancedJournal([
      { debit: 100, credit: 0 },
      { debit: 0, credit: 100 },
    ]),
    true,
  );
});

test("isBalancedJournal rejects mismatched debit and credit totals", () => {
  assert.equal(
    isBalancedJournal([
      { debit: 100, credit: 0 },
      { debit: 0, credit: 90 },
    ]),
    false,
  );
});
