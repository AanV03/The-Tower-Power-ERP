# Public Operations, Contact, and Screenshot Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public module screenshot readable at full width and add localized Operations and Contact pages reached through real navbar routes.

**Architecture:** Extend the canonical module records with exact image dimensions, render a full-width intrinsic-ratio preview, and isolate fullscreen behavior in a client-side dialog component. Add server-rendered Operations and Contact shells, a small client contact form backed by a pure validation function, and route-based desktop/mobile navigation.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Next.js `Image`, Tailwind CSS, Node test runner.

## Global Constraints

- Support exactly `es`, `en`, and `fr` through the existing `Locale` and dictionary system.
- Keep all 15 existing module slugs, screenshots, highlight content, and metadata.
- Do not crop or distort screenshots.
- Do not add a contact API, email provider, database write, or claim that a message was delivered.
- Preserve landing theme tokens, navbar route transition, footer, and reduced-motion behavior.
- Leave dashboard routes, authentication, registration, and `pnpm-workspace.yaml` unchanged.

## File Structure

- `lib/modules.ts`: add exact source image dimensions to each module definition and resolved item.
- `components/landing/module-screenshot.tsx`: full-width preview and accessible fullscreen dialog.
- `components/landing/module-page-template.tsx`: compact text hero followed by the shared screenshot component.
- `lib/contact-form.ts`: pure form values, errors, and validation.
- `components/landing/contact-form.tsx`: client form state and local success/reset flow.
- `components/landing/operations-page.tsx`: localized public operations content.
- `components/landing/contact-page.tsx`: localized contact content and form shell.
- `components/landing/mobile-public-menu.tsx`: compact mobile Operations/Contact navigation.
- `components/landing/landing-navbar.tsx`: real route links and no hash-scroll curtain logic.
- `app/[locale]/operations/page.tsx`, `app/[locale]/contact/page.tsx`: locale guards and metadata.
- `lib/i18n/en.ts`, `lib/i18n/es.ts`, `lib/i18n/fr.ts`: all new copy.
- `scripts/landing-theme.test.mjs`, `scripts/public-contact.test.mjs`: static integration and real validation tests.

---

### Task 1: Full-Width Intrinsic-Ratio Module Screenshots

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Modify: `lib/modules.ts`
- Create: `components/landing/module-screenshot.tsx`
- Modify: `components/landing/module-page-template.tsx`

**Interfaces:**
- Produces: `ModuleItem.imageWidth`, `ModuleItem.imageHeight`, and `ModuleScreenshot({ module, expandLabel, closeLabel })`.

- [ ] **Step 1: Add failing screenshot-layout tests**

Add `moduleScreenshotSource` to the existing source reads and add:

```js
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
  assert.match(moduleScreenshotSource, /triggerRef\.current\?\.focus\(\)/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="module screenshots" scripts/landing-theme.test.mjs`

Expected: FAIL because the current template uses a half-width fixed-height image box and has no dialog.

- [ ] **Step 3: Add exact intrinsic dimensions to the catalog**

Add `imageWidth: number` and `imageHeight: number` to `ModuleItem` and `ModuleDefinition`. Update `LocalizedModuleContent` to omit `"slug" | "category" | "imageSrc" | "imageWidth" | "imageHeight"` because dimensions live on the definition, and copy both fields in `resolveModule`.

Use these exact source dimensions:

```ts
const imageDimensions = {
  "panel-operativo": [1850, 957],
  "punto-de-venta": [1860, 948],
  suscripciones: [1868, 947],
  acceso: [1868, 955],
  catalogo: [1864, 905],
  compras: [1863, 914],
  almacenes: [1864, 840],
  inventario: [1868, 809],
  finanzas: [1860, 820],
  contabilidad: [1861, 904],
  "rh-y-nomina": [1862, 814],
  nomina: [1867, 850],
  especialistas: [1868, 798],
  marketing: [1772, 861],
  analytics: [1767, 805],
} as const;
```

Resolve the tuple through this helper and spread it into every matching definition:

```ts
function dimensions(slug: keyof typeof imageDimensions) {
  const [imageWidth, imageHeight] = imageDimensions[slug];
  return { imageWidth, imageHeight };
}

// Example definition fields
slug: "punto-de-venta",
imageSrc: "/POS.png",
...dimensions("punto-de-venta"),
```

Use the definition's own slug in all 15 spreads so the rendered aspect ratio matches its source file.

- [ ] **Step 4: Implement `ModuleScreenshot`**

