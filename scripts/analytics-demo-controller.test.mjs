import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createAnalyticsSparkline,
  createExportPayload,
  filterAnalyticsRows,
  updateExportDraft,
} from "../app/[locale]/(dashboard)/analytics/components/demo-controller.ts";

const rows = [
  {
    id: "row-1",
    name: "Retencion Centro",
    branch: "Centro",
    status: "active",
    amount: "87%",
    owner: "BI",
  },
  {
    id: "row-2",
    name: "Churn Norte",
    branch: "Norte",
    status: "critical",
    amount: "8.4%",
    owner: "CRM",
  },
  {
    id: "row-3",
    name: "Ingreso Campus",
    branch: "Campus",
    status: "warning",
    amount: "$204k",
    owner: "Finance",
  },
];

test("filters analytics rows by query, branch and status without mutating source", () => {
  const result = filterAnalyticsRows(rows, {
    query: "churn",
    branch: "Norte",
    status: "critical",
  });

  assert.deepEqual(result.map((row) => row.id), ["row-2"]);
  assert.equal(rows.length, 3);
});

test("createAnalyticsSparkline adapts point count to selected range", () => {
  assert.equal(createAnalyticsSparkline("retention", "87%", "today").length, 6);
  assert.equal(createAnalyticsSparkline("retention", "87%", "7d").length, 7);
  assert.equal(createAnalyticsSparkline("retention", "87%", "90d").length, 5);
  assert.equal(createAnalyticsSparkline("retention", "87%", "30d").length, 4);
});

test("updateExportDraft disables chart inclusion for csv exports", () => {
  const draft = updateExportDraft(
    { format: "pdf", includeCharts: true, includeMetadata: true },
    "format",
    "csv",
  );

  assert.deepEqual(draft, {
    format: "csv",
    includeCharts: false,
    includeMetadata: true,
  });
});

test("createExportPayload returns stable export metadata", () => {
  const payload = createExportPayload(
    { format: "pdf", includeCharts: true, includeMetadata: false },
    { range: "30d", branch: "" },
  );

  assert.deepEqual(payload, {
    format: "pdf",
    includeCharts: true,
    includeMetadata: false,
    range: "30d",
    branch: "consolidated",
  });
});
