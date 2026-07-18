# Public Operations, Contact, and Screenshot Presentation Design

## Goal

Improve screenshot legibility on every public module page and replace the landing navbar's Operations and Contact hash links with complete localized public pages.

## Scope

The change covers the shared public module page template, the landing navbar, two new localized public routes, their shared page components, and English, Spanish, and French dictionaries. Dashboard routes, authentication, registration, backend services, and existing module catalog content remain unchanged.

## Module Screenshot Presentation

The current 1860×948 dashboard screenshots are compressed into roughly half of a 1280px two-column hero and surrounded by two nested frames. This scaling causes the apparent loss of detail.

The module hero will become a compact text-first header. The screenshot will move into its own full-width block immediately below the header, within the existing `max-w-7xl` landing container. It will:

- use the source image's natural aspect ratio instead of a fixed minimum-height box;
- use one restrained border and background surface rather than nested frames;
- render through Next.js `Image` with responsive sizing and no cropping;
- expose a clear expand control and allow clicking the preview;
- open a full-viewport modal containing the uncropped image at the largest practical size;
- close through its close button, Escape, or clicking the backdrop;
- lock background scrolling while open and return keyboard focus to the trigger when closed;
- use localized accessible labels.

Because the shared template renders all 15 module routes, this presentation applies to every page opened from the mega menu.

## Operations Page

Add `app/[locale]/operations/page.tsx` and a focused shared landing component. The page will use the standard landing navbar, palette, dot-grid treatment, and footer. Its localized sections are:

1. A hero explaining the connected gym operating model.
2. Four operating pillars: members and access, sales and billing, staff and payroll, inventory and finance.
3. A three-step operating flow from member activity through reconciliation.
4. A module-links section directing users to relevant existing public module pages.

The route will provide localized metadata and return the existing not-found response for unsupported locales.

## Contact Page

Add `app/[locale]/contact/page.tsx` and a focused shared landing component. The page will include:

- a localized hero and short response expectation;
- standard support, sales, and general contact channels;
- a client-side form with name, email, company, and message fields;
- required validation for name, email, and message;
- a valid-email format check;
- localized inline errors, submit label, and success confirmation;
- a reset action after successful submission.

Submission is intentionally local-only. It does not call an API, email provider, or external service, and the page will state that it is a demonstration contact experience. This avoids implying message delivery that does not exist.

## Navbar Routing

The desktop navbar Operations and Contact controls will link to `/${locale}/operations` and `/${locale}/contact`. They will use the existing landing route transition instead of the section-scroll curtain behavior. The obsolete hash-target lookup and section-scroll timer logic will be removed from the navbar.

On smaller screens, Operations and Contact will be available in a compact public-navigation control alongside the existing module menu, so the routes remain discoverable without crowding the header.

## Localization

All new headings, body copy, navigation labels, form labels, validation messages, modal labels, metadata titles, and metadata descriptions will be present in `en`, `es`, and `fr`. Public URLs retain stable English route segments across locales.

## Error Handling and Accessibility

- Unknown locales use `notFound()`.
- The contact form does not clear invalid input.
- The modal uses dialog semantics, an accessible name, Escape handling, focus return, and scroll locking.
- Images retain localized alternative text and never crop meaningful dashboard content.
- Form controls have visible labels, error associations, and an announced success state.

## Testing

Implementation follows test-driven development. Regression tests will first fail for:

- the full-width natural-ratio screenshot layout and removal of the fixed nested box;
- the expandable screenshot dialog and accessible close behavior;
- localized Operations and Contact routes and metadata;
- route-based navbar links with no `#operations` or `#contact` behavior;
- contact form required-field and email validation;
- localized new page, form, and modal dictionary entries.

Verification will include the focused landing tests, contact-form tests, TypeScript checking, linting, a production build, and final diff review. The unrelated existing `pnpm-workspace.yaml` modification remains untouched.