Create a `"use client"` component with this public interface:

```ts
type ModuleScreenshotProps = {
  module: Pick<ModuleItem, "label" | "imageSrc" | "imageAlt" | "imageWidth" | "imageHeight">;
  expandLabel: string;
  closeLabel: string;
};
```

The preview button contains:

```tsx
<Image
  src={module.imageSrc}
  alt={module.imageAlt}
  width={module.imageWidth}
  height={module.imageHeight}
  sizes="(min-width: 1280px) 1280px, 100vw"
  className="h-auto w-full"
  priority
/>
```

Use `useState(false)`, a trigger ref, and an effect that attaches `keydown`, stores/restores `document.body.style.overflow`, and restores trigger focus on close. Render the open state as a fixed backdrop with `role="dialog"`, `aria-modal="true"`, `aria-label={module.label}`, a localized close button, and the same intrinsic-ratio image using `object-contain max-h-[calc(100svh-6rem)] w-auto max-w-full`.

- [ ] **Step 5: Restructure the shared module hero**

Replace the two-column grid with a compact `max-w-4xl` text block inside the hero. Render `ModuleScreenshot` in a separate `max-w-7xl` block directly below the text, with one border and `p-2 sm:p-3`. Pass `dictionary.landing.modulePage.expandScreenshot` and `closeScreenshot`.

- [ ] **Step 6: Run focused tests and type checking**

Run: `node --test --test-name-pattern="module screenshots|public module template" scripts/landing-theme.test.mjs`

Expected: PASS.

