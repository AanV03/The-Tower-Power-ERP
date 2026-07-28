# Landing Theme Toggle and Legal Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact persistent light/dark toggle to the landing navbar and localize Privacy, Terms, and Security in Spanish, English, and French.

**Architecture:** Reuse the existing `next-themes` provider and animated toggle, adding only a landing presentation option. Store legal document content in the existing locale dictionaries and have each localized route select its document from `getDictionary(locale)` before rendering the shared `LegalPage`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-themes, Node test runner, existing `lib/i18n` dictionaries.

## Global Constraints

- Reuse the existing theme and localization systems.
- Do not introduce Spanish fallback strings in components.
- Preserve responsive landing navigation behavior.
- Do not commit or push changes.

---

### Task 1: Add failing regressions

**Files:**
- Modify: `scripts/module-localization.test.mjs`
- Test: `scripts/module-localization.test.mjs`

**Interfaces:**
- Consumes: `dashboardModuleDictionaries` and source files through `readFile`.
- Produces: Regression assertions for legal dictionaries, localized route data flow, and landing theme control placement.

- [ ] **Step 1: Add the failing tests**

```js
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
    const source = await readFile(new URL(`../app/[locale]/legal/${page}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, /getDictionary\(locale\)/);
    assert.doesNotMatch(source, /title="(?:Privacy Policy|Terms of Service|Security)"/);
  }
});

test("landing navbar includes the localized theme toggle", async () => {
  const source = await readFile(new URL("../components/landing/landing-navbar.tsx", import.meta.url), "utf8");
  assert.match(source, /<ThemeToggle locale=\{locale\} appearance="landing"/);
});
```

- [ ] **Step 2: Verify the regression fails**

Run: `pnpm test:localization`

Expected: FAIL because `legal` does not exist and `LandingNavbar` does not render `ThemeToggle`.

---

### Task 2: Add the compact landing theme toggle

**Files:**
- Modify: `components/layout/theme-toggle.tsx`
- Modify: `components/landing/landing-navbar.tsx`

**Interfaces:**
- Consumes: `locale: Locale`, existing `AnimatedThemeToggler`, and `dictionary.common.theme`.
- Produces: `ThemeToggle({ locale, appearance?: "dashboard" | "landing" })`.

- [ ] **Step 1: Add landing presentation support**

```tsx
export function ThemeToggle({
  locale = "es",
  appearance = "dashboard",
}: {
  locale?: Locale;
  appearance?: "dashboard" | "landing";
} = {}) {
  const dictionary = getDictionary(locale);
  return (
    <AnimatedThemeToggler
      variant="square"
      duration={450}
      aria-label={dictionary.common.theme}
      title={dictionary.common.theme}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-none text-sm [&_svg]:size-4",
        appearance === "landing"
          ? "border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] text-[var(--landing-text)] hover:border-[color:var(--landing-accent-strong)] hover:text-[var(--landing-accent-strong)]"
          : "topbar-icon-button sm:size-10",
      )}
    />
  );
}
```

- [ ] **Step 2: Render it beside the locale selector**

```tsx
<ThemeToggle locale={locale} appearance="landing" />
<LocaleSwitcher locale={locale} inHeader />
```

- [ ] **Step 3: Run the focused test**

Run: `pnpm test:localization`

Expected: Theme-toggle assertion passes; legal assertions remain red.

---

### Task 3: Localize legal documents through the dictionaries

**Files:**
- Modify: `lib/i18n/dashboard-modules.ts`
- Modify: `components/landing/legal-page.tsx`
- Modify: `app/[locale]/legal/privacy/page.tsx`
- Modify: `app/[locale]/legal/terms/page.tsx`
- Modify: `app/[locale]/legal/security/page.tsx`

**Interfaces:**
- Consumes: `getDictionary(locale).legal`.
- Produces: Matching `legal.common`, `legal.privacy`, `legal.terms`, and `legal.security` shapes in every locale.

- [ ] **Step 1: Add matching dictionary shapes**

```ts
legal: {
  common: { lastUpdated: string },
  privacy: { eyebrow: string, title: string, updatedAt: string, intro: string, metadataDescription: string, sections: readonly { title: string, copy: string }[] },
  terms: { eyebrow: string, title: string, updatedAt: string, intro: string, metadataDescription: string, sections: readonly { title: string, copy: string }[] },
  security: { eyebrow: string, title: string, updatedAt: string, intro: string, metadataDescription: string, sections: readonly { title: string, copy: string }[] },
}
```

Populate all fields with natural Spanish, English, and French translations of the current five sections per document. Use localized dates: `11 de julio de 2026`, `July 11, 2026`, and `11 juillet 2026`.

- [ ] **Step 2: Localize the shared updated label**

```tsx
type LegalPageProps = {
  document: Dictionary["legal"]["privacy"];
  lastUpdatedLabel: string;
  locale: Locale;
};

<p>{lastUpdatedLabel}: {document.updatedAt}</p>
```

- [ ] **Step 3: Replace route-local English content**

```tsx
const document = getDictionary(locale).legal.privacy;
return <LegalPage locale={locale} document={document} lastUpdatedLabel={getDictionary(locale).legal.common.lastUpdated} />;
```

Use `terms` and `security` in their corresponding routes. Export `generateMetadata({ params })` to return localized titles and descriptions from the same document.

- [ ] **Step 4: Verify the focused regression passes**

Run: `pnpm test:localization`

Expected: PASS with all localization and landing-theme assertions green.

---

### Task 4: Full verification

**Files:**
- Verify all files from Tasks 1–3.

**Interfaces:**
- Consumes: Completed implementation.
- Produces: Evidence that localization, types, lint, navigation, and production generation remain valid.

- [ ] **Step 1: Run localization and navigation tests**

Run: `pnpm test:localization` and `pnpm test:api`

Expected: All tests pass.

- [ ] **Step 2: Run static validation**

Run: `pnpm typecheck` and `pnpm lint`

Expected: Exit code 0; only previously documented unrelated warnings may remain.

- [ ] **Step 3: Run the production build**

Run: `pnpm build`

Expected: Exit code 0 and localized static legal routes generated for `es`, `en`, and `fr`.

- [ ] **Step 4: Review the final diff without committing**

Run: `git diff --check` and `git status --short`

Expected: No whitespace errors and no unrelated files changed.
