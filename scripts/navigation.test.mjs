import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { navigationGroups } from "../data/navigation.ts";

const rootDir = process.cwd();

test("groups ERP modules in the sidebar without removing top-level routes", () => {
  assert.deepEqual(
    navigationGroups.map((group) => group.id),
    ["operations", "logistics", "finance", "people", "growth", "platform"],
  );

  assert.deepEqual(
    navigationGroups.find((group) => group.id === "logistics").items.map((item) => item.id),
    ["catalog", "purchases", "warehouse", "inventory"],
  );

  assert.deepEqual(
    navigationGroups.find((group) => group.id === "platform").items.map((item) => item.id),
    ["admin", "integrations", "maintenance"],
  );
});

test("payroll route uses the dedicated payroll dashboard", () => {
  const page = readFileSync(
    join(rootDir, "app/[locale]/(dashboard)/payroll/page.tsx"),
    "utf8",
  );

  assert.match(page, /PayrollDashboard/);
  assert.doesNotMatch(page, /ModulePage/);
});

test("payroll operational components exist", () => {
  const components = [
    ["payroll-dashboard.tsx", "PayrollDashboard"],
    ["payroll-periods-panel.tsx", "PayrollPeriodsPanel"],
    ["payroll-items-table.tsx", "PayrollItemsTable"],
    ["payroll-summary-panel.tsx", "PayrollSummaryPanel"],
    ["payroll-receipt-dialog.tsx", "PayrollReceiptDialog"],
    ["payroll-action-bar.tsx", "PayrollActionBar"],
  ];

  for (const [fileName, exportName] of components) {
    const filePath = join(rootDir, "components/modules/payroll", fileName);
    assert.equal(existsSync(filePath), true, `${fileName} should exist`);
    assert.match(readFileSync(filePath, "utf8"), new RegExp(exportName));
  }
});