Run: `pnpm run typecheck`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add scripts/landing-theme.test.mjs lib/modules.ts components/landing/module-screenshot.tsx components/landing/module-page-template.tsx lib/i18n/en.ts lib/i18n/es.ts lib/i18n/fr.ts
git commit -m "fix: present module screenshots at full width"
```

---

### Task 2: Localized Operations Page

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Modify: `lib/i18n/en.ts`
- Modify: `lib/i18n/es.ts`
- Modify: `lib/i18n/fr.ts`
- Create: `components/landing/operations-page.tsx`
- Create: `app/[locale]/operations/page.tsx`

**Interfaces:**
- Produces: `dictionary.landing.operationsPage` and `OperationsPage({ locale })`.

- [ ] **Step 1: Add failing route and content tests**

```js
test("localized public operations page exists", async () => {
  await access(new URL("../app/[locale]/operations/page.tsx", import.meta.url));
  assert.match(operationsPageSource, /dictionary\.landing\.operationsPage/);
  assert.match(operationsRouteSource, /if \(!isLocale\(locale\)\)/);
  assert.match(operationsRouteSource, /generateMetadata/);
  assert.match(operationsPageSource, /moduleLinks\.map/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="public operations" scripts/landing-theme.test.mjs`

Expected: FAIL because the files do not exist.

- [ ] **Step 3: Add exact localized operations dictionary shape**

Add `landing.operationsPage` in every dictionary with:

```ts
{
  metadataTitle: string,
  metadataDescription: string,
  eyebrow: string,
  title: string,
  description: string,
  pillarsEyebrow: string,
  pillarsTitle: string,
  pillars: Array<{ title: string; description: string }>,
  flowEyebrow: string,
  flowTitle: string,
  steps: Array<{ title: string; description: string }>,
  modulesEyebrow: string,
  modulesTitle: string,
  moduleAction: string,
}
```

Use this exact English semantic content and translate it naturally into Spanish and French without changing meaning:

```ts
{
  metadataTitle: "Operations | The Tower Power",
  metadataDescription: "See how The Tower Power connects daily gym operations across members, sales, staff, inventory, and finance.",
  eyebrow: "Connected gym operations",
  title: "Run every branch from one operating system",
  description: "The Tower Power keeps front desk activity, payments, access, staffing, stock, and financial oversight connected throughout the day.",
  pillarsEyebrow: "Operating pillars",
  pillarsTitle: "The work that keeps every location moving",
  pillars: [
    { title: "Members and access", description: "Keep membership status, renewals, check-ins, and entry permissions aligned." },
    { title: "Sales and billing", description: "Connect point-of-sale activity, recurring charges, invoices, refunds, and payments." },
    { title: "Staff and payroll", description: "Coordinate attendance, shifts, sessions, commissions, and payroll preparation." },
    { title: "Inventory and finance", description: "Track stock movements, purchasing, balances, and reporting across branches." },
  ],
  flowEyebrow: "Connected workflow",
  flowTitle: "From daily activity to a reconciled operation",
  steps: [
    { title: "Activity is captured", description: "Sales, check-ins, renewals, shifts, and stock movements enter the system where they happen." },
    { title: "Modules stay synchronized", description: "Related records update together so teams work from consistent operational information." },
    { title: "Managers reconcile and act", description: "Leaders review exceptions, compare branches, and make informed decisions from one view." },
  ],
  modulesEyebrow: "Explore the system",
  modulesTitle: "Open the modules behind the workflow",
  moduleAction: "Explore module",
}
```

- [ ] **Step 4: Implement the shared page and route**

`OperationsPage` is a server component using `LandingNavbar`, `LandingFooter`, `getDictionary(locale)`, and four stable module links:

```ts
const moduleLinks = [
  { slug: "suscripciones", labelIndex: 0 },
  { slug: "punto-de-venta", labelIndex: 1 },
  { slug: "rh-y-nomina", labelIndex: 2 },
  { slug: "finanzas", labelIndex: 3 },
] as const;
```

Resolve labels with `getModuleBySlug(slug, locale)`, link to `/${locale}/modules/${slug}`, and render hero, four-card pillars grid, numbered three-step flow, and module links. The route awaits `params`, calls `notFound()` for unsupported locales, exports localized `generateMetadata`, and renders `<OperationsPage locale={locale} />`.

- [ ] **Step 5: Run focused tests and type checking**

Run: `node --test --test-name-pattern="public operations" scripts/landing-theme.test.mjs`

Expected: PASS.

Run: `pnpm run typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add scripts/landing-theme.test.mjs lib/i18n/en.ts lib/i18n/es.ts lib/i18n/fr.ts components/landing/operations-page.tsx 'app/[locale]/operations/page.tsx'
git commit -m "feat: add localized operations page"
```

---

### Task 3: Validated Local Contact Page

**Files:**
- Create: `scripts/public-contact.test.mjs`
- Create: `lib/contact-form.ts`
- Modify: `lib/i18n/en.ts`
- Modify: `lib/i18n/es.ts`
- Modify: `lib/i18n/fr.ts`
- Create: `components/landing/contact-form.tsx`
- Create: `components/landing/contact-page.tsx`
- Create: `app/[locale]/contact/page.tsx`

**Interfaces:**
- Produces: `ContactFormValues`, `ContactFormErrors`, `validateContactForm(values)`, `dictionary.landing.contactPage`, and `ContactPage({ locale })`.

- [ ] **Step 1: Write real failing validation tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { validateContactForm } from "../lib/contact-form.ts";

test("contact form requires name, email, and message", () => {
  assert.deepEqual(validateContactForm({ name: "", email: "", company: "", message: "" }), {
    name: "required",
    email: "required",
    message: "required",
  });
});

test("contact form rejects invalid email and accepts valid values", () => {
  assert.equal(validateContactForm({ name: "Max", email: "invalid", company: "", message: "Hello there" }).email, "invalid");
  assert.deepEqual(validateContactForm({ name: "Max", email: "max@example.com", company: "Gym", message: "Hello there" }), {});
});
```

- [ ] **Step 2: Run validation tests and verify RED**

Run: `node --experimental-strip-types --test scripts/public-contact.test.mjs`

Expected: FAIL because `lib/contact-form.ts` does not exist.

- [ ] **Step 3: Implement the pure validator**

```ts
export type ContactFormValues = { name: string; email: string; company: string; message: string };
export type ContactFormErrors = Partial<Record<"name" | "email" | "message", "required" | "invalid">>;

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!values.name.trim()) errors.name = "required";
  if (!values.email.trim()) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "invalid";
  if (!values.message.trim()) errors.message = "required";
  return errors;
}
```

- [ ] **Step 4: Add localized contact dictionary content**

Add `landing.contactPage` in all three dictionaries. Use this exact English semantic content and translate it naturally into Spanish and French without changing the local-only delivery disclaimer:

```ts
{
  metadataTitle: "Contact | The Tower Power",
  metadataDescription: "Contact The Tower Power about product questions, support, or gym operations.",
  eyebrow: "Contact The Tower Power",
  title: "Tell us what your operation needs",
  description: "Share your question and the right team can help you explore the next step.",
  responseNote: "This demonstration form validates your message locally and does not send data to a server.",
  channels: [
    { title: "Support", description: "Help with product access and day-to-day use.", value: "support@thetowerpower.com" },
    { title: "Sales", description: "Questions about plans, branches, and rollout.", value: "sales@thetowerpower.com" },
    { title: "General", description: "Partnerships and other product questions.", value: "hello@thetowerpower.com" },
  ],
  form: {
    title: "Send a message",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    companyLabel: "Company or gym",
    companyPlaceholder: "Your organization",
    messageLabel: "Message",
    messagePlaceholder: "How can we help?",
    requiredError: "This field is required.",
    emailError: "Enter a valid email address.",
    submit: "Submit message",
    successTitle: "Message ready",
    successDescription: "Your message passed local validation. This demo did not send it to a server.",
    reset: "Write another message",
  },
}
```

- [ ] **Step 5: Implement form, shared page, and route**

`ContactForm` is a client component accepting `copy: Dictionary["landing"]["contactPage"]["form"]`. Keep controlled values and errors, call the pure validator on submit, focus the first invalid control, and show a `role="status"` success panel with reset action when valid. Do not call `fetch`.

`ContactPage` renders navbar, hero, demo notice, channel cards, form, and footer. The localized route follows the same `isLocale` guard and metadata pattern as Operations.

- [ ] **Step 6: Run tests and type checking**

Run: `node --experimental-strip-types --test scripts/public-contact.test.mjs`

Expected: 2 tests PASS.

Run: `pnpm run typecheck`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add scripts/public-contact.test.mjs lib/contact-form.ts lib/i18n/en.ts lib/i18n/es.ts lib/i18n/fr.ts components/landing/contact-form.tsx components/landing/contact-page.tsx 'app/[locale]/contact/page.tsx'
git commit -m "feat: add localized contact page"
```

---

### Task 4: Route-Based Desktop and Mobile Navbar

**Files:**
- Modify: `scripts/landing-theme.test.mjs`
- Create: `components/landing/mobile-public-menu.tsx`
- Modify: `components/landing/landing-navbar.tsx`

**Interfaces:**
- Consumes: localized Operations and Contact routes from Tasks 2–3.
- Produces: desktop route links and `MobilePublicMenu({ locale })`.

- [ ] **Step 1: Add failing navbar tests**

```js
test("landing navbar routes to operations and contact pages", () => {
  assert.match(navbarSource, /localizedPath\(locale, "operations"\)/);
  assert.match(navbarSource, /localizedPath\(locale, "contact"\)/);
  assert.doesNotMatch(navbarSource, /#operations|#contact/);
  assert.doesNotMatch(navbarSource, /handleSectionClick|curtainPhase/);
  assert.match(navbarSource, /<MobilePublicMenu locale=\{locale\}/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="navbar routes" scripts/landing-theme.test.mjs`

Expected: FAIL because the navbar still uses hash links and curtain-scroll state.

- [ ] **Step 3: Implement compact mobile public navigation**

Create a client dropdown with a `Menu` button, outside-click and Escape close, and two localized `Link` entries. Each route uses `localizedPath(locale, "operations")` or `localizedPath(locale, "contact")` and the existing `startRouteTransition` callback.

- [ ] **Step 4: Simplify desktop navbar routing**

Replace `navLinks` with route values, delete curtain constants/state/refs/effects and `handleSectionClick`, and render desktop items as Next `Link` elements using `handleRouteClick`. Add `<MobilePublicMenu locale={locale} />` next to the mobile module menu.

- [ ] **Step 5: Run tests and type checking**

Run: `node --test --test-name-pattern="navbar routes|landing navbar and mega menu" scripts/landing-theme.test.mjs`

Expected: PASS.

Run: `pnpm run typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add scripts/landing-theme.test.mjs components/landing/mobile-public-menu.tsx components/landing/landing-navbar.tsx
git commit -m "feat: route public navbar pages"
```

---

### Task 5: Full Verification

**Files:** Verify only.

- [ ] Run `node --test scripts/landing-theme.test.mjs` and expect all tests PASS.
- [ ] Run `node --experimental-strip-types --test scripts/public-contact.test.mjs` and expect 2 tests PASS.
- [ ] Run `pnpm run typecheck` and expect exit 0.
- [ ] Run `pnpm run lint` and record only pre-existing warnings outside changed files.
- [ ] Run `pnpm run build` and confirm static generation includes `/[locale]/operations`, `/[locale]/contact`, and all 45 module pages.
- [ ] Run `git diff --check` and `git status --short`; confirm only the preserved `pnpm-workspace.yaml` change remains outside the committed feature work.
