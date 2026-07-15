# Landing Circle Theme Reveal and Interactive Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the landing theme selector a button-origin circular reveal and make the four localized hero operation cards update an animated bar chart.

**Architecture:** Reuse the existing `AnimatedThemeToggler` circle clip-path and choose its variant from `ThemeToggle` based on landing versus dashboard appearance. Keep hero interaction local to `Hero`: a typed operation configuration supplies localized chart titles and static datasets, while one selected identifier controls card state and Framer Motion bars.

**Tech Stack:** React 19, TypeScript, Framer Motion 12, next-themes, Node test runner, Tailwind CSS.

## Global Constraints

- Apply the circle reveal only to the landing navbar selector.
- Preserve the dashboard square reveal and existing theme persistence.
- Remove the rejected theme-curtain implementation completely.
- Localize all four chart titles in Spanish, English, and French through existing dictionaries.
- Use native buttons with `aria-pressed` for hero selection.
- Respect reduced-motion preferences.
- Add no chart dependency.
- Do not commit or push any changes.

---

### Task 1: Define failing regressions for the corrected behavior

**Files:**
- Modify: `scripts/module-localization.test.mjs`

**Interfaces:**
- Consumes: source for `LandingNavbar`, `ThemeToggle`, `AnimatedThemeToggler`, `Hero`, and the three locale dictionaries.
- Produces: regression assertions for the landing circle, removal of curtain code, localized chart titles, and selectable chart behavior.

- [ ] **Step 1: Replace curtain assertions with circle-reveal assertions**

```js
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
```

- [ ] **Step 2: Add dictionary and hero interaction assertions**

```js
test("hero operation charts expose localized metric titles", () => {
  assert.deepEqual(
    {
      memberships: dictionaries.es.landing.ops.renewalsHour,
      pos: dictionaries.es.landing.ops.revenueHour,
      dashboard: dictionaries.es.landing.ops.occupancyHour,
      access: dictionaries.es.landing.ops.accessHour,
    },
    {
      memberships: "Renovaciones por hora",
      pos: "Ingresos por hora",
      dashboard: "Ocupación por hora",
      access: "Accesos por hora",
    },
  );
  assert.equal(dictionaries.en.landing.ops.renewalsHour, "Renewals by hour");
  assert.equal(dictionaries.en.landing.ops.occupancyHour, "Occupancy by hour");
  assert.equal(dictionaries.en.landing.ops.accessHour, "Check-ins by hour");
  assert.equal(dictionaries.fr.landing.ops.renewalsHour, "Renouvellements par heure");
  assert.equal(dictionaries.fr.landing.ops.occupancyHour, "Occupation par heure");
  assert.equal(dictionaries.fr.landing.ops.accessHour, "Accès par heure");
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
```

- [ ] **Step 3: Run the localization suite and verify RED**

Run `pnpm test:localization`.

Expected: FAIL because curtain mode still exists, circle selection is not appearance-based, hero dictionaries lack three titles, and hero cards are static.

---

### Task 2: Correct the landing theme reveal

**Files:**
- Modify: `components/landing/landing-navbar.tsx`
- Modify: `components/layout/theme-toggle.tsx`
- Modify: `components/ui/animated-theme-toggler.tsx`

**Interfaces:**
- Consumes: `appearance?: "dashboard" | "landing"`.
- Produces: `variant="circle"` for landing and `variant="square"` for dashboard, with no curtain API.

- [ ] **Step 1: Remove the curtain opt-in from the navbar**

```tsx
<ThemeToggle locale={locale} appearance="landing" />
```

- [ ] **Step 2: Select the clip-path variant by appearance**

Remove the `transition` argument/type/forwarding from `ThemeToggle`, then render:

```tsx
<AnimatedThemeToggler
  variant={appearance === "landing" ? "circle" : "square"}
  duration={450}
```

- [ ] **Step 3: Remove curtain state and overlay from `AnimatedThemeToggler`**

Restore imports to:

```tsx
import { useCallback, useRef } from "react"
```

Delete `ThemeTransition`, `CurtainPhase`, all curtain constants, the `transition` prop, curtain state/timers/effects/callback, the curtain branch in `toggleTheme`, and the Framer Motion overlay. Retain the memoized `applyTheme` callback and existing button-origin View Transition calculations. Return the native button directly:

```tsx
return (
  <button
    type="button"
    ref={buttonRef}
    onClick={toggleTheme}
    className={cn(className)}
    {...props}
  >
    {isDark ? <Sun /> : <Moon />}
    <span className="sr-only">Toggle theme</span>
  </button>
)
```

Update `toggleTheme` dependencies to:

```tsx
[applyTheme, duration, fromCenter, shape]
```

- [ ] **Step 4: Run `pnpm test:localization`**

Expected: circle assertions pass; hero assertions remain red until Task 3.

---

### Task 3: Add localized selectable hero chart data

**Files:**
- Modify: `lib/i18n/es.ts`
- Modify: `lib/i18n/en.ts`
- Modify: `lib/i18n/fr.ts`
- Modify: `components/Hero/index.tsx`

**Interfaces:**
- Consumes: `dictionary.landing.ops.{renewalsHour,revenueHour,occupancyHour,accessHour}`.
- Produces: `OperationId`, selected-operation state, accessible operation buttons, and selected chart rendering.

- [ ] **Step 1: Add localized dictionary keys**

Add beside `revenueHour`:

