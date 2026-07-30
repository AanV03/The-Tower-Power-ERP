import { expect, test } from "@playwright/test";

const adminEmail =
  process.env.E2E_ADMIN_EMAIL ?? "superadmin@towerpower.local";
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ?? "The Tower PowerDemo!2026";

type InventorySummaryResponse = {
  ok: boolean;
  data: {
    moduleId: string;
    metrics: Array<{ key: string; value: string }>;
  };
};

test("aislamiento visual multi-tenant en inventario", async ({ page }) => {
  test.setTimeout(120_000);
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.hostname === "127.0.0.1" && response.status() >= 500) {
      serverErrors.push(`${response.status()} ${url.pathname}`);
    }
  });

  await test.step("iniciar sesion en el tenant principal", async () => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByTestId("login-email").fill(adminEmail);
    await page.getByTestId("login-password").fill(adminPassword);

    const loginResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/login") &&
        response.request().method() === "POST",
    );
    await page.getByTestId("login-submit").click();
    expect((await loginResponse).status()).toBe(200);
    await expect(page).toHaveURL(/\/es\/dashboard(?:[/?#]|$)/, {
      timeout: 15_000,
    });
  });

  await test.step("renderizar inventario de la sucursal esperada", async () => {
    const response = await page.goto("/es/inventory", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    const inventory = page.getByRole("main", {
      name: "Inventario y existencias",
    });
    await expect(inventory).toBeVisible();

    const stockCard = inventory
      .getByText("Total existencias", { exact: true })
      .locator("..")
      .locator("..");
    await expect(stockCard).toContainText("88");

    const warehouseCard = inventory
      .getByText("Almacenes", { exact: true })
      .first()
      .locator("..")
      .locator("..");
    await expect(warehouseCard).toContainText("1");

    const table = inventory.getByRole("table");
    await expect(table).toBeVisible();
    await expect(table.getByRole("row")).toHaveCount(3);
    await expect(table.getByText("Sucursal Centro")).toHaveCount(2);
    await expect(table.getByText("Sucursal Norte")).toHaveCount(0);
    await expect(table.getByText("WHEY-VAIN-2KG")).toBeVisible();
    await expect(table.getByText("TOWEL-PRO")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  await test.step("validar resumen protegido y rechazo cross-tenant", async () => {
    const summaryResponse = await page.request.get(
      "/api/modules/inventory/summary",
    );
    expect(summaryResponse.status()).toBe(200);

    const summary = (await summaryResponse.json()) as InventorySummaryResponse;
    const metrics = Object.fromEntries(
      summary.data.metrics.map(({ key, value }) => [key, value]),
    );
    expect(summary.ok).toBe(true);
    expect(summary.data.moduleId).toBe("inventory");
    expect(metrics).toMatchObject({
      products: "2",
      warehouses: "1",
      lowStock: "0",
    });

    const secondaryTenantId = process.env.E2E_TENANT_B_ID;
    expect(secondaryTenantId).toBeTruthy();
    const crossTenantResponse = await page.request.get(
      "/api/modules/inventory/summary",
      { headers: { "x-tenant-id": secondaryTenantId! } },
    );
    expect(crossTenantResponse.status()).toBe(403);
    await expect(crossTenantResponse.json()).resolves.toMatchObject({
      ok: false,
      error: "TENANT_MISMATCH",
    });
  });

  expect(pageErrors).toEqual([]);
  expect(serverErrors).toEqual([]);
});
