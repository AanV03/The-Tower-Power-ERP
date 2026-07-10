import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const heroSource = await readFile(new URL("../components/Hero/index.tsx", import.meta.url), "utf8");
const globalsSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const moduleDataSource = await readFile(new URL("../lib/modules.ts", import.meta.url), "utf8").catch(() => "");
const megaMenuSource = await readFile(new URL("../components/landing/mega-menu.tsx", import.meta.url), "utf8").catch(() => "");
const moduleTemplateSource = await readFile(new URL("../components/landing/module-page-template.tsx", import.meta.url), "utf8").catch(() => "");
const navbarSource = await readFile(new URL("../components/landing/landing-navbar.tsx", import.meta.url), "utf8").catch(() => "");

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

test("landing mega menu renders module titles without mini descriptions", () => {
  assert.match(megaMenuSource, /\{item\.label\}/);
  assert.doesNotMatch(megaMenuSource, /\{item\.description\}/);
});

test("hero revenue bars animate upward one by one on load", () => {
  assert.match(heroSource, /motion\.div/);
  assert.match(heroSource, /origin-bottom/);
  assert.match(heroSource, /delay:\s*index\s*\*\s*0\.\d+/);
  assert.match(heroSource, /initial=\{\{\s*scaleY:\s*0/);
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
  assert.match(moduleTemplateSource, />\s*Back\s*</);
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
