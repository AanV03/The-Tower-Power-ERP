# Smooth Landing Circle Theme Transition Design

## Goal

Remove the visible hitch from the landing navbar's circular light/dark reveal while preserving its button-origin circle, localized accessibility, theme persistence, and the dashboard's existing square reveal.

## Root Cause

`AnimatedThemeToggler` requests a 450 ms Web Animations API clip-path animation and writes `--magicui-theme-toggle-vt-duration` and `--magicui-theme-vt-clip-from` to the root element. No stylesheet currently consumes those variables.

As a result, the browser's default root View Transition cross-fade and lifecycle run independently from the custom circle. The transition pseudo-elements can finish on the browser's default timeline while the 450 ms circle is still animating. Large blurred landing layers make the resulting discontinuity more visible, but the unsynchronized snapshot lifecycle is the primary defect.

## Corrected Transition

The landing selector uses a 350 ms circle reveal. Dashboard selectors keep their current 450 ms square reveal.

Scoped global CSS applies only while `html[data-magicui-theme-vt="active"]` is present:

- `::view-transition-group(root)` uses `--magicui-theme-toggle-vt-duration` so the pseudo-element lifecycle matches the JavaScript animation.
- `::view-transition-old(root)` and `::view-transition-new(root)` disable the browser's default opacity animation and use `mix-blend-mode: normal`.
- `::view-transition-new(root)` starts at `--magicui-theme-vt-clip-from`, preventing a full-page flash before the Web Animations API begins.
- The custom clip-path animation uses `cubic-bezier(0.22, 1, 0.36, 1)` for a responsive ease-out curve.

The existing circle geometry and button-center origin remain unchanged.

## Reduced Motion and Fallbacks

Before starting a View Transition, the toggle checks `prefers-reduced-motion: reduce`. If enabled, it changes the theme immediately without snapshot animation.

Browsers without `document.startViewTransition` retain the existing immediate theme-change fallback. Cleanup continues to remove the temporary data attribute and CSS variables when the transition finishes.

## Scope

- Modify `ThemeToggle` to use 350 ms only for `appearance="landing"`.
- Modify `AnimatedThemeToggler` to add the reduced-motion bypass and smooth easing.
- Add synchronized, data-attribute-scoped View Transition CSS to `app/globals.css`.
- Preserve all hero interactions, localization, navbar navigation effects, dashboard theme behavior, and route transitions.
- Add no dependency.

## Testing

Regression coverage is added before implementation to prove that:

- landing appearance selects `circle` with 350 ms;
- dashboard appearance selects `square` with 450 ms;
- the toggler checks reduced-motion before `startViewTransition`;
- the circle animation uses the approved cubic-bezier easing;
- global CSS consumes both theme transition variables;
- the default old/new root animations are disabled only while the theme transition data attribute is active;
- localization tests, API tests, typecheck, lint, build, and patch audit remain green.

## Out of Scope

- Replacing the native View Transition implementation with Framer Motion.
- Removing blur or decorative effects from the landing page.
- Changing the shape or origin of either landing or dashboard reveals.
- Changing hero chart animations.
