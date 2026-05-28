import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

import { checkDatabaseEnv, parseEnvText } from "./check-env.mjs";

test("reports missing database environment variables without connecting", () => {
  const result = checkDatabaseEnv({});

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ["DATABASE_URL", "MONGODB_URI"]);
  assert.deepEqual(result.invalid, []);
});

test("accepts PostgreSQL and MongoDB connection string shapes", () => {
  const result = checkDatabaseEnv({
    DATABASE_URL: "postgresql://user:pass@localhost:5432/gerpy",
    MONGODB_URI: "mongodb://localhost:27017/gerpy",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.invalid, []);
});

test("reports invalid database environment variable formats", () => {
  const result = checkDatabaseEnv({
    DATABASE_URL: "mysql://user:pass@localhost:3306/gerpy",
    MONGODB_URI: "https://example.com",
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.invalid, ["DATABASE_URL", "MONGODB_URI"]);
});

test("parses quoted env file values without exposing credentials", () => {
  const env = parseEnvText(`
DATABASE_URL="postgresql://user:pass@localhost:5432/gerpy"
MONGODB_URI='mongodb://localhost:27017/gerpy'
DIRECT_URL=""
`);

  assert.equal(env.DATABASE_URL, "postgresql://user:pass@localhost:5432/gerpy");
  assert.equal(env.MONGODB_URI, "mongodb://localhost:27017/gerpy");
  assert.equal(env.DIRECT_URL, "");
});

test("CLI reports documented env variables without connecting", () => {
  const output = execFileSync(process.execPath, ["scripts/check-env.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  assert.match(output, /Database environment variables are present/);
});
