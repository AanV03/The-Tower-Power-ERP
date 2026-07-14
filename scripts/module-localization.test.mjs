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

test("landing navbar opts into the theme curtain transition", async () => {
  const navbar = await readFile(
    new URL("../components/landing/landing-navbar.tsx", import.meta.url),
    "utf8",
  );
  const toggle = await readFile(
    new URL("../components/layout/theme-toggle.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    navbar,
    /<ThemeToggle locale=\{locale\} appearance="landing" transition="curtain"/,
  );
  assert.match(toggle, /transition\?: "default" \| "curtain"/);
  assert.match(toggle, /transition=\{transition\}/);
});

test("theme curtain is a reduced-motion-safe seven-panel Framer Motion wipe", async () => {
  const source = await readFile(
    new URL("../components/ui/animated-theme-toggler.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /import \{ motion \} from "framer-motion"/);
  assert.match(source, /Array\.from\(\{ length: 7 \}/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /setCurtainPhase\("cover"\)/);
  assert.match(source, /setTheme\(isDark \? "light" : "dark"\)/);
  assert.match(source, /setCurtainPhase\("reveal"\)/);
  assert.match(source, /disabled=\{disabled \|\| curtainPhase !== "idle"\}/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /pointer-events-none fixed inset-0/);
});

test("legacy legal routes redirect to canonical localized pages", async () => {
  for (const page of ["privacy", "terms", "security"]) {
    const source = await readFile(new URL(`../app/legal/${page}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`redirect\\(\"/es/legal/${page}\"\\)`));
  }
});
