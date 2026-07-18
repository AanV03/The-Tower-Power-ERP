export type PayrollUiStatus = "idle" | "loading" | "empty" | "error" | "success";
export type PayrollStatusLabel = "DRAFT" | "APPROVED" | "PAID";

export type PayrollPeriodView = {
  id: string;
  label: string;
  range: string;
  startDateValue: string;
  endDateValue: string;
  status: PayrollStatusLabel;
  employeeCount: number;
  netTotal: number;
  netTotalLabel: string;
};

export type PayrollReceiptView = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  sourceLabel?: string;
  position: string;
  branch: string;
  periodLabel: string;
  periodRange: string;
  status: PayrollStatusLabel;
  base: number;
  overtime: number;
  commission: number;
  deductions: number;
  net: number;
  baseLabel: string;
  overtimeLabel: string;
  commissionLabel: string;
  deductionsLabel: string;
  netLabel: string;
};

export type PayrollSummaryView = {
  activePeriodLabel: string;
  totalBaseLabel: string;
  totalOvertimeLabel: string;
  totalCommissionsLabel: string;
  totalDeductionsLabel: string;
  totalNetLabel: string;
  missingReceipts: number;
  openAttendances: number;
  draftPeriods: number;
};

export type PayrollReceiptFilters = {
  query: string;
  branch: string;
  status: PayrollStatusLabel | "all";
};

export type PayrollReadinessInput = {
  receiptCount: number;
  missingReceipts: number;
  openAttendances: number;
  draftPeriods: number;
};

export type PayrollReadiness = {
  canApprove: boolean;
  incidentCount: number;
  severity: "success" | "warning" | "danger";
};

export type PayrollLabels = {
  title: string;
  subtitle: string;
  tabs: {
    receipts: string;
    close: string;
  };
  actions: {
    createPeriod: string;
    preview: string;
    export: string;
    approve: string;
    pay: string;
    viewReceipt: string;
  };
  filters: {
    searchPlaceholder: string;
    status: string;
    branch: string;
    allStatuses: string;
    allBranches: string;
  };
  metrics: {
    draftPeriods: string;
    includedEmployees: string;
    pendingNet: string;
    commissions: string;
    deductions: string;
    incidents: string;
  };
  periods: {
    title: string;
    description: string;
    employees: string;
    net: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  receipts: {
    title: string;
    description: string;
    employee: string;
    positionBranch: string;
    base: string;
    overtime: string;
    commission: string;
    deductions: string;
    net: string;
    status: string;
    action: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  summary: {
    title: string;
    base: string;
    overtime: string;
    commissions: string;
    deductions: string;
    netTotal: string;
    alerts: string;
    ready: string;
    review: string;
    missingReceipts: string;
    openAttendances: string;
    draftPeriods: string;
  };
  status: Record<PayrollStatusLabel, string>;
};
