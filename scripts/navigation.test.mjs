import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { navigationGroups } from "../data/navigation.ts";

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

test("people modules use specialized operational dashboards instead of the generic module page", () => {
  const hrPage = readFileSync(resolve("app/[locale]/(dashboard)/hr/page.tsx"), "utf8");
  const payrollPage = readFileSync(resolve("app/[locale]/(dashboard)/payroll/page.tsx"), "utf8");

  assert.match(hrPage, /HrDashboard/);
  assert.doesNotMatch(hrPage, /ModulePage/);
  assert.match(payrollPage, /PayrollDashboard/);
  assert.doesNotMatch(payrollPage, /ModulePage/);
});

test("hr employee table exposes dialog forms and row action options", () => {
  const dialog = readFileSync(resolve("components/ui/dialog.tsx"), "utf8");
  const select = readFileSync(resolve("components/ui/select.tsx"), "utf8");
  const standardDialog = readFileSync(resolve("components/shared/standard-dialog.tsx"), "utf8");
  const standardSelect = readFileSync(resolve("components/shared/standard-select.tsx"), "utf8");
  const formDialog = readFileSync(resolve("components/modules/hr/employee-form-dialog.tsx"), "utf8");
  const employeeTable = readFileSync(resolve("components/modules/hr/employee-table.tsx"), "utf8");

  assert.match(dialog, /DialogContent/);
  assert.match(dialog, /@base-ui\/react\/dialog/);
  assert.match(select, /SelectTrigger/);
  assert.match(select, /@base-ui\/react\/select/);
  assert.match(standardDialog, /StandardDialogContent/);
  assert.match(standardSelect, /StandardSelectTrigger/);
  assert.match(formDialog, /EmployeeFormDialog/);
  assert.match(formDialog, /Input/);
  assert.match(formDialog, /Select/);
  assert.doesNotMatch(employeeTable, /DropdownMenu/);
  assert.match(employeeTable, /handleEmployeeAction/);
  assert.match(employeeTable, /Editar/);
});
