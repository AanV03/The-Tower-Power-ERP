# Balanced Workflow and Automatic Hero Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Balance the workflow heading, remove click-to-scroll behavior from the application boxes, and rotate the localized hero chart every five seconds with accessible pause and manual-selection behavior.

**Architecture:** Keep the landing layout changes in the localized server page and keep all chart interaction state inside the existing client-side `Hero` component. Reuse the existing `activeOperation` state and a stable operation-order constant; a single timeout advances the index, while independent hover and focus-within state control whether the timeout is scheduled.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Node test runner.

## Global Constraints

- Keep all user-facing labels in the existing Spanish, English, and French dictionaries.
- Preserve the current application boxes, module cards, chart data, theme behavior, navigation, and responsive design.
- Disable automatic chart rotation for `prefers-reduced-motion` users.
- Do not add a carousel dependency or a second localization system.
- Do not commit or push any changes.

---

### Task 1: Non-Navigating Application Boxes and Balanced Heading

**Files:**
- Modify: `scripts/module-localization.test.mjs`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `dictionary.landing.*` and `appPills` from the existing localized landing page.
- Produces: A non-interactive application grid and a responsive workflow heading layout with unchanged localized copy.

- [ ] **Step 1: Write the failing source regression test**

Add a test that reads `app/[locale]/page.tsx`, rejects `href="#modules"`, requires semantic articles for `appPills`, and requires the workflow heading to use balanced wrapping:

```js
test("landing application boxes do not navigate and workflow title is balanced", async () => {
  const source = await readFile(
    new URL("../app/[locale]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /href="#modules"/);
  assert.match(source, /appPills\.map[\s\S]*<article/);
  assert.match(source, /text-balance/);
  assert.match(source, /lg:grid-cols-\[1\.1fr_0\.9fr\]/);
});
```

- [ ] **Step 2: Run the localization test and verify the new assertion fails**

Run: `pnpm test:localization`

Expected: FAIL because the application boxes are anchors and the workflow header still uses `lg:grid-cols-[0.9fr_1.1fr]` without `text-balance`.

- [ ] **Step 3: Replace link semantics and rebalance the workflow header**

In `app/[locale]/page.tsx`, replace each application-box `<a href="#modules">` with an `<article>` and remove navigation-specific `group-hover` styles. Preserve icons, localized labels, dimensions, colors, and grid behavior.

Update the workflow header container to use `lg:grid-cols-[1.1fr_0.9fr] lg:items-center`, and update its title to a controlled responsive scale with balanced wrapping:

```tsx
<h2 className="max-w-[12ch] text-balance text-[clamp(2.25rem,6vw,4rem)] font-black uppercase leading-[0.98] tracking-normal text-[var(--landing-text)] lg:text-[clamp(3rem,4.5vw,4.25rem)]">
  {dictionary.landing.chooseWorkflowTitle}
</h2>
```

Keep the description in the second column with its existing localized dictionary value.

- [ ] **Step 4: Run the focused regression test**

Run: `pnpm test:localization`

Expected: PASS, including the new non-navigation and balanced-heading test.

---

### Task 2: Accessible Automatic Hero Chart Rotation

**Files:**
- Modify: `scripts/module-localization.test.mjs`
- Modify: `components/Hero/index.tsx`

**Interfaces:**
- Consumes: `OperationId`, the ordered `operations` array, `activeOperation`, and `useReducedMotion()`.
- Produces: `HERO_ROTATION_INTERVAL_MS`, `operationOrder`, independent hover/focus pause state, and `selectOperation(id: OperationId)`; automatic selection advances without scrolling or moving focus.

- [ ] **Step 1: Extend the hero regression test with timer and accessibility requirements**

Add assertions to the existing `hero operation buttons control the localized chart` test:

```js
assert.match(source, /const HERO_ROTATION_INTERVAL_MS = 5_000/);
assert.match(source, /setTimeout\([\s\S]*HERO_ROTATION_INTERVAL_MS/);
assert.match(source, /shouldReduceMotion \|\| isOperationPanelHovered \|\| isOperationPanelFocused/);
assert.match(source, /onMouseEnter=\{\(\) => setIsOperationPanelHovered\(true\)\}/);
assert.match(source, /onMouseLeave=\{\(\) => setIsOperationPanelHovered\(false\)\}/);
assert.match(source, /onFocusCapture=\{\(\) => setIsOperationPanelFocused\(true\)\}/);
assert.match(source, /onBlurCapture=\{handleOperationPanelBlur\}/);
assert.match(source, /onClick=\{\(\) => selectOperation\(id\)\}/);
```

