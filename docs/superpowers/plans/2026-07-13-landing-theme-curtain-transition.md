# Landing Theme Curtain Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the landing navbar theme selector with a seven-panel Framer Motion curtain while preserving the existing dashboard theme transition.

**Architecture:** Add an opt-in `transition="curtain"` mode to the existing shared theme-toggle path. `LandingNavbar` requests it, `ThemeToggle` forwards it, and `AnimatedThemeToggler` coordinates the cover, theme mutation, reveal, input lock, reduced-motion fallback, and unmount cleanup. The default mode continues to use the current View Transition implementation.

**Tech Stack:** React 19, TypeScript, Framer Motion 12, next-themes, Node test runner, Tailwind CSS.

## Global Constraints

- Apply the curtain only to the landing navbar theme selector.
- Use seven vertical panels wiping top-to-bottom and revealing toward the bottom.
- Change the theme only after the panels cover the viewport.
- Respect `prefers-reduced-motion: reduce` with an immediate theme change.
- Preserve localized accessible labels, styling, persistence, and dashboard behavior.
- Do not commit or push any changes.

---

### Task 1: Add landing-only curtain regression coverage

**Files:**
- Modify: `scripts/module-localization.test.mjs`

**Interfaces:**
- Consumes: `LandingNavbar`, `ThemeToggle`, and `AnimatedThemeToggler` source files.
- Produces: regression assertions defining the curtain opt-in and accessibility/motion requirements.

- [ ] **Step 1: Write the failing regression tests**

Extend the existing landing theme test and add a curtain implementation test:

```js
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
pnpm test:localization
```

Expected: FAIL because the landing selector does not pass `transition="curtain"` and the toggler does not contain the Framer Motion curtain lifecycle.

---

### Task 2: Implement the opt-in Framer Motion curtain

**Files:**
- Modify: `components/ui/animated-theme-toggler.tsx`
- Modify: `components/layout/theme-toggle.tsx`
- Modify: `components/landing/landing-navbar.tsx`

**Interfaces:**
- Consumes: `next-themes` `resolvedTheme`/`setTheme`, existing localized toggle props, and Framer Motion `motion`.
- Produces: `transition?: "default" | "curtain"` on both theme-toggle components.

- [ ] **Step 1: Add the curtain mode to `AnimatedThemeToggler`**

Add imports and constants:

```tsx
import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

const curtainPanels = Array.from({ length: 7 }, (_, index) => index)
const curtainDuration = 420
const curtainStagger = 45
const curtainCoverDelay =
  curtainDuration + (curtainPanels.length - 1) * curtainStagger + 90
const curtainRevealDelay = 140
const curtainResetDelay = 680

type ThemeTransition = "default" | "curtain"
type CurtainPhase = "idle" | "cover" | "reveal"
```

Extend the props and component arguments:

```tsx
interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  variant?: TransitionVariant
  fromCenter?: boolean
  transition?: ThemeTransition
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  variant,
  fromCenter = false,
  transition = "default",
  disabled,
  ...props
}: AnimatedThemeTogglerProps) => {
```

Create curtain state, timer cleanup, and the opt-in click path before the existing View Transition calculations:

```tsx
const [curtainPhase, setCurtainPhase] = useState<CurtainPhase>("idle")
const curtainTimersRef = useRef<number[]>([])

const clearCurtainTimers = useCallback(() => {
  curtainTimersRef.current.forEach((timer) => window.clearTimeout(timer))
  curtainTimersRef.current = []
}, [])

useEffect(() => clearCurtainTimers, [clearCurtainTimers])

const applyTheme = useCallback(() => {
  setTheme(isDark ? "light" : "dark")
}, [isDark, setTheme])

const runCurtainTransition = useCallback(() => {
  if (curtainPhase !== "idle") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyTheme()
    return
  }

  clearCurtainTimers()
  setCurtainPhase("cover")
  curtainTimersRef.current = [
    window.setTimeout(() => {
      applyTheme()
      setCurtainPhase("reveal")
    }, curtainCoverDelay),
    window.setTimeout(
      () => setCurtainPhase("idle"),
      curtainCoverDelay + curtainRevealDelay + curtainResetDelay,
    ),
  ]
}, [applyTheme, clearCurtainTimers, curtainPhase])
```

Remove the current inner `applyTheme` function from `toggleTheme`; both the curtain branch and the existing View Transition branch must use the memoized callback above.

At the start of `toggleTheme`, branch to the curtain lifecycle:

```tsx
if (transition === "curtain") {
  runCurtainTransition()
  return
}
```

Render the native button and decorative overlay as siblings:

```tsx
return (
  <>
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      disabled={disabled || curtainPhase !== "idle"}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>

    {curtainPhase !== "idle" ? (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[200] grid grid-cols-7"
      >
        {curtainPanels.map((panel) => (
          <motion.div
            key={panel}
            className="bg-[var(--landing-transition-bg,#025453)]"
            initial={{ scaleY: curtainPhase === "cover" ? 0 : 1 }}
            animate={{ scaleY: curtainPhase === "cover" ? 1 : 0 }}
            transition={{
              duration: curtainDuration / 1000,
              ease: [0.83, 0, 0.17, 1],
              delay: (panel * curtainStagger) / 1000,
            }}
            style={{ transformOrigin: curtainPhase === "cover" ? "top" : "bottom" }}
          />
        ))}
      </div>
    ) : null}
  </>
)
```

Keep the existing default View Transition branch intact and include all new callbacks/state in hook dependencies.

- [ ] **Step 2: Forward the mode through `ThemeToggle`**

Extend its props and forward the value:

```tsx
export function ThemeToggle({
  locale = "es",
  appearance = "dashboard",
  transition = "default",
}: {
  locale?: Locale;
  appearance?: "dashboard" | "landing";
  transition?: "default" | "curtain";
} = {}) {
```

```tsx
<AnimatedThemeToggler
  transition={transition}
  variant="square"
  duration={450}
```

- [ ] **Step 3: Opt in only from `LandingNavbar`**

Replace the existing selector invocation with:

```tsx
<ThemeToggle locale={locale} appearance="landing" transition="curtain" />
```

Do not change any dashboard `ThemeToggle` usage.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
pnpm test:localization
```

Expected: all localization and landing theme regressions PASS.

---

### Task 3: Verify behavior and repository health

**Files:**
- Verify only; no planned production changes unless a check exposes a regression caused by this feature.

**Interfaces:**
- Consumes: completed curtain implementation.
- Produces: evidence that localization, API behavior, types, lint, and production rendering remain valid.

- [ ] **Step 1: Run type and regression checks**

```powershell
pnpm test:localization
pnpm test:api
pnpm typecheck
```

Expected: every command exits `0`.

- [ ] **Step 2: Run lint and production build**

```powershell
pnpm lint
pnpm build
```

Expected: both commands exit `0`; pre-existing warnings may remain, but no new warning or error may originate from the changed files.

- [ ] **Step 3: Run final patch checks**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors or conflict markers. The worktree remains uncommitted and no push occurs.
