import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { dashboardModuleDictionaries } from "../lib/i18n/dashboard-modules.ts";

const dictionaries = dashboardModuleDictionaries;
const moduleRoutes = ["accounting", "payroll", "inventory"];

test("dashboard module dictionaries expose localized labels", () => {
  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    for (const moduleName of moduleRoutes) {
      assert.ok(dictionary[moduleName], `${locale}.${moduleName} dictionary is missing`);
    }
  }

  assert.equal(dictionaries.es.inventory.actions.newMovement, "Nuevo movimiento");
  assert.equal(dictionaries.en.inventory.actions.newMovement, "New movement");
  assert.equal(dictionaries.fr.inventory.actions.newMovement, "Nouveau mouvement");
});

test("dashboard module routes forward the active locale", async () => {
  for (const moduleName of moduleRoutes) {
    const source = await readFile(
      new URL(`../app/[locale]/(dashboard)/${moduleName}/page.tsx`, import.meta.url),
      "utf8",
    );
    assert.match(source, /locale=\{(?:activeLocale|locale as Locale)\}/);
  }
});

test("locale controls preserve the current module pathname", async () => {
  for (const path of ["../components/layout/locale-switcher.tsx", "../components/layout/topbar.tsx"]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /pathname\.replace\(`\/\$\{locale\}`, `\/\$\{targetLocale\}`\)/);
    assert.doesNotMatch(source, /router\.(?:push|replace)\(["'`]\/es\//);
  }
});

test("legal dictionaries localize every public document", () => {
  for (const dictionary of Object.values(dictionaries)) {
    assert.ok(dictionary.legal.common.lastUpdated);
    for (const documentName of ["privacy", "terms", "security"]) {
      assert.ok(dictionary.legal[documentName].title);
      assert.equal(dictionary.legal[documentName].sections.length, 5);
    }
  }

  assert.equal(dictionaries.es.legal.privacy.title, "Política de privacidad");
  assert.equal(dictionaries.en.legal.privacy.title, "Privacy Policy");
  assert.equal(dictionaries.fr.legal.privacy.title, "Politique de confidentialité");
});

test("localized legal routes use the active dictionary", async () => {
  for (const page of ["privacy", "terms", "security"]) {
    const source = await readFile(
      new URL(`../app/[locale]/legal/${page}/page.tsx`, import.meta.url),
      "utf8",
    );
    assert.match(source, /getDictionary\(locale\)/);
    assert.doesNotMatch(source, /title="(?:Privacy Policy|Terms of Service|Security)"/);
  }
});

test("landing navbar includes the localized theme toggle", async () => {
  const source = await readFile(
    new URL("../components/landing/landing-navbar.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<ThemeToggle locale=\{locale\} appearance="landing"/);
});

test("landing theme selector uses a circle reveal while dashboard keeps square", async () => {
  const navbar = await readFile(
    new URL("../components/landing/landing-navbar.tsx", import.meta.url),
    "utf8",
  );
  const toggle = await readFile(
    new URL("../components/layout/theme-toggle.tsx", import.meta.url),
    "utf8",
  );

  const animatedToggle = await readFile(
    new URL("../components/ui/animated-theme-toggler.tsx", import.meta.url),
    "utf8",
  );

  assert.match(navbar, /<ThemeToggle locale=\{locale\} appearance="landing" \/>/);
  assert.doesNotMatch(navbar, /transition="curtain"/);
  assert.match(toggle, /variant=\{appearance === "landing" \? "circle" : "square"\}/);
  assert.doesNotMatch(toggle, /transition\?: "default" \| "curtain"/);
  assert.doesNotMatch(animatedToggle, /curtainPanels|CurtainPhase|runCurtainTransition/);
});

test("landing circle theme reveal uses a synchronized smooth timeline", async () => {
  const toggle = await readFile(
    new URL("../components/layout/theme-toggle.tsx", import.meta.url),
    "utf8",
  );
  const animatedToggle = await readFile(
    new URL("../components/ui/animated-theme-toggler.tsx", import.meta.url),
    "utf8",
  );
  const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(toggle, /duration=\{appearance === "landing" \? 350 : 450\}/);
  assert.match(animatedToggle, /prefers-reduced-motion: reduce/);
  assert.ok(
    animatedToggle.indexOf("prefers-reduced-motion: reduce") <
      animatedToggle.indexOf("document.startViewTransition"),
  );
  assert.ok(animatedToggle.includes('"cubic-bezier(0.22, 1, 0.36, 1)"'));
  assert.match(globals, /html\[data-magicui-theme-vt="active"\]::view-transition-group\(root\)/);
  assert.match(globals, /animation-duration: var\(--magicui-theme-toggle-vt-duration\)/);
  assert.match(globals, /clip-path: var\(--magicui-theme-vt-clip-from\)/);
  assert.match(globals, /::view-transition-old\(root\)[\s\S]*animation: none/);
  assert.match(globals, /::view-transition-new\(root\)[\s\S]*mix-blend-mode: normal/);
});

test("hero operation charts expose localized metric titles", async () => {
  const expected = {
    es: [
      'renewalsHour: "Renovaciones por hora"',
      'revenueHour: "Ingresos por hora"',
      'occupancyHour: "Ocupación por hora"',
      'accessHour: "Accesos por hora"',
    ],
    en: [
      'renewalsHour: "Renewals by hour"',
      'revenueHour: "Revenue by hour"',
      'occupancyHour: "Occupancy by hour"',
      'accessHour: "Check-ins by hour"',
    ],
    fr: [
      'renewalsHour: "Renouvellements par heure"',
      'revenueHour: "Revenu par heure"',
      'occupancyHour: "Occupation par heure"',
      'accessHour: "Accès par heure"',
    ],
  };

  for (const [locale, labels] of Object.entries(expected)) {
    const source = await readFile(new URL(`../lib/i18n/${locale}.ts`, import.meta.url), "utf8");
    for (const label of labels) assert.ok(source.includes(label), `${locale} is missing ${label}`);
  }
});

test("hero operation buttons control the localized chart", async () => {
  const source = await readFile(
    new URL("../components/Hero/index.tsx", import.meta.url),
    "utf8",
  );

  for (const id of ["memberships", "pos", "dashboard", "access"]) {
    assert.match(source, new RegExp(`id: "${id}"`));
  }
  assert.match(source, /useState<OperationId>\("pos"\)/);
  assert.match(source, /aria-pressed=\{activeOperation === id\}/);
  assert.match(source, /setActiveOperation\(id\)/);
  assert.match(source, /selectedOperation\.chartTitle/);
  assert.match(source, /selectedOperation\.chartValues\.map/);
  assert.match(source, /useReducedMotion\(\)/);
});

test("legacy legal routes redirect to canonical localized pages", async () => {
  for (const page of ["privacy", "terms", "security"]) {
    const source = await readFile(new URL(`../app/legal/${page}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`redirect\\(\"/es/legal/${page}\"\\)`));
  }
});
