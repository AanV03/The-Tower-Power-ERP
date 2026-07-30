import { expect, test, type Locator, type Page } from "@playwright/test";
import { generate } from "otplib";

import { resetE2ESeed } from "./global-setup";

const ADMIN_EMAIL =
  process.env.E2E_ADMIN_EMAIL ?? "superadmin@towerpower.local";
const ADMIN_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD ?? "The Tower PowerDemo!2026";
const EMPLOYEE_EMAIL =
  process.env.E2E_EMPLOYEE_EMAIL ?? "empleado@towerpower.local";
const EMPLOYEE_PASSWORD =
  process.env.E2E_EMPLOYEE_PASSWORD ?? "The Tower PowerEmployee!2026";

type LoginResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  twoFactorRequired?: boolean;
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
};

type TenantRecord = {
  tenantId: string;
};

async function fillOtp(group: Locator, code: string) {
  const inputs = group.getByRole("textbox");
  await expect(inputs).toHaveCount(6);

  for (let index = 0; index < code.length; index += 1) {
    await inputs.nth(index).fill(code[index]);
  }
}

async function openLogin(page: Page, ipAddress: string) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ipAddress });
  await page.goto("/login", { waitUntil: "networkidle" });
  await expect(page.getByTestId("login-page")).toBeVisible();
}

async function login(
  page: Page,
  input: {
    email: string;
    password: string;
    ipAddress: string;
    totpSecret?: string;
  },
) {
  await openLogin(page, input.ipAddress);
  await page.getByTestId("login-email").fill(input.email);
  await page.getByTestId("login-password").fill(input.password);

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/login") &&
      response.request().method() === "POST",
  );
  await page.getByTestId("login-submit").click();
  const loginResponse = await loginResponsePromise;
  const payload = await loginResponse.json() as LoginResponse;

  expect(loginResponse.status()).toBe(200);
  expect(payload.ok).toBe(true);

  if (payload.twoFactorRequired) {
    expect(input.totpSecret, "A TOTP secret is required for this login").toBeTruthy();
    const token = await generate({ secret: input.totpSecret! });
    await fillOtp(page.getByTestId("login-2fa-code"), token);

    const verifyResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/2fa/verify") &&
        response.request().method() === "POST",
    );
    await page.getByTestId("login-2fa-submit").click();
    const verifyResponse = await verifyResponsePromise;
    expect(verifyResponse.status()).toBe(200);
  }

  await expect(page).toHaveURL(/\/es\/dashboard(?:[/?#]|$)/, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
}

test.describe.configure({ mode: "serial" });

test.describe("Suite A: frontera de seguridad y autenticación", () => {
  test.afterAll(async () => {
    await resetE2ESeed();
  });

  test("bloquea el sexto intento de fuerza bruta por IP", async ({ page }, testInfo) => {
    const bruteForceIp = `199.199.199.${199 + testInfo.retry}`;

    await page.route("**/api/auth/login", async (route) => {
      const headers = await route.request().allHeaders();
      delete headers["x-e2e-bypass-rate-limit"];
      headers["x-forwarded-for"] = bruteForceIp;
      headers["x-real-ip"] = bruteForceIp;
      await route.continue({ headers });
    });

    await test.step("abre el login con una IP aislada", async () => {
      await openLogin(page, bruteForceIp);
      await page.getByTestId("login-email").fill("ataque@towerpower.local");
      await page.getByTestId("login-password").fill("CredencialIncorrecta!2026");
    });

    await test.step("envía cinco intentos inválidos permitidos", async () => {
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().endsWith("/api/auth/login") &&
            response.request().method() === "POST",
        );
        await page.getByTestId("login-submit").click();
        const response = await responsePromise;

        expect(response.status(), `attempt ${attempt}`).toBe(401);
        await expect(page.getByTestId("login-error")).toContainText(
          "Credenciales invalidas",
        );
        await expect(page.getByTestId("login-submit")).toBeEnabled();
      }
    });

    await test.step("rechaza el sexto intento con HTTP 429 y error visible", async () => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/auth/login") &&
          response.request().method() === "POST",
      );
      await page.getByTestId("login-submit").click();
      const response = await responsePromise;
      const payload = await response.json() as LoginResponse;

      expect(response.status()).toBe(429);
      expect(response.headers()["retry-after"]).toBeTruthy();
      expect(payload).toMatchObject({ ok: false, error: "RATE_LIMITED" });
      await expect(page.getByTestId("login-error")).toContainText(
        "Demasiados intentos",
      );
    });
  });

  test("activa 2FA y exige TOTP en el siguiente inicio de sesión", async ({ page }) => {
    let secret = "";

    await test.step("restablece el Admin sin MFA y abre su dashboard", async () => {
      await resetE2ESeed();
      await login(page, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        ipAddress: "203.0.113.12",
      });
    });

    await test.step("genera la configuración 2FA desde Ajustes", async () => {
      await page.goto("/es/settings", { waitUntil: "networkidle" });
      await expect(page.getByTestId("settings-page")).toBeVisible();
      await expect(page.getByTestId("mfa-status")).toHaveText("Deshabilitado");

      const generateResponsePromise = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/auth/2fa/generate") &&
          response.request().method() === "POST",
      );
      await page.getByTestId("mfa-toggle").click();
      const generateResponse = await generateResponsePromise;

      expect(generateResponse.status()).toBe(200);
      await expect(page.getByTestId("mfa-setup-form")).toBeVisible();
      await expect(page.getByTestId("mfa-qr-code")).toBeVisible();
      secret = (await page.getByTestId("mfa-secret").textContent())?.trim() ?? "";
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    await test.step("verifica el TOTP y persiste el estado habilitado", async () => {
      const token = await generate({ secret });
      await page.getByTestId("mfa-code").fill(token);

      const verifyResponsePromise = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/auth/2fa/verify") &&
          response.request().method() === "POST",
      );
      await page.getByTestId("mfa-enable").click();
      const verifyResponse = await verifyResponsePromise;

      expect(verifyResponse.status()).toBe(200);
      await expect(page.getByTestId("mfa-status")).toHaveText("Habilitado");
      await expect(page.getByTestId("mfa-toggle")).toBeChecked();
      await page.reload({ waitUntil: "networkidle" });
      await expect(page.getByTestId("mfa-status")).toHaveText("Habilitado");
    });

    await test.step("cierra sesión y completa el desafío 2FA al reingresar", async () => {
      const logoutResponse = await page.request.post("/api/auth/logout");
      expect(logoutResponse.status()).toBe(200);

      await login(page, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        ipAddress: "203.0.113.12",
        totpSecret: secret,
      });
    });
  });
});

