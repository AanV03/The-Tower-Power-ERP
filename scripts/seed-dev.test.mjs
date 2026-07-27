import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildSeedConfig,
  assertCanRunDevSeed,
  DEFAULT_SUPERADMIN_EMAIL,
  DEFAULT_SUPERADMIN_PASSWORD,
} from "./seed-dev.mjs";

test("builds a deterministic development seed config", () => {
  const config = buildSeedConfig({
    SEED_SUPERADMIN_PASSWORD: "CustomSeed!123",
  });

  assert.equal(config.superadmin.email, DEFAULT_SUPERADMIN_EMAIL);
  assert.equal(config.superadmin.password, "CustomSeed!123");
  assert.equal(config.tenant.name, "The Tower Power Demo Gym");
  assert.equal(config.tenants.length, 2);
  assert.notEqual(config.tenants[0].tenant.name, config.tenants[1].tenant.name);
  assert.equal(config.admin.name, "Admin");
  assert.equal(config.employee.name, "Empleado");
  assert.equal(config.modules.includes("MAINTENANCE"), true);
  assert.equal(config.permissions.includes("maintenance.manage"), true);
  assert.equal(config.permissions.includes("payroll.pay"), true);
});

test("uses an explicit demo password outside production when no seed password is configured", () => {
  const config = buildSeedConfig({});

  assert.equal(config.superadmin.password, DEFAULT_SUPERADMIN_PASSWORD);
});

test("refuses to run the dev seed in production", () => {
  assert.throws(
    () => assertCanRunDevSeed({ NODE_ENV: "production" }),
    /SEED_REFUSED_PRODUCTION/,
  );
});