```ts
// es
renewalsHour: "Renovaciones por hora",
occupancyHour: "Ocupación por hora",
accessHour: "Accesos por hora",

// en
renewalsHour: "Renewals by hour",
occupancyHour: "Occupancy by hour",
accessHour: "Check-ins by hour",

// fr
renewalsHour: "Renouvellements par heure",
occupancyHour: "Occupation par heure",
accessHour: "Accès par heure",
```

- [ ] **Step 2: Define hero operation IDs and datasets**

Import `useReducedMotion` and `cn`, remove the unused module-level `heroStats` and `operations`, and add:

```tsx
import { animate, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type OperationId = "memberships" | "pos" | "dashboard" | "access";

const operationChartValues: Record<OperationId, number[]> = {
  memberships: [44, 62, 55, 73, 66, 82, 70, 91, 78, 86, 68, 80],
  pos: [38, 54, 46, 72, 58, 88, 66, 94, 81, 70, 92, 76],
  dashboard: [52, 61, 74, 83, 89, 94, 90, 85, 78, 69, 58, 47],
  access: [35, 48, 72, 88, 67, 93, 76, 84, 96, 71, 63, 50],
};
```

Inside `Hero`, initialize:

```tsx
const [activeOperation, setActiveOperation] = useState<OperationId>("pos");
const shouldReduceMotion = useReducedMotion();
```

- [ ] **Step 3: Attach localized chart data to each operation**

```tsx
const operations = [
  {
    id: "memberships" as const,
    icon: Users,
    label: dictionary.modules.memberships,
    value: dictionary.landing.ops.renewalsQueued,
    chartTitle: dictionary.landing.ops.renewalsHour,
    chartValues: operationChartValues.memberships,
  },
  {
    id: "pos" as const,
    icon: CreditCard,
    label: dictionary.modules.pos,
    value: dictionary.landing.ops.salesSynced,
    chartTitle: dictionary.landing.ops.revenueHour,
    chartValues: operationChartValues.pos,
  },
  {
    id: "dashboard" as const,
    icon: CalendarClock,
    label: dictionary.common.dashboard,
    value: dictionary.landing.ops.occupancy,
    chartTitle: dictionary.landing.ops.occupancyHour,
    chartValues: operationChartValues.dashboard,
  },
  {
    id: "access" as const,
    icon: ShieldCheck,
    label: dictionary.modules.access,
    value: dictionary.landing.ops.devicesOnline,
    chartTitle: dictionary.landing.ops.accessHour,
    chartValues: operationChartValues.access,
  },
];

const selectedOperation =
  operations.find(({ id }) => id === activeOperation) ?? operations[1];
```

- [ ] **Step 4: Convert cards to accessible selection buttons**

Map each operation as a button:

```tsx
{operations.map(({ id, icon: Icon, label, value }) => (
  <button
    key={id}
    type="button"
    aria-pressed={activeOperation === id}
    onClick={() => setActiveOperation(id)}
    className={cn(
      "border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent-strong)]",
      activeOperation === id
        ? "border-[color:var(--landing-accent-strong)] bg-[var(--landing-panel-hover)] shadow-[inset_0_0_0_1px_var(--landing-accent-strong)]"
        : "border-[color:var(--landing-border)] bg-white/[0.04] hover:border-[color:var(--landing-accent-strong)]/70",
    )}
  >
    <Icon className="mb-4 h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
    <p className="text-sm font-bold text-[var(--landing-text)]">{label}</p>
    <p className="mt-1 text-sm text-[var(--landing-copy)]">{value}</p>
  </button>
))}
```

- [ ] **Step 5: Render selected localized chart title and bars**

Give the chart wrapper `role="region"`, `aria-labelledby="hero-operation-chart-title"`, and `aria-live="polite"`. Render:

```tsx
<motion.span
  id="hero-operation-chart-title"
  key={selectedOperation.id}
  initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
  animate={{ opacity: 1, y: 0 }}
>
  {selectedOperation.chartTitle}
</motion.span>
```

Replace the fixed array with:

```tsx
{selectedOperation.chartValues.map((height, index) => (
  <motion.div
    key={`${selectedOperation.id}-${index}`}
    aria-hidden="true"
    className="origin-bottom flex-1 bg-[var(--landing-accent-strong)]"
    initial={shouldReduceMotion ? false : { scaleY: 0, opacity: 0.45 }}
    animate={{ scaleY: 1, opacity: 1 }}
    transition={
      shouldReduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 180, damping: 22, delay: index * 0.045 }
    }
    style={{ height: `${height}%` }}
  />
))}
```

- [ ] **Step 6: Run focused verification**

Run `pnpm test:localization` and `pnpm typecheck`.

Expected: both exit `0`; localization suite has all circle and interactive-hero regressions green.

---

### Task 4: Full verification

**Files:**
- Verify only.

**Interfaces:**
- Consumes: completed corrected theme and hero interactions.
- Produces: fresh repository-health evidence.

- [ ] **Step 1: Run regression and static checks**

Run:

```powershell
pnpm test:localization
pnpm test:api
pnpm typecheck
pnpm lint
```

Expected: every command exits `0`; only unrelated pre-existing warnings may remain.

- [ ] **Step 2: Run the production build**

Run `pnpm build`.

Expected: exit `0` and all localized landing routes generate successfully.

- [ ] **Step 3: Audit the patch**

Run `git diff --check` and focused source searches for `transition="curtain"`, `curtainPanels`, localized chart keys, `aria-pressed`, and selected chart rendering.

Expected: no theme-curtain implementation remains, only the landing selector uses the circle variant, all chart locales and interaction markers exist, and no whitespace errors are introduced.
