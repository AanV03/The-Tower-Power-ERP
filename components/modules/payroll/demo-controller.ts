import type {
  PayrollReadinessInput,
  PayrollReceiptFilters,
  PayrollReceiptView,
} from "./types";

export function filterPayrollReceipts(receipts: PayrollReceiptView[], filters: PayrollReceiptFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return receipts.filter((receipt) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [receipt.employeeName, receipt.employeeEmail, receipt.position, receipt.branch]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesBranch = filters.branch.length === 0 || receipt.branch === filters.branch;
    const matchesStatus = filters.status === "all" || receipt.status === filters.status;

    return matchesQuery && matchesBranch && matchesStatus;
  });
}

export function getPayrollReadiness(input: PayrollReadinessInput) {
  const incidentCount = input.missingReceipts + input.openAttendances;
  const canApprove = input.receiptCount > 0 && incidentCount === 0;

  return {
    canApprove,
    incidentCount,
    severity: incidentCount > 0 ? "danger" : input.receiptCount > 0 ? "success" : "warning",
  } as const;
}

export function createPayrollExportRows(receipts: PayrollReceiptView[]) {
  return [
    ["Empleado", "Sucursal", "Estado", "Base", "Horas extra", "Comision", "Deducciones", "Neto"],
    ...receipts.map((receipt) => [
      receipt.employeeName,
      receipt.branch,
      receipt.status,
      receipt.baseLabel,
      receipt.overtimeLabel,
      receipt.commissionLabel,
      receipt.deductionsLabel,
      receipt.netLabel,
    ]),
  ];
}
