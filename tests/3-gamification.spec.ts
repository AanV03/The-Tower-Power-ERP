import { expect, test } from "@playwright/test";

const tenantSlug = "tower-power-demo";
const memberEmail =
  process.env.E2E_MEMBER_EMAIL ?? "miembro.demo@towerpower.local";
const memberPassword =
  process.env.E2E_MEMBER_PASSWORD ??
  process.env.SEED_MEMBER_PASSWORD ??
  "The Tower PowerMember!2026";

type ProgressResponse = {
  ok: boolean;
  data: {
    points: number;
    level: string;
    nextLevelPoints: number;
    history: Array<{
      weight: number | null;
      bodyFat: number | null;
      muscleMass: number | null;
    }>;
  };
};

test("gamificacion y progreso XP desde MongoDB", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });

  const consoleErrors: string[] = [];
  const serverErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.hostname === "127.0.0.1" && response.status() >= 500) {
      serverErrors.push(`${response.status()} ${url.pathname}`);
    }
  });

  await test.step("iniciar sesion como socio del tenant", async () => {
    const portalPath = `/es/portal/${tenantSlug}`;
    await page.goto(`/login?next=${encodeURIComponent(portalPath)}`, {
      waitUntil: "networkidle",
    });
    await page.getByTestId("login-email").fill(memberEmail);
    await page.getByTestId("login-password").fill(memberPassword);

    const loginResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/login") &&
        response.request().method() === "POST",
    );
    await page.getByTestId("login-submit").click();
    expect((await loginResponse).status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${portalPath}(?:[/?#]|$)`), {
      timeout: 60_000,
    });
  });

  let visibleXp = -1;
  await test.step("validar el widget de rango y experiencia", async () => {
    const portal = page.getByRole("main");
    await expect(portal.getByText("Rango Actual", { exact: true })).toBeVisible({
      timeout: 60_000,
    });

    const rank = portal
      .getByText("Rango Actual", { exact: true })
      .locator("..")
      .getByRole("heading");
    await expect(rank).toHaveText(/^(Nivel \d+|Sin rango)$/);

    const xpLabel = portal.getByText(/^\d+ XP acumulados$/);
    const xpText = await xpLabel.textContent();
    const xpMatch = xpText?.match(/^(\d+) XP acumulados$/);
    expect(xpMatch).not.toBeNull();
    visibleXp = Number(xpMatch![1]);
    expect(Number.isFinite(visibleXp)).toBe(true);
    expect(visibleXp).toBeGreaterThanOrEqual(0);

    const percentText = await portal.getByText(/^\d+%$/).textContent();
    const percent = Number(percentText?.replace("%", ""));
    expect(Number.isFinite(percent)).toBe(true);
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
    await expect(portal).not.toContainText("NaN");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  await test.step("consultar el historial de mediciones", async () => {
    const response = await page.request.get(
      `/api/client/progress?tenantSlug=${tenantSlug}`,
      { timeout: 60_000 },
    );
    expect(response.status()).toBe(200);

    const payload = (await response.json()) as ProgressResponse;
    expect(payload.ok).toBe(true);
    expect(Number.isFinite(payload.data.points)).toBe(true);
    expect(Number.isFinite(payload.data.nextLevelPoints)).toBe(true);
    expect(payload.data.points).toBe(visibleXp);
    expect(Array.isArray(payload.data.history)).toBe(true);

    for (const measurement of payload.data.history) {
      for (const value of [
        measurement.weight,
        measurement.bodyFat,
        measurement.muscleMass,
      ]) {
        expect(value === null || Number.isFinite(value)).toBe(true);
      }
    }
  });

  expect(consoleErrors).toEqual([]);
  expect(serverErrors).toEqual([]);
});
