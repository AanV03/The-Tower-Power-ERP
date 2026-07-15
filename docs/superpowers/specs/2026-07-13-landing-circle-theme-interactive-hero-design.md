# Landing Circle Theme Reveal and Interactive Hero Design

## Goal

Correct the landing theme selector so it reveals the new theme with a circle expanding from that specific control, and make the four operational cards in the hero dashboard control a localized, animated bar chart.

## Theme Selector

The landing navbar theme selector uses the existing browser View Transition implementation with the `circle` clip-path variant. The circle originates at the center of the clicked theme-selector button and expands until it covers the viewport.

The landing selector alone requests the circle variant. Dashboard selectors retain their current square reveal. The previously implemented seven-panel theme curtain is removed entirely, including its state, timers, Framer Motion overlay, transition prop, and curtain-specific regression assertions.

If the View Transition API is unavailable, the existing immediate theme-change fallback remains. Existing theme persistence, localized accessible labels, keyboard behavior, and light/dark icons remain unchanged.

## Interactive Hero Dashboard

The four operational boxes become native buttons with a shared typed identifier:

- `memberships`
- `pos`
- `dashboard`
- `access`

The hero owns one `activeOperation` state value. `pos` is selected initially so the current revenue chart remains the default presentation.

Each operation configuration contains its icon, localized card label and summary, localized chart title, and a distinct twelve-value bar dataset. Selecting a box changes `activeOperation`; the chart derives its title and values from the selected configuration.

The chart mappings are:

| Operation | Spanish | English | French |
| --- | --- | --- | --- |
| Memberships | Renovaciones por hora | Renewals by hour | Renouvellements par heure |
| POS | Ingresos por hora | Revenue by hour | Revenus par heure |
| Dashboard | Ocupación por hora | Occupancy by hour | Occupation par heure |
| Access | Accesos por hora | Check-ins by hour | Accès par heure |

These titles are added to the existing `landing.ops` dictionaries in Spanish, English, and French. Components do not contain localized fallback strings for the new labels.

## Motion and Visual State

Changing selection reanimates all twelve bars from the baseline to the selected dataset using the existing Framer Motion spring styling. The chart title transitions with the dataset. The active card receives a stronger accent border, accent-tinted background, and a subtle inset highlight while inactive cards preserve the current appearance.

Reduced-motion users receive the updated chart immediately without entrance movement. No charting dependency is added.

## Accessibility

- Operation cards are native `button` elements and remain fully keyboard-operable.
- Each button exposes `aria-pressed` for selection state.
- The chart title is associated with the chart region through `aria-labelledby`.
- The changing chart region uses a polite live region so its localized metric title is announced without interrupting the user.
- Decorative icons and bars remain hidden from assistive technology.
- Focus-visible styling uses the existing landing accent token.

## Testing

Regression coverage is added before implementation to prove that:

- the landing selector requests `circle` and no longer requests `curtain`;
- the dashboard selector retains the square default;
- no curtain state, panel array, or curtain transition prop remains;
- the three dictionaries contain all four localized chart titles;
- the hero defines the four operation identifiers and distinct bar datasets;
- operation cards are buttons with `aria-pressed`;
- the selected operation controls both chart title and bar values;
- existing localization, API, typecheck, lint, and production build checks remain green.

## Out of Scope

- Loading live operational data from an API.
- Persisting the selected hero card across navigation or reloads.
- Displaying axes, tooltips, legends, or numeric bar labels.
- Changing dashboard theme-selector behavior.
- Changing route or section curtain transitions elsewhere on the landing page.
