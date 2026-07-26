import { expect, test } from "@playwright/test";

const demoEmail = process.env.E2E_USER_EMAIL ?? "owner@gerpy.com";
const demoPassword = process.env.E2E_USER_PASSWORD ?? "Password123!";
const foreignTenantId =
  process.env.E2E_FOREIGN_TENANT_ID ?? "e2e-foreign-tenant";

test("autentica y protege el contexto multi-tenant", async ({ page }) => {
  test.setTimeout(120_000);

  await test.step("inicia sesion con el usuario del seed", async () => {
    await page.goto("/login");

    await page.locator("#login-email").fill(demoEmail);
    await page.locator("#login-password").fill(demoPassword);
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/login") &&
        response.request().method() === "POST",
    );
    await page.locator("#login-submit").click();
    const loginResponse = await loginResponsePromise;

    expect(loginResponse.status()).toBe(200);
    await expect(loginResponse.json()).resolves.toMatchObject({ ok: true });
    await expect(page).toHaveURL(/\/es\/dashboard(?:[/?#]|$)/, {
      timeout: 30_000,
    });
  });

  await test.step("cierra el onboarding si sigue pendiente", async () => {
    await page.waitForLoadState("domcontentloaded");
    const skipOnboarding = page.getByRole("button", {
      name: "Omitir y salir",
      exact: true,
    });
    if (!(await skipOnboarding.isVisible())) return;

    const onboardingResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/tenant") &&
        response.request().method() === "PATCH",
    );
    await skipOnboarding.click();
    const onboardingResponse = await onboardingResponsePromise;

    expect(onboardingResponse.status()).toBe(200);
    await expect(skipOnboarding).toBeHidden();
  });

  await test.step("carga el perfil desde la membresia activa", async () => {
    const response = await page.goto("/es/profile", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Perfil", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#email")).toHaveValue(demoEmail);
    await expect(
      page.getByText("Sucursal Matriz", { exact: true }).first(),
    ).toBeVisible();

    const employmentTab = page.getByRole("tab", { name: "Ficha Laboral" });
    await expect(async () => {
      await employmentTab.click();
      await expect(employmentTab).toHaveAttribute("aria-selected", "true", {
        timeout: 1_000,
      });
    }).toPass({ timeout: 20_000 });
    await expect(
      page.getByText("Gimnasio Gerpy Matriz", { exact: true }).first(),
    ).toBeVisible();
  });

  await test.step("carga ajustes y el estado MFA", async () => {
    const response = await page.goto("/es/settings", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Configuración", exact: true }),
    ).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).not.toBeChecked();
  });

  await test.step("bloquea una ruta protegida de otro tenant", async () => {
    const response = await page.request.get("/api/admin/tenant", {
      headers: {
        "x-tenant-id": foreignTenantId,
      },
    });

    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "TENANT_MISMATCH",
    });
  });
});
