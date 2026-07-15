# Smooth Landing Circle Theme Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize and shorten the landing circle theme reveal so it completes smoothly without changing dashboard behavior.

**Architecture:** Keep the existing native View Transition and Web Animations API clip-path. Add data-attribute-scoped pseudo-element CSS that synchronizes the snapshot lifecycle and suppresses the browser's competing cross-fade, while `ThemeToggle` selects a 350 ms landing duration and `AnimatedThemeToggler` supplies the approved easing and reduced-motion bypass.

**Tech Stack:** React 19, TypeScript, next-themes, CSS View Transitions, Web Animations API, Node test runner.

## Global Constraints

- Preserve the landing button-origin circle.
- Use 350 ms for landing and 450 ms for dashboard.
- Preserve dashboard square reveal, theme persistence, localization, and hero behavior.
- Respect `prefers-reduced-motion: reduce` with an immediate theme change.
- Add no dependency.
- Do not commit or push any changes.

---

### Task 1: Add failing smooth-transition regressions

**Files:**
- Modify: `scripts/module-localization.test.mjs`

**Interfaces:**
- Consumes: `ThemeToggle`, `AnimatedThemeToggler`, and `app/globals.css` source.
- Produces: regression coverage for duration, easing, reduced motion, and synchronized pseudo-element CSS.

- [ ] **Step 1: Add the failing regression**

```js
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
  assert.match(animatedToggle, /easing: "cubic-bezier\(0\.22, 1, 0\.36, 1\)"/);
  assert.match(globals, /html\[data-magicui-theme-vt="active"\]::view-transition-group\(root\)/);
  assert.match(globals, /animation-duration: var\(--magicui-theme-toggle-vt-duration\)/);
  assert.match(globals, /clip-path: var\(--magicui-theme-vt-clip-from\)/);
  assert.match(globals, /::view-transition-old\(root\)[\s\S]*animation: none/);
  assert.match(globals, /::view-transition-new\(root\)[\s\S]*mix-blend-mode: normal/);
});
```

- [ ] **Step 2: Run `pnpm test:localization` and verify RED**

Expected: FAIL because landing still uses 450 ms, reduced-motion/easing are absent, and the transition CSS variables are not consumed.

---

### Task 2: Synchronize and smooth the native transition

**Files:**
- Modify: `components/layout/theme-toggle.tsx`
- Modify: `components/ui/animated-theme-toggler.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: existing `appearance`, `duration`, root data attribute, and CSS variables.
- Produces: a synchronized 350 ms landing circle and unchanged 450 ms dashboard square.

- [ ] **Step 1: Select duration by appearance**

```tsx
<AnimatedThemeToggler
  variant={appearance === "landing" ? "circle" : "square"}
  duration={appearance === "landing" ? 350 : 450}
```

- [ ] **Step 2: Add reduced-motion bypass before View Transition setup**

Immediately after verifying the button ref:

```tsx
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  applyTheme()
  return
}
```

- [ ] **Step 3: Use the approved ease-out curve**

Replace the non-star easing with:

```tsx
easing: shape === "star" ? "linear" : "cubic-bezier(0.22, 1, 0.36, 1)",
```

- [ ] **Step 4: Add scoped View Transition CSS**

Append to `app/globals.css`:

```css
html[data-magicui-theme-vt="active"]::view-transition-group(root) {
  animation-duration: var(--magicui-theme-toggle-vt-duration);
  animation-timing-function: linear;
}

html[data-magicui-theme-vt="active"]::view-transition-old(root),
html[data-magicui-theme-vt="active"]::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

html[data-magicui-theme-vt="active"]::view-transition-new(root) {
  clip-path: var(--magicui-theme-vt-clip-from);
  will-change: clip-path;
}
```

- [ ] **Step 5: Run focused verification**

Run `pnpm test:localization` and `pnpm typecheck`.

Expected: both exit `0`.

---

### Task 3: Full verification

**Files:**
- Verify only.

**Interfaces:**
- Consumes: synchronized transition implementation.
- Produces: fresh test, build, and patch evidence.

- [ ] **Step 1: Run `pnpm test:localization`, `pnpm test:api`, `pnpm typecheck`, and `pnpm lint`**

Expected: all exit `0`; unrelated pre-existing lint warnings may remain.

- [ ] **Step 2: Run `pnpm build`**

Expected: exit `0` and all localized pages generate.

- [ ] **Step 3: Run `git diff --check` and focused source searches**

Expected: no whitespace errors, landing duration is 350 ms, dashboard duration is 450 ms, synchronized CSS exists, and the branch remains uncommitted.
