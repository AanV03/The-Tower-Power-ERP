import { test } from "node:test";
import assert from "node:assert/strict";

import { navigationGroups } from "../data/navigation.ts";

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
