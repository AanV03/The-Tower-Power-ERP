import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

import { navigationGroups, navigationItems } from "../data/navigation.ts";

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

test("people and finance module labels describe separate responsibilities", () => {
  const hr = navigationItems.find((item) => item.id === "hr");
  const payroll = navigationItems.find((item) => item.id === "payroll");
  const accounting = navigationItems.find((item) => item.id === "accounting");

  assert.equal(hr.labels.es, "Recursos Humanos");
  assert.equal(hr.description.es, "Expedientes, contratos y asistencia del personal.");
  assert.equal(payroll.labels.es, "Nomina");
  assert.equal(payroll.description.es, "Periodos, recibos, deducciones, comisiones y pagos.");
  assert.equal(accounting.labels.es, "Contabilidad");
  assert.equal(accounting.description.es, "Catalogo de cuentas, polizas y partida doble.");
});

test("payroll operational components exist", () => {
  const components = [
    ["payroll-dashboard.tsx", "PayrollDashboard"],
    ["payroll-periods-panel.tsx", "PayrollPeriodsPanel"],
    ["payroll-items-table.tsx", "PayrollItemsTable"],
    ["payroll-summary-panel.tsx", "PayrollPeriodDetailPanel"],
    ["payroll-receipt-dialog.tsx", "PayrollReceiptDialog"],
    ["payroll-action-bar.tsx", "PayrollActionBar"],
  ];

  for (const [fileName, exportName] of components) {
    const filePath = join(rootDir, "components/modules/payroll", fileName);
    assert.equal(existsSync(filePath), true, `${fileName} should exist`);
    assert.match(readFileSync(filePath, "utf8"), new RegExp(exportName));
  }
});

test("payroll and accounting dashboards expose distinct workflow surfaces", () => {
  const payrollDashboard = readFileSync(
    join(rootDir, "components/modules/payroll/payroll-dashboard.tsx"),
    "utf8",
  );
  const accountingDashboard = readFileSync(
    join(rootDir, "app/[locale]/(dashboard)/accounting/components/AccountingDashboard.tsx"),
    "utf8",
  );

  assert.doesNotMatch(payrollDashboard, /payroll-workflow-rail/);
  assert.doesNotMatch(payrollDashboard, /PayrollWorkflowRail/);
  assert.doesNotMatch(payrollDashboard, /Cierre de periodo/);
  assert.match(payrollDashboard, /payroll-tabs/);
  assert.match(payrollDashboard, /value="periods"/);
  assert.match(payrollDashboard, /value="employees"/);
  assert.doesNotMatch(payrollDashboard, /value="summary"/);
  const payrollConfig = readFileSync(
    join(rootDir, "components/modules/payroll/config.ts"),
    "utf8",
  );
  assert.match(payrollConfig, /Historial de periodos/);
  assert.match(payrollConfig, /Nomina por empleado/);
  assert.doesNotMatch(payrollDashboard, /Periodos\s*<\/TabsTrigger>/);
  assert.doesNotMatch(payrollDashboard, /Detalle\s*<\/TabsTrigger>/);
  assert.doesNotMatch(payrollDashboard, /Periodo seleccionado/);
  assert.match(payrollDashboard, /Periodo activo/);
  assert.doesNotMatch(payrollDashboard, /Detalle por empleado/);
  assert.match(payrollDashboard, /PayrollPeriodDetailPanel/);
  assert.match(payrollDashboard, /xl:grid-cols-\[minmax\(0,1fr\)_360px\]/);
  assert.doesNotMatch(payrollDashboard, /PayrollCloseReadinessPanel/);
  assert.doesNotMatch(payrollDashboard, /PayrollSummaryPanel/);
  assert.doesNotMatch(payrollDashboard, /items-stretch/);
  assert.doesNotMatch(payrollDashboard, /MetricCard/);
  assert.doesNotMatch(payrollDashboard, /xl:min-h-\[470px\]/);
  assert.match(payrollDashboard, /overflow-visible/);
  assert.match(payrollDashboard, /after:hidden/);
  const payrollActionBar = readFileSync(
    join(rootDir, "components/modules/payroll/payroll-action-bar.tsx"),
    "utf8",
  );
  assert.doesNotMatch(payrollActionBar, /NativeSelect/);
  assert.doesNotMatch(payrollActionBar, /selectedPeriodId/);
  assert.match(payrollActionBar, /DialogContent/);
  assert.match(payrollActionBar, /Crear periodo/);
  assert.doesNotMatch(payrollActionBar, /<div className="grid w-full gap-2 sm:grid-cols-2">/);
  const payrollItemsTable = readFileSync(
    join(rootDir, "components/modules/payroll/payroll-items-table.tsx"),
    "utf8",
  );
  assert.match(payrollItemsTable, /periods/);
  assert.match(payrollItemsTable, /payrollPeriodId/);
  const payrollPeriodsPanel = readFileSync(
    join(rootDir, "components/modules/payroll/payroll-periods-panel.tsx"),
    "utf8",
  );
  assert.match(payrollPeriodsPanel, /payrollPeriodId/);
  assert.doesNotMatch(accountingDashboard, /Mesa contable/);
  assert.match(accountingDashboard, /accounting-tabs/);
  assert.match(accountingDashboard, /activeTab/);
  assert.match(accountingDashboard, /overflow-visible/);
  assert.match(accountingDashboard, /after:hidden/);
  assert.match(accountingDashboard, /Registrar cuenta/);
  assert.match(accountingDashboard, /Registrar poliza/);
  assert.match(accountingDashboard, /toast\./);
  assert.doesNotMatch(accountingDashboard, /state\.message \? \(/);
  assert.match(accountingDashboard, /value="accounts"/);
  assert.match(accountingDashboard, /value="journal"/);

  const accountsPanel = readFileSync(
    join(rootDir, "app/[locale]/(dashboard)/accounting/components/AccountsPanel.tsx"),
    "utf8",
  );

  assert.doesNotMatch(accountsPanel, /Registrar cuenta/);
});
