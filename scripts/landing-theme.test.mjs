import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const heroSource = await readFile(new URL("../components/Hero/index.tsx", import.meta.url), "utf8");
const globalsSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const moduleDataSource = await readFile(new URL("../lib/modules.ts", import.meta.url), "utf8").catch(() => "");
const megaMenuSource = await readFile(new URL("../components/landing/mega-menu.tsx", import.meta.url), "utf8").catch(() => "");
const moduleTemplateSource = await readFile(new URL("../components/landing/module-page-template.tsx", import.meta.url), "utf8").catch(() => "");
const navbarSource = await readFile(new URL("../components/landing/landing-navbar.tsx", import.meta.url), "utf8").catch(() => "");
const footerSource = await readFile(new URL("../components/landing/landing-footer.tsx", import.meta.url), "utf8").catch(() => "");
const homeSource = await readFile(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8").catch(() => "");
const classGridSource = await readFile(new URL("../components/ClassGrid.tsx", import.meta.url), "utf8").catch(() => "");
const tickerSource = await readFile(new URL("../components/KineticTicker.tsx", import.meta.url), "utf8").catch(() => "");
const legalPageSource = await readFile(new URL("../components/landing/legal-page.tsx", import.meta.url), "utf8").catch(() => "");
const moduleRouteSource = await readFile(new URL("../app/[locale]/modules/[slug]/page.tsx", import.meta.url), "utf8").catch(() => "");
const enDictionarySource = await readFile(new URL("../lib/i18n/en.ts", import.meta.url), "utf8");
const esDictionarySource = await readFile(new URL("../lib/i18n/es.ts", import.meta.url), "utf8");
const frDictionarySource = await readFile(new URL("../lib/i18n/fr.ts", import.meta.url), "utf8");
const moduleScreenshotSource = await readFile(new URL("../components/landing/module-screenshot.tsx", import.meta.url), "utf8").catch(() => "");
const operationsPageSource = await readFile(new URL("../components/landing/operations-page.tsx", import.meta.url), "utf8").catch(() => "");
const operationsRouteSource = await readFile(new URL("../app/[locale]/operations/page.tsx", import.meta.url), "utf8").catch(() => "");
const contactPageSource = await readFile(new URL("../components/landing/contact-page.tsx", import.meta.url), "utf8").catch(() => "");
const contactRouteSource = await readFile(new URL("../app/[locale]/contact/page.tsx", import.meta.url), "utf8").catch(() => "");
const contactFormSource = await readFile(new URL("../components/landing/contact-form.tsx", import.meta.url), "utf8").catch(() => "");
const mobilePublicMenuSource = await readFile(new URL("../components/landing/mobile-public-menu.tsx", import.meta.url), "utf8").catch(() => "");

function landingPaletteBlock(source) {
  const match = source.match(/\.landing-palette\s*\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, "landing-palette block should exist");
  return match.groups.body;
}

function darkLandingPaletteBlock(source) {
  const match = source.match(/\.dark \.landing-palette\s*\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, "dark landing-palette block should exist");
  return match.groups.body;
}

function cssBlock(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\n\\s*\\}`));
  assert.ok(match?.groups?.body, `${selector} block should exist`);
  return match.groups.body;
}

test("landing hero renders its background in light theme", () => {
  assert.match(heroSource, /<AuthBackground variant="hero"/);
  assert.doesNotMatch(heroSource, /<AuthBackground variant="hero" className="hidden dark:block"/);
});

test("light landing palette keeps a visible brand-tinted canvas", () => {
  const palette = landingPaletteBlock(globalsSource);

  assert.doesNotMatch(palette, /--landing-background:\s*#ffffff;/);
  assert.doesNotMatch(palette, /--landing-bg:\s*#ffffff;/);
  assert.doesNotMatch(palette, /--landing-bg-deep:\s*#ffffff;/);
  assert.doesNotMatch(palette, /--landing-hero-bg:\s*#ffffff;/);
});

test("light landing hero dots remain visible on the tinted canvas", () => {
  const palette = landingPaletteBlock(globalsSource);
  const match = palette.match(/--landing-dot-color:\s*rgba\(2,\s*84,\s*83,\s*(?<alpha>0\.\d+)\);/);

  assert.ok(match?.groups?.alpha, "landing dot color should be configured in the light palette");
  assert.ok(Number(match.groups.alpha) >= 0.28, "landing dot opacity should be strong enough in light theme");
  assert.match(globalsSource, /\.auth-background-hero \.landing-dot-grid\s*\{[\s\S]*--landing-dot-color:\s*rgba\(2,\s*84,\s*83,\s*0\.[3-9]\d*\);/);
});

test("dark landing hero dots use their own visible teal treatment", () => {
  const palette = darkLandingPaletteBlock(globalsSource);

  assert.match(palette, /--landing-dot-color:\s*rgba\(94,\s*234,\s*212,\s*0\.[2-9]\d*\);/);
  assert.match(globalsSource, /\.dark \.auth-background-hero \.landing-dot-grid\s*\{[\s\S]*--landing-dot-color:\s*rgba\(94,\s*234,\s*212,\s*0\.[3-9]\d*\);/);
});

test("auth background has visible layered light-theme treatment", () => {
  assert.match(globalsSource, /\.auth-background\s*\{/);
  assert.match(globalsSource, /radial-gradient\(circle at 18% 18%, rgba\(10, 122, 120, 0\.[0-9]+\)/);
  assert.match(globalsSource, /linear-gradient\(180deg, rgba\(232, 247, 245, 0\.[0-9]+\)/);
});

test("auth route dots stay visible in light and dark themes", () => {
  const lightAuthDots = cssBlock(globalsSource, ".auth-background .landing-dot-grid");
  const darkAuthDots = cssBlock(globalsSource, ".dark .auth-background .landing-dot-grid");

  assert.match(lightAuthDots, /--landing-dot-color:\s*rgba\(2,\s*84,\s*83,\s*0\.[3-9]\d*\);/);
  assert.match(darkAuthDots, /--landing-dot-color:\s*rgba\(94,\s*234,\s*212,\s*0\.[2-9]\d*\);/);
});

test("landing module data exposes every requested public module slug", () => {
  const expectedSlugs = [
    "panel-operativo",
    "punto-de-venta",
    "suscripciones",
    "acceso",
    "catalogo",
    "compras",
    "almacenes",
    "inventario",
    "finanzas",
    "contabilidad",
    "rh-y-nomina",
    "nomina",
    "especialistas",
    "marketing",
    "analytics",
  ];

  for (const slug of expectedSlugs) {
    assert.match(moduleDataSource, new RegExp(`slug:\\s*"${slug}"`));
  }
});

test("localized public module landing route exists", async () => {
  await access(new URL("../app/[locale]/modules/[slug]/page.tsx", import.meta.url));
});

test("public module route localizes lookup and metadata", () => {
  assert.match(moduleRouteSource, /moduleSlugs\.map/);
  assert.match(moduleRouteSource, /if \(!isLocale\(locale\)\)/);
  assert.match(moduleRouteSource, /getModuleBySlug\(slug, locale\)/);
  assert.doesNotMatch(moduleRouteSource, /getModuleBySlug\(slug\);/);
});

test("public module catalog resolves content by locale", () => {
  assert.match(moduleDataSource, /import type \{ Locale \} from "@\/lib\/i18n"/);
  assert.match(moduleDataSource, /content:\s*Record<Locale, LocalizedModuleContent>/);
  assert.match(moduleDataSource, /getMegaMenuSections\(locale:\s*Locale\)/);
  assert.match(moduleDataSource, /getModuleBySlug\(slug:\s*string,\s*locale:\s*Locale\)/);
  assert.match(moduleDataSource, /description:\s*feature\.description/);
});

test("every public module has an explicit supplied screenshot", () => {
  const screenshots = [
    "Panel Op.png", "POS.png", "Gestion Membresias.png", "Access Control.png",
    "Product catalog.png", "Purchasing supply.png", "Warehouse Management.png",
    "Inventory Stock.png", "Finance Module.png", "Accounting.png", "HR attendance.png",
    "Payroll commissions.png", "Period Settlement.png", "Marketing retention.png",
    "Analytics Intelligence.png",
  ];

  for (const screenshot of screenshots) {
    assert.match(moduleDataSource, new RegExp(screenshot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("module highlights contain real descriptions in every locale", () => {
  assert.match(moduleDataSource, /features:\s*\[\s*\{\s*title:/);
  assert.match(moduleDataSource, /description:\s*"[^"]{24,}"/);
  assert.doesNotMatch(moduleDataSource, /Public preview copy for this capability/);
});

test("module page dictionaries localize all shared page chrome", () => {
  for (const source of [enDictionarySource, esDictionarySource, frDictionarySource]) {
    assert.match(source, /modulePage:\s*\{/);
    assert.match(source, /back:/);
    assert.match(source, /featuresEyebrow:/);
    assert.match(source, /featuresTitle:/);
    assert.match(source, /bannerEyebrow:/);
    assert.match(source, /bannerTitle:/);
  }
});

test("public module template renders supplied images and real highlights", () => {
  assert.match(moduleTemplateSource, /<ModuleScreenshot/);
  assert.match(moduleScreenshotSource, /import Image from "next\/image"/);
  assert.match(moduleScreenshotSource, /src=\{module\.imageSrc\}/);
  assert.match(moduleScreenshotSource, /alt=\{module\.imageAlt\}/);
  assert.match(moduleTemplateSource, /feature\.description/);
  assert.doesNotMatch(moduleTemplateSource, /Screenshot preview coming soon/);
  assert.doesNotMatch(moduleTemplateSource, /Public preview copy for this capability/);
});

test("public module page has no create-account action", () => {
  assert.doesNotMatch(moduleTemplateSource, /href=\{"\/register"/);
  assert.doesNotMatch(moduleTemplateSource, /Create account/);
  assert.doesNotMatch(moduleTemplateSource, /ArrowRight/);
});

test("module screenshots use intrinsic dimensions in a full-width section", () => {
  assert.match(moduleDataSource, /imageWidth:\s*number/);
  assert.match(moduleDataSource, /imageHeight:\s*number/);
  assert.match(moduleTemplateSource, /<ModuleScreenshot/);
  assert.doesNotMatch(moduleTemplateSource, /lg:grid-cols-\[0\.9fr_1\.1fr\]/);
  assert.doesNotMatch(moduleTemplateSource, /min-h-\[24rem\]/);
  assert.match(moduleScreenshotSource, /width=\{module\.imageWidth\}/);
  assert.match(moduleScreenshotSource, /height=\{module\.imageHeight\}/);
  assert.match(moduleScreenshotSource, /className="h-auto w-full"/);
});

test("module screenshots expand into an accessible dialog", () => {
  assert.match(moduleScreenshotSource, /role="dialog"/);
  assert.match(moduleScreenshotSource, /aria-modal="true"/);
  assert.match(moduleScreenshotSource, /event\.key === "Escape"/);
  assert.match(moduleScreenshotSource, /document\.body\.style\.overflow/);
  assert.match(moduleScreenshotSource, /trigger\?\.focus\(\)/);
  assert.match(moduleScreenshotSource, /closeRef\.current\?\.focus\(\)/);
  assert.match(moduleScreenshotSource, /event\.key === "Tab"/);
});

test("localized public operations page exists", async () => {
  await access(new URL("../app/[locale]/operations/page.tsx", import.meta.url));
  assert.match(operationsPageSource, /dictionary\.landing\.operationsPage/);
  assert.match(operationsRouteSource, /if \(!isLocale\(locale\)\)/);
  assert.match(operationsRouteSource, /generateMetadata/);
  assert.match(operationsPageSource, /moduleLinks\.map/);
});

test("localized public contact page exists", async () => {
  await access(new URL("../app/[locale]/contact/page.tsx", import.meta.url));
  assert.match(contactPageSource, /dictionary\.landing\.contactPage/);
  assert.match(contactRouteSource, /if \(!isLocale\(locale\)\)/);
  assert.match(contactRouteSource, /generateMetadata/);
  assert.match(contactFormSource, /"aria-describedby": error \? errorId : undefined/);
  assert.match(contactFormSource, /id=\{errorId\}/);
});

test("landing navbar routes to operations and contact pages", () => {
  assert.match(navbarSource, /localizedPath\(locale, "operations"\)/);
  assert.match(navbarSource, /localizedPath\(locale, "contact"\)/);
  assert.doesNotMatch(navbarSource, /#operations|#contact/);
  assert.doesNotMatch(navbarSource, /handleSectionClick|curtainPhase/);
  assert.match(navbarSource, /<MobilePublicMenu locale=\{locale\}/);
  assert.match(navbarSource, /event\.metaKey/);
  assert.match(navbarSource, /hidden min-h-10[\s\S]*lg:inline-flex/);
  assert.match(mobilePublicMenuSource, /triggerRef\.current\?\.focus\(\)/);
  assert.match(mobilePublicMenuSource, /aria-controls="mobile-public-navigation"/);
});

test("landing mega menu renders module titles without mini descriptions", () => {
  assert.match(megaMenuSource, /\{item\.label\}/);
  assert.doesNotMatch(megaMenuSource, /\{item\.description\}/);
});

test("landing mega menu consumes the localized module catalog", () => {
  assert.match(megaMenuSource, /getMegaMenuSections\(safeLocale\)/);
  assert.doesNotMatch(megaMenuSource, /localizedModuleLabel/);
  assert.doesNotMatch(megaMenuSource, /const labels:\s*Record<string, string>/);
});

test("hero revenue bars animate upward one by one on load", () => {
  assert.match(heroSource, /motion\.div/);
  assert.match(heroSource, /origin-bottom/);
  assert.match(heroSource, /delay:\s*index\s*\*\s*0\.\d+/);
  assert.match(heroSource, /initial=\{shouldReduceMotion\s*\?\s*false\s*:\s*\{\s*scaleY:\s*0/);
  assert.match(heroSource, /animate=\{\{\s*scaleY:\s*1/);
});

test("hero stat values animate with a Framer Motion number helper", () => {
  assert.match(heroSource, /function AnimateNumber/);
  assert.match(heroSource, /animate\(0,\s*value/);
  assert.match(heroSource, /<AnimateNumber/);
});

test("module pages use a short back link and no start setup button", () => {
  assert.doesNotMatch(moduleTemplateSource, /Start setup/);
  assert.doesNotMatch(moduleTemplateSource, /Back to landing/);
  assert.match(moduleTemplateSource, /\{pageCopy\.back\}/);
});

test("landing navbar and mega menu avoid clipping on tablet widths", () => {
  assert.match(navbarSource, /lg:grid-cols-\[minmax\(260px,0\.9fr\)_auto_minmax\(260px,0\.9fr\)\]/);
  assert.match(navbarSource, /hidden items-center justify-center[\s\S]*lg:flex/);
  assert.match(megaMenuSource, /className="relative lg:hidden"/);
  assert.match(megaMenuSource, /className="relative hidden lg:block"/);
  assert.match(megaMenuSource, /fixed inset-x-2 top-\[calc\(3\.75rem\+0\.75rem\)\]/);
  assert.match(megaMenuSource, /max-h-\[calc\(100svh-5rem\)\]/);
  assert.match(megaMenuSource, /overflow-y-auto/);
  assert.doesNotMatch(megaMenuSource, /left-1\/2 top-\[calc\(100%\+0\.75rem\)\][\s\S]*-translate-x-1\/2/);
});

test("workflow app cards stay wide enough for labels", () => {
  assert.match(homeSource, /lg:grid-cols-\[0\.55fr_1\.45fr\]/);
  assert.match(homeSource, /lg:grid-cols-3/);
  assert.doesNotMatch(homeSource, /\[overflow-wrap:anywhere\]/);
  assert.match(homeSource, /min-h-20/);
  assert.doesNotMatch(homeSource, /min-h-24/);
});

test("landing footer removes product and status links", () => {
  assert.doesNotMatch(footerSource, /Product/);
  assert.doesNotMatch(footerSource, /Status/);
  assert.match(footerSource, /dictionary\.landing\.legal\[link\.labelKey\]/);
  assert.match(footerSource, /localizedPath\(locale,\s*link\.path\)/);
});

test("standard legal pages exist for footer links", async () => {
  assert.match(footerSource, /localizedPath\(locale,\s*link\.path\)/);
  await access(new URL("../app/[locale]/legal/privacy/page.tsx", import.meta.url));
  await access(new URL("../app/[locale]/legal/terms/page.tsx", import.meta.url));
  await access(new URL("../app/[locale]/legal/security/page.tsx", import.meta.url));
});

test("localized legal pages keep locale-aware navigation", () => {
  assert.match(legalPageSource, /<LandingNavbar locale=\{locale\}/);
  assert.match(legalPageSource, /<LandingFooter locale=\{locale\}/);
  assert.match(navbarSource, /href=\{localizedHome\(locale\)\}/);
  assert.doesNotMatch(navbarSource, /href=\{\/"/);
  assert.match(navbarSource, /href=\{link\.href\}/);
  assert.match(navbarSource, /localizedPath\(locale, "operations"\)/);
  assert.match(navbarSource, /localizedPath\(locale, "contact"\)/);
});

test("landing mega menu and screenshot sections use localized dictionaries", () => {
  assert.match(navbarSource, /<LandingMegaMenu locale=\{locale\} mode="desktop"/);
  assert.match(navbarSource, /<LandingMegaMenu locale=\{locale\} mode="mobile"/);
  assert.match(megaMenuSource, /getDictionary\(safeLocale\)/);
  assert.match(megaMenuSource, /dictionary\.landing\.megaMenu\.button/);
  assert.match(megaMenuSource, /getMegaMenuSections\(safeLocale\)/);
  assert.match(classGridSource, /dictionary\.landing\.classGrid/);
  assert.match(tickerSource, /dictionary\.landing\.ticker\.primary/);
  assert.match(tickerSource, /dictionary\.landing\.ticker\.outline/);
});
