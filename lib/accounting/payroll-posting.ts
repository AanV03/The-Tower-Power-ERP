export type JournalLineInput = {
  accountId?: string;
  debit: number;
  credit: number;
};

export function isBalancedJournal(lines: JournalLineInput[]) {
  const totals = lines.reduce(
    (acc, line) => ({
      debit: acc.debit + Number(line.debit || 0),
      credit: acc.credit + Number(line.credit || 0),
    }),
    { debit: 0, credit: 0 },
  );

  return Math.round((totals.debit - totals.credit) * 100) === 0;
}
