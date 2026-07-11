# Workplan 2.0 Sprint 1 Foundation Evidence

Date: 2026-05-29
Repository: `C:\Dev\School\The Tower Power`
Sprint: Foundation Setup & Architecture
CI/CD status: Deferred by project decision; local verification is the Sprint 1 closeout gate.

## Sprint Objective

Establish repository foundations, design the multi-tenant directory layouts, and construct the responsive UI shell with localized mock paths.

## Localized Routes

The Tower Power supports the locale prefixes required by the current shell:

- `/es`
- `/en`
- `/fr`

The authenticated dashboard area is implemented under `app/[locale]/(dashboard)` and is protected by Auth.js session validation in the dashboard layout.

## Dashboard Shell And Navigation

The UI shell is implemented with:

- `app/[locale]/(dashboard)/layout.tsx`: authenticated dashboard layout.
- `components/layout/app-sidebar.tsx`: desktop module navigation.
- `components/layout/topbar.tsx`: top navigation bar.
- `components/layout/mobile-module-nav.tsx`: mobile module navigation.
- `components/shared/module-page.tsx`: reusable module page layout for metrics, charts, tables, audit feed, and quick actions.
- `data/navigation.ts`: module registry and grouped navigation.

Workplan 2.0 asks for a hollow shell showing structural views for 10 modules. The current The Tower Power shell exposes 18 ERP modules.

## Implemented Modules

| Module | Route |
|---|---|
| Dashboard | `/dashboard` |
| Memberships | `/memberships` |
| Access | `/access` |
| Finance | `/finance` |
| POS | `/pos` |
| Inventory | `/inventory` |
| Catalog | `/catalog` |
| Purchases | `/purchases` |
| Warehouse | `/warehouse` |
| HR | `/hr` |
| Payroll | `/payroll` |
| Marketing | `/marketing` |
| Analytics | `/analytics` |
| Specialists | `/specialists` |
| Accounting | `/accounting` |
| Admin | `/admin` |
| Integrations | `/integrations` |
| Maintenance | `/maintenance` |

Each module is reachable through localized paths such as `/es/dashboard`, `/en/dashboard`, and `/fr/dashboard`.

## Backend/API Foundation

The backend foundation is implemented through Next.js App Router API routes and shared API utilities:

- `app/api/*`: route handlers for auth, branches, modules, admin, memberships, access, finance, POS, inventory, catalog, purchases, warehouse, accounting, HR, payroll, specialists, analytics, integrations, and maintenance.
- `lib/api/context.ts`: session-to-tenant API context and module/permission/branch guard entrypoint.
- `lib/api/module-access.ts`: module-to-permission mapping.
- `lib/api/response.ts`: standardized JSON success/error responses.
- `lib/api/pagination.ts`: bounded pagination and currency formatting helpers.
- `lib/auth/rbac.ts`: tenant, module, permission, and branch access checks.

## Database Foundation

The database foundation follows the current project architecture:

- PostgreSQL/Supabase is the transactional source of truth.
- Prisma is configured in `prisma/schema.prisma` with tenant-scoped ERP models.
- Prisma Client is created through `lib/db/prisma.ts`.
- MongoDB/Mongoose is used for flexible documents and event-style collections.
- MongoDB connection handling lives in `lib/db/mongodb.ts`.
- Mongoose contracts live in `lib/db/mongo-models.ts`.

The Prisma schema includes multi-tenant entities for tenants, branches, users, roles, permissions, modules, memberships, finance, POS, inventory, HR, payroll, specialists, accounting, integrations, and outbox events.

## Accessibility And Quality Scripts

The local verification and quality scripts are defined in `package.json`:

- `pnpm test:db-env`
- `pnpm test:auth`
- `pnpm test:api`
- `pnpm typecheck`
- `pnpm build`
- `pnpm check:accessibility`
- `pnpm check:accessibility:all`
- `pnpm lhci:update-urls`
- `pnpm lhci:mobile`
- `pnpm lhci:all`

The accessibility route lists are maintained in:

- `scripts/urls.txt`
- `lighthouserc.json`

Known route cleanup for Sprint 1 closeout:

- Replaced invalid uppercase `/RH` audit routes with lowercase `/hr`.

## CI/CD Decision

GitHub Actions CI/CD is intentionally deferred for this closeout. Sprint 1 is considered locally closed when documentation exists and local verification passes. The future CI/CD implementation should run the same local verification gate:

```powershell
pnpm test:db-env
pnpm test:auth
pnpm test:api
pnpm typecheck
pnpm build
```

## Verification Log

The local closeout verification gate is:

```powershell
pnpm test:db-env
pnpm test:auth
pnpm test:api
pnpm typecheck
pnpm build
```

Results recorded during closeout:

- `pnpm test:db-env`: passed, 5 tests.
- `pnpm test:auth`: passed, 7 tests.
- `pnpm test:api`: passed, 9 tests.
- `pnpm typecheck`: passed.
- `pnpm build`: passed, production build generated 94 static pages and API routes.

## Sprint 1 Closeout Status

Sprint 1 is locally closed for the Workplan 2.0 foundation scope. CI/CD remains a deferred project task and does not block the local Sprint 1 evidence package.
