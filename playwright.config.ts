import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const serverPort = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL =
  configuredBaseUrl ?? `http://127.0.0.1:${serverPort}`;

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: isCI ? 120_000 : 180_000,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: isCI ? 20_000 : 10_000,
  },
  use: {
    baseURL,
    headless: true,
    extraHTTPHeaders: {
      "x-e2e-bypass-rate-limit": "true",
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: configuredBaseUrl
    ? undefined
    : {
        command: isCI
          ? `npm run build && npm start -- --hostname 127.0.0.1 --port ${serverPort}`
          : `npm run dev -- --hostname 127.0.0.1 --port ${serverPort}`,
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: isCI ? 600_000 : 300_000,
        env: {
          E2E_RATE_LIMIT_BYPASS: "true",
        },
        stdout: "pipe",
        stderr: "pipe",
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
