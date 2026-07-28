import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

async function exists(path) {
  await access(new URL(path, root));
}

const authShellSource = await source("components/layout/auth-shell.tsx");
const loginSource = await source("app/login/page.tsx");
const registerSource = await source("app/register/page.tsx");
const recoverySource = await source("components/auth/password-recovery-form.tsx");
const emailValidationSource = await source("components/auth/email-validation-placeholder.tsx");
const navbarSource = await source("components/landing/landing-navbar.tsx");
const middlewareSource = await source("middleware.ts");
const enSource = await source("lib/i18n/en.ts");
const esSource = await source("lib/i18n/es.ts");
const frSource = await source("lib/i18n/fr.ts");

test("localized auth route files exist for every auth page", async () => {
  await exists("app/[locale]/login/page.tsx");
  await exists("app/[locale]/register/page.tsx");
  await exists("app/[locale]/password-recovery/page.tsx");
  await exists("app/[locale]/email-validation/page.tsx");
});

test("auth shell renders a localized landing back action through the shared transition", () => {
  assert.match(authShellSource, /locale\?: Locale/);
  assert.match(authShellSource, /backLabel\?: string/);
  assert.match(authShellSource, /localizedHome\(locale\)/);
  assert.match(authShellSource, /startRouteTransition\(localizedHome\(locale\)\)/);
  assert.match(authShellSource, /ArrowLeft/);
});

test("auth pages preserve locale in cross-auth navigation", () => {
  assert.match(loginSource, /localizedPath\(locale, "password-recovery"\)/);
  assert.match(loginSource, /localizedPath\(locale, "register"\)/);
  assert.match(loginSource, /localizedPath\(locale, "dashboard"\)/);
  assert.match(registerSource, /localizedPath\(locale, "dashboard"\)/);
  assert.match(registerSource, /localizedPath\(locale, "login"\)/);
  assert.match(recoverySource, /localizedPath\(locale, "login"\)/);
  assert.match(emailValidationSource, /localizedHome\(locale\)/);

  for (const pageSource of [loginSource, registerSource, recoverySource, emailValidationSource]) {
    assert.doesNotMatch(pageSource, /href=\{?"\/(?:login|register|password-recovery|email-validation)/);
    assert.doesNotMatch(pageSource, /"\/es\/dashboard"/);
  }
});

test("landing navbar setup CTA uses the active locale", () => {
  assert.match(navbarSource, /const registerHref = localizedPath\(locale, "register"\)/);
  assert.match(navbarSource, /href=\{registerHref\}/);
  assert.match(navbarSource, /handleRouteClick\(event, registerHref\)/);
  assert.doesNotMatch(navbarSource, /href=\{"\/register" as Route\}/);
});

test("localized auth pages validate locale before rendering", async () => {
  const localeLoginSource = await source("app/[locale]/login/page.tsx");
  const localeRegisterSource = await source("app/[locale]/register/page.tsx");
  const localeRecoverySource = await source("app/[locale]/password-recovery/page.tsx");
  const localeEmailValidationSource = await source("app/[locale]/email-validation/page.tsx");

  for (const pageSource of [localeLoginSource, localeRegisterSource, localeRecoverySource, localeEmailValidationSource]) {
    assert.match(pageSource, /isLocale\(locale\)/);
    assert.match(pageSource, /notFound\(\)/);
  }

  assert.match(localeLoginSource, /<LoginPage \/>/);
  assert.match(localeRegisterSource, /<RegisterPage \/>/);

  for (const pageSource of [localeRecoverySource, localeEmailValidationSource]) {
    assert.match(pageSource, /locale=\{locale as Locale\}/);
  }
});

test("middleware keeps locale in legacy auth and unauthorized redirects", () => {
  assert.match(middlewareSource, /return `\/\$\{locale\}\/login`/);
  assert.match(middlewareSource, /return `\/\$\{locale\}\/register`/);
  assert.match(middlewareSource, /new URL\(locale \? `\/\$\{locale\}\/login` : "\/login", request\.url\)/);
});

test("auth dictionaries include localized back, recovery, email validation, and 2FA copy", () => {
  for (const dictionarySource of [enSource, esSource, frSource]) {
    assert.match(dictionarySource, /backToHome:/);
    assert.match(dictionarySource, /passwordRecovery:/);
    assert.match(dictionarySource, /emailValidation:/);
    assert.match(dictionarySource, /twoFactor:/);
    assert.match(dictionarySource, /registration:/);
  }
});
