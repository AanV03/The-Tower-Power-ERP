import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const REQUIRED_VARIABLES = ["DATABASE_URL", "MONGODB_URI"];

const validators = {
  DATABASE_URL(value) {
    return /^postgres(?:ql)?:\/\//.test(value);
  },
  MONGODB_URI(value) {
    return /^mongodb(?:\+srv)?:\/\//.test(value);
  },
};

export function checkDatabaseEnv(env = process.env) {
  const missing = REQUIRED_VARIABLES.filter((key) => !env[key]);
  const invalid = REQUIRED_VARIABLES.filter((key) => {
    const value = env[key];
    return Boolean(value) && !validators[key](value);
  });

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

export function parseEnvText(text) {
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadDocumentedEnv() {
  const env = {};

  for (const name of [".env.example", ".env", ".env.local"]) {
    const path = resolve(process.cwd(), name);

    if (existsSync(path)) {
      Object.assign(env, parseEnvText(readFileSync(path, "utf8")));
    }
  }

  return {
    ...env,
    ...process.env,
  };
}

function runCli() {
  const result = checkDatabaseEnv(loadDocumentedEnv());

  if (result.ok) {
    console.log("Database environment variables are present and have valid URL shapes.");
    return;
  }

  if (result.missing.length > 0) {
    console.error(`Missing variables: ${result.missing.join(", ")}`);
  }

  if (result.invalid.length > 0) {
    console.error(`Invalid URL formats: ${result.invalid.join(", ")}`);
  }

  process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli();
}
