# Landing Theme Toggle and Legal Localization Design

## Goal

Add a compact light/dark toggle to the public landing navigation and make the localized Privacy, Terms, and Security pages render Spanish, English, or French content according to the active route locale.

## Architecture

The landing navbar will reuse the existing `ThemeToggle`, `AnimatedThemeToggler`, `next-themes` provider, and `.landing-palette` light/dark CSS variables. The control will sit beside the locale switcher and receive landing-specific styling through a supported class-name variant, without introducing a second theme store or landing-only preference.

Legal content will be added to the existing dictionaries under a shared `legal` namespace. Each localized legal route will validate `params.locale`, retrieve the active dictionary, and pass the selected legal document plus locale to `LegalPage`. `LegalPage` will receive a localized last-updated label rather than rendering an English prefix. Localized metadata will be generated from the same dictionary content.

The non-localized `/legal/*` compatibility routes remain unchanged unless their current redirect or fallback behavior requires delegation to the localized pages.

## Components and Data Flow

- `LandingNavbar` renders the compact theme toggle next to `LocaleSwitcher`.
- `ThemeToggle` supports landing-specific presentation while retaining its existing dashboard defaults.
- `es`, `en`, and `fr` expose matching `legal.common`, `legal.privacy`, `legal.terms`, and `legal.security` shapes.
- Each `app/[locale]/legal/*/page.tsx` reads `params.locale`, selects the corresponding dictionary document, and passes it to `LegalPage`.
- `LegalPage` renders only supplied localized content and continues passing the locale to the shared navbar and footer.

## Error Handling

Unsupported locales continue to call `notFound()`. Dictionary selection uses the existing `getDictionary` fallback behavior; components do not contain Spanish fallback strings.

## Testing

Regression tests will verify:

- The landing navbar renders the existing theme toggle with the active locale.
- Spanish, English, and French dictionaries contain all three legal documents.
- The localized legal routes use `getDictionary(locale)` rather than embedded English content.
- `LegalPage` localizes the last-updated label.
- Existing localization, navigation, lint, typecheck, and production build checks remain green.