test.describe("Suite B: aislamiento multi-tenant y RBAC zero-trust", () => {
  test("impide al Empleado abrir Admin o pagar nómina", async ({ page }) => {
    await test.step("autentica al Empleado con alcance de sucursal", async () => {
      await login(page, {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
        ipAddress: "203.0.113.13",
      });
    });

    await test.step("expulsa al Empleado de la configuración administrativa", async () => {
      await page.goto("/es/admin", { waitUntil: "networkidle" });
      await expect(page).toHaveURL(/\/es\/dashboard\?error=forbidden$/);
      await expect(page.getByTestId("dashboard-page")).toBeVisible();
    });

    await test.step("rechaza con 403 el pago directo de nómina", async () => {
      await page.goto("/es/payroll", { waitUntil: "networkidle" });
      await expect(page.getByTestId("payroll-page")).toBeVisible();
      await expect(page.getByTestId("payroll-access-denied")).toBeVisible();
      await expect(
        page.getByText("Acceso denegado", { exact: true }),
      ).toBeVisible();

      const payrollPeriodId = process.env.E2E_PAYROLL_PERIOD_ID;
      expect(payrollPeriodId).toBeTruthy();

      const payResponse = await page.request.post(
        `/api/payroll/periods/${encodeURIComponent(payrollPeriodId!)}/pay`,
      );
      const payload = await payResponse.json() as ApiEnvelope<unknown>;

      expect(payResponse.status()).toBe(403);
      expect(payload.error).toBe("PERMISSION_DENIED");
    });
  });

  test("bloquea bleed de nóminas y empleados del Tenant B", async ({ page }) => {
    const tenantAId = process.env.E2E_TENANT_A_ID;
    const tenantBId = process.env.E2E_TENANT_B_ID;

    await test.step("autentica al Empleado del Tenant A", async () => {
      expect(tenantAId).toBeTruthy();
      expect(tenantBId).toBeTruthy();
      expect(tenantAId).not.toBe(tenantBId);
      await login(page, {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
        ipAddress: "203.0.113.14",
      });
    });

    await test.step("bloquea Nómina y mantiene RR. HH. aislado ante tenantId manipulado", async () => {
      const payrollResponse = await page.request.get(
        `/api/payroll/periods?tenantId=${encodeURIComponent(tenantBId!)}`,
      );
      const payrollPayload = await payrollResponse.json() as ApiEnvelope<unknown>;
      expect(payrollResponse.status()).toBe(403);
      expect(payrollPayload.error).toBe("PERMISSION_DENIED");

      const employeeResponse = await page.request.get(
        `/api/hr/employees?tenantId=${encodeURIComponent(tenantBId!)}`,
      );
      const employeePayload = await employeeResponse.json() as ApiEnvelope<{
        items: TenantRecord[];
      }>;
      expect(employeeResponse.status()).toBe(200);
      expect(employeePayload.data?.items.length).toBeGreaterThan(0);
      expect(employeePayload.data?.items.every((item) => item.tenantId === tenantAId)).toBe(true);
    });

    await test.step("rechaza la suplantación explícita del header de tenant", async () => {
      for (const path of ["/api/payroll/periods", "/api/hr/employees"]) {
        const response = await page.request.get(path, {
          headers: { "x-tenant-id": tenantBId! },
        });
        const payload = await response.json() as ApiEnvelope<unknown>;

        expect(response.status(), path).toBe(403);
        expect(payload.error, path).toBe("TENANT_MISMATCH");
      }
    });

    await test.step("mantiene la vista de Nómina en el Tenant A", async () => {
      await page.goto(
        `/es/payroll?tenantId=${encodeURIComponent(tenantBId!)}`,
        { waitUntil: "networkidle" },
      );
      await expect(page.getByTestId("payroll-page")).toBeVisible();
      await expect(page.getByTestId("payroll-access-denied")).toBeVisible();
    });
  });
});

