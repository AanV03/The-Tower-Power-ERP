import type {
  AnalyticsActivityRow,
  AnalyticsFilters,
  AnalyticsRange,
  ExportReportDraft,
} from "./types";

export function createAnalyticsSparkline(key: string, currentValue: string, range: AnalyticsRange) {
  const value = Number.parseFloat(currentValue.replace(/[^0-9.]/g, "")) || 50;
  const steps = range === "today" ? 6 : range === "7d" ? 7 : range === "90d" ? 5 : 4;

  return Array.from({ length: steps }).map((_, index) => {
    const direction = key.toLowerCase().includes("churn") ? 1.2 : -0.8;
    const diff = (steps - 1 - index) * direction;

    return { value: Math.max(0, Math.round(value + diff)) };
  });
}

export function filterAnalyticsRows(rows: AnalyticsActivityRow[], filters: AnalyticsFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [row.name, row.branch, row.owner, row.amount].join(" ").toLowerCase().includes(normalizedQuery);
    const matchesBranch = filters.branch.length === 0 || row.branch === filters.branch;
    const matchesStatus = filters.status === "all" || row.status === filters.status;

    return matchesQuery && matchesBranch && matchesStatus;
  });
}

export function updateExportDraft<TField extends keyof ExportReportDraft>(
  draft: ExportReportDraft,
  field: TField,
  value: ExportReportDraft[TField],
) {
  const nextDraft = { ...draft, [field]: value };

  if (field === "format" && value === "csv") {
    return { ...nextDraft, includeCharts: false };
  }

  return nextDraft;
}

export function createExportPayload(
  draft: ExportReportDraft,
  context: { range: AnalyticsRange; branch: string },
) {
  return {
    ...draft,
    range: context.range,
    branch: context.branch || "consolidated",
  };
}
