# Landing Theme Curtain Transition Design

## Goal

When the compact theme selector in the landing-page navbar is activated, change between light and dark themes behind a seven-panel Framer Motion curtain wipe. Dashboard theme selectors must retain their existing behavior.

## Interaction

1. The user activates the landing navbar theme selector.
2. Seven fixed vertical panels wipe from the top of the viewport to the bottom with a short left-to-right stagger.
3. Once every panel covers the viewport, the existing `next-themes` theme value changes.
4. The panels retract toward the bottom, revealing the newly themed page.
5. The selector remains disabled until the exit animation finishes so repeated activation cannot overlap transitions.

If the user prefers reduced motion, the selector changes the theme immediately and no curtain overlay is mounted.

## Architecture

Extend the existing theme-toggle path with an explicit curtain transition option. The landing navbar opts into this option; the default remains the current View Transition behavior used elsewhere.

- `LandingNavbar` continues to render the shared `ThemeToggle`, passing a landing appearance and curtain transition mode.
- `ThemeToggle` forwards the requested transition mode without changing its localized accessible label or compact styling.
- `AnimatedThemeToggler` owns the theme-change lifecycle. Its curtain mode renders the Framer Motion overlay, coordinates cover/switch/reveal timing, and locks the button while active.
- The existing browser View Transition implementation remains the default and is unchanged for dashboard consumers.

The overlay is decorative, marked `aria-hidden`, ignores pointer events, and uses a fixed stacking layer high enough to cover the landing page. Panel color uses the landing transition color variable with the existing teal fallback so it matches current landing route and section transitions.

## Motion Details

- Seven equal-width vertical panels.
- Cover animation: `scaleY` from `0` to `1`, origin at the top.
- Reveal animation: `scaleY` from `1` to `0`, origin at the bottom.
- Panels stagger from left to right.
- Easing matches the landing curtain transition: `[0.83, 0, 0.17, 1]`.
- Theme mutation occurs only after the final cover panel completes.
- The selector cannot start another transition until all reveal panels finish.

## Accessibility and Resilience

- Preserve the localized `aria-label` and `title` already supplied by `ThemeToggle`.
- Respect `prefers-reduced-motion: reduce` by switching themes synchronously without a curtain.
- Preserve keyboard activation through the native button.
- Disable the control during the transition and clean up timers on unmount.
- Keep the overlay non-interactive and hidden from assistive technology.

## Testing

Add regression coverage before implementation to prove that:

- only the landing selector requests curtain mode;
- dashboard selectors retain the default transition;
- the curtain implementation uses Framer Motion and seven panels;
- the theme changes after full cover, not at animation start;
- reduced-motion mode changes the theme immediately;
- the button is locked during the animation;
- existing localization, typecheck, lint, and production build checks remain green.

## Out of Scope

- Page or route navigation transitions.
- Changing the dashboard theme-selector animation.
- Adding new theme choices beyond light and dark.
- Replacing the existing `next-themes` persistence mechanism.