test.describe("Suite C: flujo financiero y tolerancia a fallos", () => {
  test.beforeEach(async () => {
    await resetE2ESeed();
  });

  test("paga una nómina mostrando estado pendiente y confirmación", async ({ page }) => {
    await test.step("autentica al Admin y abre la nómina aprobada", async () => {
      await login(page, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        ipAddress: "203.0.113.15",
      });
      await page.goto("/es/payroll", { waitUntil: "networkidle" });
      await expect(page.getByTestId("payroll-period-status")).toHaveText("Aprobado");
    });

    await test.step("mantiene el botón deshabilitado mientras el pago está en vuelo", async () => {
      let backendStatus = 0;
      await page.route("**/api/payroll/periods/*/pay", async (route) => {
        const response = await route.fetch();
        backendStatus = response.status();
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({ response });
      });

      const payButton = page.getByTestId("payroll-pay-button");
      const responsePromise = page.waitForResponse(
        (response) =>
          /\/api\/payroll\/periods\/[^/]+\/pay$/.test(response.url()) &&
          response.request().method() === "POST",
      );
      await payButton.click();
      await expect(payButton).toBeDisabled();
      await expect(payButton).toHaveAttribute("data-pending", "true");
      await expect(payButton).toContainText("Marcando...");

      const response = await responsePromise;
      expect(response.status()).toBe(200);
      expect(backendStatus).toBe(200);
    });

    await test.step("confirma el éxito y actualiza el periodo a pagado", async () => {
      await expect(
        page.getByText("Periodo marcado como pagado.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("payroll-period-status")).toHaveText("Pagado");
    });
  });

  test("resuelve dos pagos simultáneos con 409 sin romper la UI", async ({ page }) => {
    const statuses: number[] = [];
    let conflictPayload: ApiEnvelope<unknown> | null = null;

    await test.step("autentica al Admin y prepara la nómina aprobada", async () => {
      await login(page, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        ipAddress: "203.0.113.16",
      });
      await page.goto("/es/payroll", { waitUntil: "networkidle" });
      await expect(page.getByTestId("payroll-period-status")).toHaveText("Aprobado");
    });

    await test.step("duplica el POST de pago de forma concurrente", async () => {
      await page.route("**/api/payroll/periods/*/pay", async (route) => {
        const url = route.request().url();
        const [uiResponse, duplicateResponse] = await Promise.all([
          route.fetch(),
          page.request.post(url),
        ]);
        statuses.push(uiResponse.status(), duplicateResponse.status());

        const conflictResponse =
          uiResponse.status() === 409
            ? uiResponse
            : duplicateResponse.status() === 409
              ? duplicateResponse
              : uiResponse;
        conflictPayload = await conflictResponse.json() as ApiEnvelope<unknown>;

        await route.fulfill({
          status: conflictResponse.status(),
          contentType: "application/json",
          body: JSON.stringify(conflictPayload),
        });
      });

      const payButton = page.getByTestId("payroll-pay-button");
      const responsePromise = page.waitForResponse(
        (response) =>
          /\/api\/payroll\/periods\/[^/]+\/pay$/.test(response.url()) &&
          response.request().method() === "POST",
      );
      await payButton.click();
      await expect(payButton).toBeDisabled();
      const response = await responsePromise;

      expect(response.status()).toBe(409);
      expect(statuses.sort((left, right) => left - right)).toEqual([200, 409]);
      expect(conflictPayload).toMatchObject({
        ok: false,
        error: "PAYROLL_ALREADY_PROCESSED",
      });
    });

    await test.step("muestra el conflicto y conserva la vista operativa", async () => {
      await expect(
        page.getByText("Pago ya procesado o en curso", { exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("payroll-page")).toBeVisible();
      await expect(page.getByTestId("payroll-pay-button")).toBeEnabled();
    });
  });
});
