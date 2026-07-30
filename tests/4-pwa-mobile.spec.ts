import { expect, test } from "@playwright/test";

const tenantSlug = "tower-power-demo";
const portalPath = `/es/portal/${tenantSlug}`;
const manifestPath = `${portalPath}/manifest.webmanifest`;
const memberEmail =
  process.env.E2E_MEMBER_EMAIL ?? "miembro.demo@towerpower.local";
const memberPassword =
  process.env.E2E_MEMBER_PASSWORD ??
  process.env.SEED_MEMBER_PASSWORD ??
  "The Tower PowerMember!2026";

type TenantManifest = {
  name?: string;
  display?: string;
  start_url?: string;
  icons?: Array<{ sizes?: string; src?: string }>;
};

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

test("instalacion PWA y responsividad movil", async ({ page }) => {
  test.setTimeout(180_000);
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.hostname === "127.0.0.1" && response.status() >= 500) {
      serverErrors.push(`${response.status()} ${url.pathname}`);
    }
  });

  await test.step("iniciar sesion y abrir el dashboard del portal", async () => {
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
    await expect(page.getByRole("heading", { name: /^Hola,/ })).toBeVisible();
  });

  await test.step("validar responsividad sin desbordamiento horizontal", async () => {
    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    const dimensions = await main.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        left: bounds.left,
        right: bounds.right,
        viewportWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.clientWidth + 1,
    );
    expect(dimensions.left).toBeGreaterThanOrEqual(-1);
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
    expect(dimensions.documentScrollWidth).toBeLessThanOrEqual(
      dimensions.viewportWidth + 1,
    );
  });

  await test.step("validar el manifiesto dinamico instalable", async () => {
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", manifestPath);

    const response = await page.request.get(manifestPath, {
      timeout: 60_000,
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "application/manifest+json",
    );

    const manifest = (await response.json()) as TenantManifest;
    expect(manifest.display).toBe("standalone");
    expect(manifest.name?.trim().length).toBeGreaterThan(0);
    expect(manifest.start_url).toBe(portalPath);
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192" }),
        expect.objectContaining({ sizes: "512x512" }),
      ]),
    );
  });

  expect(pageErrors).toEqual([]);
  expect(serverErrors).toEqual([]);
});
