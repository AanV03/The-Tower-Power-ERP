# Balanced Workflow and Automatic Hero Chart Design

## Objective

Improve the landing page without changing its visual identity or localization architecture:

1. Balance the large workflow-section heading so it wraps intentionally on desktop and remains responsive.
2. Preserve the nine application boxes while removing their click-to-scroll behavior.
3. Rotate the hero operations selection and bar graph automatically while preserving manual selection.

## Scope

The change is limited to the localized landing page and its hero. Existing navigation, authentication, theme switching, responsive behavior, and all other landing sections remain unchanged.

## Workflow Heading Layout

The `Built for gym operations` section will retain its current copy, localization keys, typography, colors, and feature grid. Its desktop header layout will be rebalanced by:

- Giving the heading column more horizontal space.
- Reducing the heading's desktop maximum font size.
- Applying balanced text wrapping with a controlled maximum width.
- Aligning the description with the heading in a visually stable two-column layout.

The result should keep the English heading to approximately three or four intentional lines at common desktop widths instead of the current narrow stack. Spanish and French must remain readable without clipping or overflow. Mobile continues to use a single-column layout.

## Application Boxes

The nine boxes in the `Apps for every gym workflow` section are informational labels, not navigation controls.

- Remove the `#modules` link target from each box.
- Render the boxes as non-interactive semantic content.
- Preserve their current grid, borders, icons, labels, colors, and responsive sizing.
- Remove pointer, hover, and focus behavior that suggests navigation.
- Leave the lower modules section and its `id` intact unless it is unused elsewhere; only the box-triggered scrolling behavior is being removed.

All labels continue to come from the existing Spanish, English, and French dictionaries.

## Hero Chart Rotation

The hero operations dashboard continues to expose four selections in this order:

1. Memberships
2. Point of sale
3. Dashboard
4. Access

The existing point-of-sale selection remains the initial state. When motion is allowed, the active selection advances to the next item every five seconds and wraps back to Memberships after Access. The selected card, localized chart title, and bar values update together through the existing `activeOperation` state.

### Manual Interaction

- Clicking an operation card selects it immediately.
- A manual selection restarts the full five-second interval before the next automatic change.
- Automatic rotation pauses while the operations dashboard is hovered.
- Automatic rotation pauses while keyboard focus is anywhere within the operations dashboard.
- Rotation resumes with a fresh five-second interval after hover or focus leaves.

### Motion and Accessibility

- When `prefers-reduced-motion` is enabled, automatic rotation is disabled and the current manual selection remains available.
- Operation cards remain native buttons with `aria-pressed` state.
- The chart remains a polite live region so its localized title is announced without interrupting the user.
- Timer changes must not steal focus or scroll the page.
- Timers and event state must be cleaned up when the hero unmounts.

## Localization

No user-facing string will be added directly to the affected JSX. Existing dictionary values will supply the section heading, application labels, operation card labels, and chart titles in Spanish, English, and French. No separate translation mechanism or Spanish inline fallback will be introduced.

## Testing

Regression coverage will verify:

- The application boxes no longer render links to `#modules`.
- The hero declares the five-second automatic rotation behavior.
- Manual selection resets the timer.
- Hover and focus pause/resume the timer.
- Reduced-motion users do not receive automatic rotation.
- Existing localized labels and chart-title keys remain present for Spanish, English, and French.

Validation will include the relevant localization/module tests, lint, type checking if available, and a production build. Browser verification will cover desktop layout, removed scrolling behavior, manual selection, periodic rotation, pause/resume behavior, reduced motion where practical, and all three locales.

## Non-Goals

- Replacing the hero chart with a carousel library.
- Changing chart data, module order, or operational copy.
- Removing the application boxes or lower module cards.
- Redesigning unrelated landing sections.
- Changing the theme transition or dashboard modules.
