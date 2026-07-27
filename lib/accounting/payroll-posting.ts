import { AccountType, JournalEntryStatus, PayrollStatus, Prisma } from "@prisma/client";

const PAYROLL_SOURCE_TYPE = "PAYROLL";
const DEFAULT_EXPENSE_ACCOUNT_CODE = "5100";
const DEFAULT_PAYMENT_ACCOUNT_CODE = "1000";

type DecimalInput = Prisma.Decimal | number | string;

export type JournalLineInput = {
  accountId?: string;
  debit: DecimalInput;
  credit: DecimalInput;
};

export type PayrollPostingInput = {
  tenantId: string;
  payrollPeriodId: string;
  expenseAccountId?: string;
  paymentAccountId?: string;
};

class PayrollPostingError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    message: string,
    status: number,
    code: string,
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const journalInclude = Prisma.validator<Prisma.JournalEntryInclude>()({
  lines: { include: { account: true } },
});

function decimal(value: DecimalInput): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(2);
}

export function isBalancedJournal(lines: JournalLineInput[]) {
  if (lines.length < 2) return false;

  try {
    const totals = lines.reduce<{ debit: Prisma.Decimal; credit: Prisma.Decimal }>(
      (sum, line) => {
        const debit = decimal(line.debit);
        const credit = decimal(line.credit);

        if (!debit.isFinite() || !credit.isFinite() || debit.isNegative() || credit.isNegative()) {
          throw new Error("INVALID_JOURNAL_AMOUNT");
        }

        return {
          debit: sum.debit.plus(debit),
          credit: sum.credit.plus(credit),
        };
      },
      { debit: decimal(0), credit: decimal(0) },
    );

    return totals.debit.greaterThan(0) && totals.debit.equals(totals.credit);
  } catch {
    return false;
  }
}

async function resolvePostingAccounts(
  tx: Prisma.TransactionClient,
  input: PayrollPostingInput,
) {
  const expenseWhere = input.expenseAccountId
    ? { id: input.expenseAccountId }
    : { code: DEFAULT_EXPENSE_ACCOUNT_CODE };
  const paymentWhere = input.paymentAccountId
    ? { id: input.paymentAccountId }
    : { code: DEFAULT_PAYMENT_ACCOUNT_CODE };

  const [expenseAccount, paymentAccount] = await Promise.all([
    tx.chartAccount.findFirst({ where: { tenantId: input.tenantId, ...expenseWhere } }),
    tx.chartAccount.findFirst({ where: { tenantId: input.tenantId, ...paymentWhere } }),
  ]);

  if (!expenseAccount || !paymentAccount) {
    throw new PayrollPostingError(
      "Payroll expense and payment accounts must be configured in this tenant.",
      409,
      "PAYROLL_ACCOUNTS_REQUIRED",
    );
  }

  if (
    expenseAccount.tenantId !== input.tenantId ||
    paymentAccount.tenantId !== input.tenantId ||
    expenseAccount.id === paymentAccount.id ||
    expenseAccount.type !== AccountType.EXPENSE ||
    paymentAccount.type !== AccountType.ASSET
  ) {
    throw new PayrollPostingError(
      "Payroll accounts do not belong to the tenant or have invalid accounting types.",
      400,
      "PAYROLL_ACCOUNT_TENANT_MISMATCH",
    );
  }

  return { expenseAccount, paymentAccount };
}

