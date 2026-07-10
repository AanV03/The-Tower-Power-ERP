# Landing Mega Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an animated Framer Motion mega menu in the public landing navbar and add public informational module landing pages.

**Architecture:** Centralize module/category content in `lib/modules.ts`, render it through a landing-only `MegaMenu`, and use a reusable module page template for `app/[locale]/modules/[slug]/page.tsx`. The dashboard navigation, auth logic, and dashboard personalization remain untouched.

**Tech Stack:** Next.js App Router, React, TypeScript, Framer Motion, Tailwind utility classes, Node test runner for static regression checks.

## Global Constraints

- Public marketing pages only; do not connect to dashboard functionality.
- Route structure: `app/[locale]/modules/[slug]/page.tsx`.
- Mega menu uses Framer Motion, `AnimatePresence`, spring dropdown animation, staggered column/item reveals, hover/focus desktop behavior, mobile accordion behavior, Escape/outside-click/menu-item close.
- Pages respect existing light/dark landing palette.
- Do not touch dashboard/sidebar navigation, auth logic, or dashboard personalization.

---

### Task 1: Central Module Data And Regression Test

**Files:**
- Create: `lib/modules.ts`
- Modify: `scripts/landing-theme.test.mjs`

**Interfaces:**
- Produces: `megaMenuSections`, `modules`, `getModuleBySlug(slug: string)`, `type ModuleItem`, `type ModuleSection`.

- [ ] Add static regression checks that assert `lib/modules.ts` exports all requested slugs and the locale route file exists.
- [ ] Add `lib/modules.ts` with all categories, item labels, slugs, descriptions, and features.
- [ ] Run `node --test scripts/landing-theme.test.mjs`.

### Task 2: Mega Menu Component

**Files:**
- Create: `components/landing/mega-menu.tsx`
- Modify: `components/landing/landing-navbar.tsx`

**Interfaces:**
- Consumes: `megaMenuSections` from `lib/modules.ts`.
- Produces: `LandingMegaMenu` used by `LandingNavbar`.

- [ ] Add a client component with desktop hover/focus dropdown, sliding indicator, spring animation, staggered sections/items, outside-click and Escape close, and mobile accordion.
- [ ] Replace the navbar `Modules` anchor with `LandingMegaMenu` while preserving existing links and CTA.
- [ ] Run the static regression test.

### Task 3: Public Module Landing Pages

**Files:**
- Create: `components/landing/module-page-template.tsx`
- Create: `app/[locale]/modules/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getModuleBySlug`, `modules`, and `locales`.

- [ ] Add a reusable landing page template with hero, title, description, screenshot placeholder, feature cards, CTA to `/register`, and back links.
- [ ] Add localized dynamic route with `generateStaticParams`, slug lookup, and `notFound()`.
- [ ] Run `node --test scripts/landing-theme.test.mjs` and `pnpm run typecheck`.

### Self-Review

- Covers all requested menu sections and slugs.
- Keeps feature scope public/marketing only.
- Leaves dashboard/sidebar/auth logic untouched.
- Uses existing landing theme tokens and Framer Motion dependency.
