import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "../db/prisma" && context.parentURL?.endsWith("/lib/accounting/payroll-posting.ts")) {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export const prisma = { $transaction: (...args) => globalThis.__phase8PrismaTransaction(...args) }; export const setTenantTransactionContext = (...args) => globalThis.__phase8SetTenantContext(...args)",
      };
    }

    return nextResolve(specifier, context);
  },
});

const {
  isBalancedJournal,
  postPayrollToAccounting,
} = await import("../lib/accounting/payroll-posting.ts");

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

test("isBalancedJournal rejects empty and zero-value journals", () => {
  assert.equal(isBalancedJournal([]), false);
  assert.equal(
    isBalancedJournal([
      { debit: 0, credit: 0 },
      { debit: 0, credit: 0 },
    ]),
    false,
  );
});

test("isBalancedJournal compares monetary decimals without floating-point drift", () => {
  assert.equal(
    isBalancedJournal([
      { debit: "0.30", credit: 0 },
      { debit: 0, credit: 0.1 + 0.2 },
    ]),
    true,
  );
});

test("posts payroll once and returns the same journal on retry", async () => {
  const period = {
    id: "period-1",
    tenantId: "tenant-1",
    startDate: new Date("2026-07-01T00:00:00.000Z"),
    endDate: new Date("2026-07-15T00:00:00.000Z"),
    status: "APPROVED",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "item-1",
        tenantId: "tenant-1",
        payrollPeriodId: "period-1",
        employeeId: "employee-1",
        baseAmount: "1000.00",
        overtimeAmount: "0.00",
        commissionAmount: "0.00",
        deductions: "100.00",
        netAmount: "900.00",
      },
    ],
  };
  const accounts = [
    { id: "expense-1", tenantId: "tenant-1", code: "5100", type: "EXPENSE" },
    { id: "bank-1", tenantId: "tenant-1", code: "1000", type: "ASSET" },
  ];
  let journalEntry;
  let createCount = 0;

  const tx = {
    payrollPeriod: {
      findFirst: async () => ({ ...period, items: [...period.items] }),
      update: async ({ data }) => Object.assign(period, data),
      updateMany: async ({ data }) => {
        if (period.status !== "APPROVED") return { count: 0 };
        Object.assign(period, data);
        return { count: 1 };
      },
    },
    chartAccount: {
      findFirst: async ({ where }) =>
        accounts.find(
          (account) =>
            account.tenantId === where.tenantId &&
            (account.id === where.id || account.code === where.code),
        ) ?? null,
    },
    journalEntry: {
      findUnique: async () => journalEntry ?? null,
      create: async ({ data }) => {
        createCount += 1;
        journalEntry = {
          id: "journal-1",
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          lines: data.lines.create.map((line, index) => ({
            id: `line-${index + 1}`,
            journalEntryId: "journal-1",
            ...line,
            account: accounts.find((account) => account.id === line.accountId),
          })),
        };
        return journalEntry;
      },
    },
  };

  globalThis.__phase8PrismaTransaction = async (operation) => operation(tx);
  globalThis.__phase8SetTenantContext = async (_tx, tenantId) => {
    assert.equal(tenantId, "tenant-1");
  };

  const first = await postPayrollToAccounting({
    tenantId: "tenant-1",
    payrollPeriodId: "period-1",
  });
  const retry = await postPayrollToAccounting({
    tenantId: "tenant-1",
    payrollPeriodId: "period-1",
  });

  assert.equal(first.created, true);
  assert.equal(retry.created, false);
  assert.equal(first.journalEntry.id, retry.journalEntry.id);
  assert.equal(first.payrollPeriod.status, "PAID");
  assert.equal(createCount, 1);
  assert.equal(isBalancedJournal(first.journalEntry.lines), true);
});

test("rejects payroll items from another tenant before posting", async () => {
  const tx = {
    payrollPeriod: {
      findFirst: async () => ({
        id: "period-cross-tenant",
        tenantId: "tenant-1",
        startDate: new Date(),
        endDate: new Date(),
        status: "APPROVED",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [{ tenantId: "tenant-2", netAmount: "100.00" }],
      }),
    },
  };

  globalThis.__phase8PrismaTransaction = async (operation) => operation(tx);
  globalThis.__phase8SetTenantContext = async () => {};

  await assert.rejects(
    postPayrollToAccounting({
      tenantId: "tenant-1",
      payrollPeriodId: "period-cross-tenant",
    }),
    (error) => error.code === "PAYROLL_ITEM_TENANT_MISMATCH",
  );
});

test("rejects accounting accounts outside the active tenant", async () => {
  const tx = {
    payrollPeriod: {
      findFirst: async () => ({
        id: "period-account-mismatch",
        tenantId: "tenant-1",
        startDate: new Date(),
        endDate: new Date(),
        status: "APPROVED",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [{ tenantId: "tenant-1", netAmount: "100.00" }],
      }),
    },
    journalEntry: {
      findUnique: async () => null,
    },
    chartAccount: {
      findFirst: async ({ where }) => ({
        id: where.code === "5100" ? "expense-other" : "bank-other",
        tenantId: "tenant-2",
        code: where.code,
        type: where.code === "5100" ? "EXPENSE" : "ASSET",
      }),
    },
  };

  globalThis.__phase8PrismaTransaction = async (operation) => operation(tx);
  globalThis.__phase8SetTenantContext = async () => {};

  await assert.rejects(
    postPayrollToAccounting({
      tenantId: "tenant-1",
      payrollPeriodId: "period-account-mismatch",
    }),
    (error) => error.code === "PAYROLL_ACCOUNT_TENANT_MISMATCH",
  );
});