function assertExistingEntryIntegrity(
  entry: Prisma.JournalEntryGetPayload<{ include: typeof journalInclude }>,
  tenantId: string,
) {
  const crossesTenant = entry.lines.some(
    (line) => line.tenantId !== tenantId || line.account.tenantId !== tenantId,
  );

  if (
    entry.tenantId !== tenantId ||
    entry.status !== JournalEntryStatus.POSTED ||
    crossesTenant ||
    !isBalancedJournal(entry.lines)
  ) {
    throw new PayrollPostingError(
      "The existing payroll journal entry failed tenant or balance validation.",
      409,
      "PAYROLL_JOURNAL_INVALID",
    );
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function postPayrollToAccounting(input: PayrollPostingInput) {
  const tenantId = input.tenantId.trim();
  const payrollPeriodId = input.payrollPeriodId.trim();

  if (!tenantId || !payrollPeriodId) {
    throw new PayrollPostingError(
      "Tenant and payroll period are required.",
      400,
      "PAYROLL_POSTING_INPUT_REQUIRED",
    );
  }

  const normalizedInput = { ...input, tenantId, payrollPeriodId };
  const { prisma, setTenantTransactionContext } = await import("../db/prisma");

  const execute = () =>
    prisma.$transaction(async (tx) => {
      await setTenantTransactionContext(tx, tenantId);
      const period = await tx.payrollPeriod.findFirst({
        where: { id: payrollPeriodId, tenantId },
        include: { items: true },
      });

      if (!period) {
        throw new PayrollPostingError(
          "Payroll period was not found in this tenant.",
          404,
          "PAYROLL_PERIOD_NOT_FOUND",
        );
      }

      if (period.tenantId !== tenantId || period.items.some((item) => item.tenantId !== tenantId)) {
        throw new PayrollPostingError(
          "Payroll data does not belong to the active tenant.",
          400,
          "PAYROLL_ITEM_TENANT_MISMATCH",
        );
      }

      const existingEntry = await tx.journalEntry.findUnique({
        where: {
          tenantId_sourceType_sourceId: {
            tenantId,
            sourceType: PAYROLL_SOURCE_TYPE,
            sourceId: payrollPeriodId,
          },
        },
        include: journalInclude,
      });

      if (existingEntry) {
        if (period.status !== PayrollStatus.APPROVED && period.status !== PayrollStatus.PAID) {
          throw new PayrollPostingError(
            "Only approved payroll periods can be marked as paid.",
            409,
            "PAYROLL_PERIOD_NOT_APPROVED",
          );
        }

        assertExistingEntryIntegrity(existingEntry, tenantId);

        if (period.status === PayrollStatus.APPROVED) {
          await tx.payrollPeriod.update({
            where: { id: period.id },
            data: { status: PayrollStatus.PAID },
          });
        }

        return {
          payrollPeriod: { ...period, status: PayrollStatus.PAID },
          journalEntry: existingEntry,
          created: false,
        };
      }

      if (period.status !== PayrollStatus.APPROVED && period.status !== PayrollStatus.PAID) {
        throw new PayrollPostingError(
          "Only approved payroll periods can be marked as paid.",
          409,
          "PAYROLL_PERIOD_NOT_APPROVED",
        );
      }

      if (period.items.length === 0) {
        throw new PayrollPostingError(
          "Payroll cannot be posted without payroll items.",
          409,
          "PAYROLL_ITEMS_REQUIRED",
        );
      }

      const totalNet = period.items
        .reduce((total, item) => total.plus(item.netAmount), decimal(0))
        .toDecimalPlaces(2);
      const { expenseAccount, paymentAccount } = await resolvePostingAccounts(tx, normalizedInput);
      const lines = [
        { accountId: expenseAccount.id, debit: totalNet, credit: decimal(0) },
        { accountId: paymentAccount.id, debit: decimal(0), credit: totalNet },
      ];

      if (!isBalancedJournal(lines)) {
        throw new PayrollPostingError(
          "Payroll journal entry must balance before it can be saved.",
          400,
          "PAYROLL_JOURNAL_NOT_BALANCED",
        );
      }

      if (period.status === PayrollStatus.APPROVED) {
        const updated = await tx.payrollPeriod.updateMany({
          where: { id: period.id, tenantId, status: PayrollStatus.APPROVED },
          data: { status: PayrollStatus.PAID },
        });

        if (updated.count !== 1) {
          const concurrentEntry = await tx.journalEntry.findUnique({
            where: {
              tenantId_sourceType_sourceId: {
                tenantId,
                sourceType: PAYROLL_SOURCE_TYPE,
                sourceId: payrollPeriodId,
              },
            },
            include: journalInclude,
          });

          if (concurrentEntry) {
            assertExistingEntryIntegrity(concurrentEntry, tenantId);
            return {
              payrollPeriod: { ...period, status: PayrollStatus.PAID },
              journalEntry: concurrentEntry,
              created: false,
            };
          }

          throw new PayrollPostingError(
            "Payroll status changed while it was being posted.",
            409,
            "PAYROLL_POSTING_CONFLICT",
          );
        }
      }

      const journalEntry = await tx.journalEntry.create({
        data: {
          tenantId,
          sourceType: PAYROLL_SOURCE_TYPE,
          sourceId: payrollPeriodId,
          entryDate: new Date(),
          description: `Payroll ${period.startDate.toISOString()} - ${period.endDate.toISOString()}`,
          status: JournalEntryStatus.POSTED,
          lines: {
            create: lines.map((line) => ({
              tenantId,
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
            })),
          },
        },
        include: journalInclude,
      });

      return {
        payrollPeriod: { ...period, status: PayrollStatus.PAID },
        journalEntry,
        created: true,
      };
    }, {
      maxWait: 10_000,
      timeout: 30_000,
    });

  try {
    return await execute();
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    return execute();
  }
}
