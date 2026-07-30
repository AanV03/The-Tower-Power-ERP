import { expect, test } from "@playwright/test";

const adminEmail =
  process.env.E2E_ADMIN_EMAIL ?? "superadmin@towerpower.local";
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ?? "The Tower PowerDemo!2026";

test("autenticacion y conexion con PostgreSQL", async ({ page }) => {
  test.setTimeout(60_000);

  await test.step("abrir el login de Gerpy", async () => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByTestId("login-email")).toBeVisible();
  });

  await test.step("autenticar al administrador del seed", async () => {
    const emailInput = page.getByTestId("login-email");
    const passwordInput = page.getByTestId("login-password");
    const submitButton = page.getByTestId("login-submit");

    await emailInput.fill(adminEmail);
    await passwordInput.fill(adminPassword);
    await expect(emailInput).toHaveValue(adminEmail);
    await expect(passwordInput).toHaveValue(adminPassword);
    await expect(submitButton).toBeEnabled();

    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/login") &&
        response.request().method() === "POST",
    );

    await submitButton.click();
    const loginResponse = await loginResponsePromise;
    const responseBody = await loginResponse.text();

    expect(
      loginResponse.status(),
      `POST /api/auth/login devolvio ${loginResponse.status()}: ${responseBody}`,
    ).toBe(200);
  });

  await test.step("validar la carga del dashboard", async () => {
    await expect(page).toHaveURL(/\/es\/dashboard(?:[/?#]|$)/, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("dashboard-heading")).toBeVisible({
      timeout: 15_000,
    });
  });
});
