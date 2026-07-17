import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createPayrollExportRows,
  filterPayrollReceipts,
  getPayrollReadiness,
  validPayrollTransition,
} from "../components/modules/payroll/demo-controller.ts";

const receipts = [
  {
    id: "receipt-1",
    employeeName: "Ana Lopez",
    employeeEmail: "ana@example.com",
    position: "Coach",
    branch: "Centro",
    periodLabel: "Julio 2026",
    periodRange: "01 jul - 15 jul",
    status: "DRAFT",
    base: 10000,
    overtime: 500,
    commission: 1200,
    deductions: 300,
    net: 11400,
    baseLabel: "$10,000.00",
    overtimeLabel: "$500.00",
    commissionLabel: "$1,200.00",
    deductionsLabel: "$300.00",
    netLabel: "$11,400.00",
  },
  {
    id: "receipt-2",
    employeeName: "Luis Perez",
    employeeEmail: "luis@example.com",
    position: "Recepcion",
    branch: "Norte",
    periodLabel: "Julio 2026",
    periodRange: "01 jul - 15 jul",
    status: "PAID",
    base: 8000,
    overtime: 0,
    commission: 0,
    deductions: 200,
    net: 7800,
    baseLabel: "$8,000.00",
    overtimeLabel: "$0.00",
    commissionLabel: "$0.00",
    deductionsLabel: "$200.00",
    netLabel: "$7,800.00",
  },
];

test("filters payroll receipts by query, branch and status without mutating source", () => {
  const result = filterPayrollReceipts(receipts, {
    query: "ana",
    branch: "Centro",
    status: "DRAFT",
  });

  assert.deepEqual(result.map((receipt) => receipt.id), ["receipt-1"]);
  assert.equal(receipts.length, 2);
});

test("getPayrollReadiness blocks close when incidents or missing receipts exist", () => {
  const readiness = getPayrollReadiness({
    receiptCount: 8,
    missingReceipts: 1,
    openAttendances: 2,
    draftPeriods: 1,
  });

  assert.equal(readiness.canApprove, false);
  assert.equal(readiness.incidentCount, 3);
  assert.equal(readiness.severity, "danger");
});

test("getPayrollReadiness allows close when period has receipts and no incidents", () => {
  const readiness = getPayrollReadiness({
    receiptCount: 8,
    missingReceipts: 0,
    openAttendances: 0,
    draftPeriods: 1,
  });

  assert.equal(readiness.canApprove, true);
  assert.equal(readiness.incidentCount, 0);
  assert.equal(readiness.severity, "success");
});

test("createPayrollExportRows produces stable csv-ready rows", () => {
  const rows = createPayrollExportRows(receipts);

  assert.deepEqual(rows[0], [
    "Empleado",
    "Sucursal",
    "Estado",
    "Base",
    "Horas extra",
    "Comision",
    "Deducciones",
    "Neto",
  ]);
  assert.equal(rows[1][0], "Ana Lopez");
  assert.equal(rows[2][7], "$7,800.00");
});

test("validPayrollTransition enforces period workflow order", () => {
  assert.deepEqual(validPayrollTransition("DRAFT", "APPROVED"), { ok: true });
  assert.deepEqual(validPayrollTransition("APPROVED", "PAID"), { ok: true });
  assert.deepEqual(validPayrollTransition("DRAFT", "PAID"), {
    ok: false,
    code: "PAYROLL_PERIOD_NOT_APPROVED",
  });
  assert.deepEqual(validPayrollTransition("PAID", "DRAFT"), {
    ok: false,
    code: "PAYROLL_PERIOD_LOCKED",
  });
});
