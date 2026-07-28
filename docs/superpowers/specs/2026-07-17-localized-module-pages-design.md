# Localized Module Pages Design

## Goal

Finish the public module pages opened from the landing mega menu so they fully follow the selected language, show the supplied product screenshots, contain credible module-specific highlights, and no longer offer a create-account action.

## Scope

This change applies only to the public routes at `app/[locale]/modules/[slug]` and their shared module content. It does not alter dashboard modules, authentication, registration, sidebar navigation, or the mega menu interaction model.

## Content Architecture

`lib/modules.ts` will remain the canonical module catalog. Each module slug will resolve localized content for English, Spanish, and French:

- localized label and category;
- localized page description;
- three localized highlight titles;
- one short, realistic localized description for each highlight;
- the matching screenshot filename and localized alternative text.

The module catalog will expose a locale-aware lookup used by both the module route and the mega menu. This removes the current language detection and hand-built label map from the mega menu while keeping slugs stable across languages.

## Screenshot Mapping

Each existing PNG in `public` maps to one public module page:

| Slug | Screenshot |
| --- | --- |
| `panel-operativo` | `Panel Op.png` |
| `punto-de-venta` | `POS.png` |
| `suscripciones` | `Gestion Membresias.png` |
| `acceso` | `Access Control.png` |
| `catalogo` | `Product catalog.png` |
| `compras` | `Purchasing supply.png` |
| `almacenes` | `Warehouse Management.png` |
| `inventario` | `Inventory Stock.png` |
| `finanzas` | `Finance Module.png` |
| `contabilidad` | `Accounting.png` |
| `rh-y-nomina` | `HR attendance.png` |
| `nomina` | `Payroll commissions.png` |
| `especialistas` | `Period Settlement.png` |
| `marketing` | `Marketing retention.png` |
| `analytics` | `Analytics Intelligence.png` |

The shared page template will use Next.js image rendering with responsive containment so full screenshots remain visible without stretching or cropping. The surrounding landing-theme panel and border treatment will remain.

## Page Localization

The shared template will read localized page chrome from the selected locale dictionary. This includes the back link, section eyebrow, highlights heading, and bottom informational banner. Module-specific text will come from the localized module catalog.

The back link will remain locale-aware. Page metadata will use the localized module label and description.

## Highlights

The existing three-card layout remains. Every card will contain a module-specific title and a concise description of the actual capability instead of placeholder preview copy. All titles and descriptions will be supplied in English, Spanish, and French.

## Bottom Banner

The bottom banner remains as a visual closing section, with localized text. The `Create account` link and arrow are removed entirely, leaving no registration action on public module pages.

## Error Handling

Unsupported locales and unknown module slugs continue to return the existing Next.js not-found response. The catalog uses explicit screenshot mappings, so no runtime filename inference is required.

## Testing

Implementation will follow test-driven development. Static regression tests will first be expanded and observed failing for:

- locale-aware module lookup and localized page content;
- all 15 screenshot filename mappings;
- use of the real screenshot in the shared template;
- real highlight descriptions replacing placeholder copy;
- removal of the create-account link;
- localized metadata and locale-aware back navigation.

After implementation, the focused regression test, TypeScript checking, linting if configured, and the production build will be run. Existing unrelated workspace changes will not be modified.
