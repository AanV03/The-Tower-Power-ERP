import { AccountingDemoController } from "./components/AccountingDemoController";
import {
  accountingLabels,
  accountTypeLabels,
  journalEntryStatusConfig,
  journalEntryTypeOptions,
  normalBalanceLabels,
} from "./components/config";
import { mockAccountingData, mockAccountingState } from "./components/mock-data";
import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import type {
  AccountType,
  AccountingDashboardData,
  JournalEntryStatus,
  JournalEntryType,
  NormalBalance,
} from "./components/types";

function accountType(type: string): AccountType {
  return type.toLowerCase() as AccountType;
}

function normalBalance(type: string): NormalBalance {
  return ["ASSET", "EXPENSE"].includes(type) ? "debit" : "credit";
}

function entryStatus(status: string): JournalEntryStatus {
  if (status === "POSTED") return "posted";
  if (status === "VOID") return "void";
  return "draft";
}

function entryType(sourceType: string): JournalEntryType {
  if (sourceType.toUpperCase().includes("PAYROLL")) return "expense";
  if (sourceType.toUpperCase().includes("PAYMENT")) return "income";
  return "daily";
}

function money(value: number | string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value));
}

async function loadAccountingData(locale: Locale): Promise<AccountingDashboardData | null> {
  const context = await requireApiContext({ moduleId: "accounting", permission: "accounting.read" });
  const [accounts, entries, draftEntries, postedEntries, lines] = await Promise.all([
    prisma.chartAccount.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { code: "asc" },
      take: 50,
    }),
    prisma.journalEntry.findMany({
      where: { tenantId: context.tenantId },
      include: { lines: { include: { account: true } } },
      orderBy: { entryDate: "desc" },
      take: 12,
    }),
    prisma.journalEntry.count({ where: { tenantId: context.tenantId, status: "DRAFT" } }),
    prisma.journalEntry.count({ where: { tenantId: context.tenantId, status: "POSTED" } }),
    prisma.journalEntryLine.count({ where: { tenantId: context.tenantId } }),
  ]);

  if (accounts.length === 0) return null;

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const firstAccount = accounts[0];
  const secondAccount = accounts[1] ?? accounts[0];

  return {
    title: "Contabilidad",
    subtitle: "Catalogo de cuentas, polizas y partida doble con trazabilidad por fuente.",
    periodLabel: "Periodo: Actual",
    branchLabel: context.branchId ? "Sucursal: Activa" : "Sucursal: Consolidado",
    metrics: [
      { id: "accounts", label: "Cuentas", value: String(accounts.length), helper: "Catalogo", tone: "default" },
      { id: "drafts", label: "Polizas borrador", value: String(draftEntries), helper: "Revisar", tone: draftEntries > 0 ? "warning" : "success" },
      { id: "posted", label: "Polizas registradas", value: String(postedEntries), helper: "Libro mayor", tone: "success" },
      { id: "lines", label: "Partidas", value: String(lines), helper: "Debe / haber", tone: "default" },
    ],
    accounts: accounts.map((account) => ({
      id: account.id,
      code: account.code,
      name: account.name,
      type: accountType(account.type),
      normalBalance: normalBalance(account.type),
      status: "active",
      branchScope: "Tenant",
    })),
    recentEntries: entries.map((entry, index) => {
      const amount = entry.lines.reduce((sum, line) => sum + Number(line.debit.toString()), 0);
      return {
        id: entry.id,
        entryNumber: `POL-${String(index + 1).padStart(5, "0")}`,
        dateLabel: formatter.format(entry.entryDate),
        concept: entry.description ?? entry.sourceType,
        type: entryType(entry.sourceType),
        amount: money(amount),
        status: entryStatus(entry.status),
      };
    }),
    draftEntry: {
      id: "draft-api",
      entryNumber: "POL-BORRADOR",
      date: new Date().toISOString().slice(0, 10),
      type: "daily",
      concept: "",
      reference: "",
      currency: "MXN",
      status: "draft",
      lines: [
        {
          id: "line-1",
          accountId: firstAccount.id,
          accountCode: firstAccount.code,
          accountName: firstAccount.name,
          description: "",
          debit: 0,
          credit: 0,
        },
        {
          id: "line-2",
          accountId: secondAccount.id,
          accountCode: secondAccount.code,
          accountName: secondAccount.name,
          description: "",
          debit: 0,
          credit: 0,
        },
      ],
      totals: { debit: 0, credit: 0, difference: 0, isBalanced: true },
    },
  };
}

export default async function AccountingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  const accountingData = await loadAccountingData(resolvedLocale);

  return (
    <AccountingDemoController
      locale={resolvedLocale}
      data={accountingData ?? mockAccountingData}
      state={accountingData ? { page: "idle", accounts: "idle", entries: "idle", editor: "idle" } : mockAccountingState}
      labels={accountingLabels}
      accountTypeLabels={accountTypeLabels}
      normalBalanceLabels={normalBalanceLabels}
      journalEntryTypeOptions={journalEntryTypeOptions}
      journalEntryStatusConfig={journalEntryStatusConfig}
    />
  );
}