- [ ] **Step 2: Run the localization test and verify the timer assertions fail**

Run: `pnpm test:localization`

Expected: FAIL because the hero does not yet declare or schedule the five-second rotation.

- [ ] **Step 3: Add pause state and a resettable selection sequence**

In `components/Hero/index.tsx`, add the constant and state:

```tsx
const HERO_ROTATION_INTERVAL_MS = 5_000;
const operationOrder: OperationId[] = ["memberships", "pos", "dashboard", "access"];

const [activeOperation, setActiveOperation] = useState<OperationId>("pos");
const [isOperationPanelHovered, setIsOperationPanelHovered] = useState(false);
const [isOperationPanelFocused, setIsOperationPanelFocused] = useState(false);
const [rotationRestartKey, setRotationRestartKey] = useState(0);

const selectOperation = (id: OperationId) => {
  setActiveOperation(id);
  setRotationRestartKey((key) => key + 1);
};
```

Schedule one timeout at a time after `selectedOperation` is available:

```tsx
useEffect(() => {
  if (shouldReduceMotion || isOperationPanelHovered || isOperationPanelFocused) return;

  const timeoutId = window.setTimeout(() => {
    setActiveOperation((current) => {
      const currentIndex = operationOrder.indexOf(current);
      return operationOrder[(currentIndex + 1) % operationOrder.length];
    });
  }, HERO_ROTATION_INTERVAL_MS);

  return () => window.clearTimeout(timeoutId);
}, [activeOperation, isOperationPanelFocused, isOperationPanelHovered, rotationRestartKey, shouldReduceMotion]);
```

- [ ] **Step 4: Pause the timer for hover and focus without trapping focus**

Add a blur handler that only resumes when focus leaves the entire dashboard container:

```tsx
const handleOperationPanelBlur = (event: React.FocusEvent<HTMLDivElement>) => {
  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
    setIsOperationPanelFocused(false);
  }
};
```

Attach the following handlers to the hero operations dashboard wrapper:

```tsx
onMouseEnter={() => setIsOperationPanelHovered(true)}
onMouseLeave={() => setIsOperationPanelHovered(false)}
onFocusCapture={() => setIsOperationPanelFocused(true)}
onBlurCapture={handleOperationPanelBlur}
```

Change each card click to `onClick={() => selectOperation(id)}`. Keep `aria-pressed`, the live region, the localized title, and the existing Framer Motion bar animation unchanged.

- [ ] **Step 5: Run focused tests and type checking**

Run: `pnpm test:localization`

Expected: PASS with the timer, pause/resume, manual reset, reduced-motion, and localization assertions.

Run: `pnpm typecheck`

Expected: PASS with no React event or timeout type errors.

---

### Task 3: Full Validation and Visual Verification

**Files:**
- Verify: `app/[locale]/page.tsx`
- Verify: `components/Hero/index.tsx`
- Verify: `scripts/module-localization.test.mjs`

**Interfaces:**
- Consumes: The completed landing layout and hero behavior.
- Produces: Evidence that localization, quality checks, build, and browser behavior remain correct.

- [ ] **Step 1: Run all relevant automated checks**

Run, in order:

```powershell
pnpm test:localization
pnpm lint
pnpm typecheck
pnpm build
```

Expected: Every command exits with code 0. The localization suite reports all tests passing, lint reports no errors, TypeScript reports no errors, and Next.js completes a production build.

- [ ] **Step 2: Verify the page in a browser at desktop and mobile widths**

Start the existing development server with `pnpm dev` if no local server is running. Verify `/en`, `/es`, and `/fr`:

- The workflow heading is visually balanced without clipping.
- The nine application boxes do not scroll or navigate when clicked.
- The hero begins on Point of Sale and advances every five seconds.
- Manual card selection updates the graph immediately and gives a full five seconds before the next change.
- Hovering or focusing inside the operations dashboard pauses rotation; leaving resumes it.
- Changing locale updates all affected labels and stays on the same localized landing route.
- Mobile layout remains readable and does not overflow.

- [ ] **Step 3: Review the final diff without committing**

Run: `git -c safe.directory='C:/Users/MaxUwU/OneDrive/Documents/School/a4/The-Tower-Power-ERP' diff -- app/[locale]/page.tsx components/Hero/index.tsx scripts/module-localization.test.mjs docs/superpowers/specs/2026-07-15-balanced-workflow-auto-hero-design.md docs/superpowers/plans/2026-07-15-balanced-workflow-auto-hero.md`

Expected: The diff contains only the approved layout, non-navigation, timer, tests, and uncommitted documentation changes.
