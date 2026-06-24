# Gerpy ERP SaaS - Implementation Plan

## Current Phase

- Phase: 4 - Premium Integrations
- Branch: `Module-apis`
- Status: Planned / deferred
- Goal: document premium integration work for a future branch without implementing external service calls yet.

## Workplan 2.0 Sprint 1 Local Closeout

- Status: locally closed; CI/CD deferred by project decision.
- Evidence document: `docs/workplan2/sprint-1-foundation-evidence.md`.
- Scope: document the existing Next.js 15 localized shell, dashboard navigation, backend/API foundation, Prisma/Supabase foundation, MongoDB/Mongoose foundation, and local quality scripts.
- CI/CD note: `.github/workflows/ci.yml` is intentionally not implemented in this cycle. A future CI workflow should mirror the local verification gate.
- Local verification gate:
  - `pnpm test:db-env`
  - `pnpm test:auth`
  - `pnpm test:api`
  - `pnpm typecheck`
  - `pnpm build`
- Verification result:
  - `pnpm test:db-env` passed with 5 tests.
  - `pnpm test:auth` passed with 7 tests.
  - `pnpm test:api` passed with 9 tests.
  - `pnpm typecheck` passed after rerunning independently from `pnpm build`.
  - `pnpm build` passed.

## Phase 1 Checklist

- [x] Create this progress plan.
- [x] Add Prisma, Mongoose, and Zod dependencies.
- [x] Add PostgreSQL Prisma schema for multi-tenant ERP core data.
- [x] Add MongoDB/Mongoose contracts for flexible documents and event logs.
- [x] Add documented env variables without real credentials.
- [x] Add database validation scripts that do not connect to real infrastructure.
- [x] Verify with `pnpm db:validate`, `pnpm db:generate`, `pnpm db:check-env`, `pnpm typecheck`, and `pnpm build`.

## Phase 2 Checklist

- [x] Create the `Auth-tenant-context` branch from the database foundation.
- [x] Add Auth.js dependencies for Prisma adapter, credentials, Google, and Discord auth.
- [x] Extend Prisma schema with Auth.js adapter models and user profile fields.
- [x] Add password hashing and RBAC context helpers with focused Node tests.
- [x] Add tenant bootstrap for new credential/OAuth users: tenant, branch, modules, Owner role, and permissions.
- [x] Add Auth.js route handlers and typed session/JWT tenant context.
- [x] Add registration API for custom email/password signup.
- [x] Connect signin/signup screens to real credentials and OAuth providers.
- [x] Protect dashboard routes with server-side Auth.js session validation.
- [x] Add reusable branch/module/permission guards for individual module APIs and server actions.
- [x] Add self-service onboarding flow through signup/OAuth tenant bootstrap.

## Phase 3 Checklist

- [x] Create the `Module-apis` branch from the Auth foundation.
- [x] Add shared API context for Auth.js session, tenant, branch, module and permission guards.
- [x] Add standardized JSON success/error responses.
- [x] Add dashboard/module summary API shaped for the existing frontend metrics, chart and table components.
- [x] Add SaaS Admin tenant/branch/module APIs.
- [x] Add memberships APIs for members and membership plans.
- [x] Add first finance/POS/inventory/RH/specialists read APIs with tenant scoping.
- [x] Add operational GET/POST endpoints for access devices, finance invoices/payments, inventory products/warehouses, POS registers/sales, HR employees, and specialists.
- [x] Add focused tests for API context, module summary shaping and validation.
- [x] Verify with `pnpm test:auth`, API tests, `pnpm typecheck`, and `pnpm build`.
- [x] Connect dashboard module pages to tenant-scoped module summary data instead of static metric/table/chart mocks.

## Phase 4 Plan - Premium Integrations

Status: planned for a future branch. No Stripe, Resend, storage, worker, or live webhook implementation is included in the current `Module-apis` branch.

Recommended branch:

- `Premium-integrations`

### Goals

- Add production-grade third-party integrations that do not weaken the PostgreSQL source of truth.
- Use Transactional Outbox for eventual work after SQL commits.
- Persist external payloads and audit trails in MongoDB without blocking financial operations.
- Keep all provider calls idempotent, observable, retryable, and tenant-scoped.

### Stripe

- Add Stripe SDK and env documentation:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_*` only if plans are fixed in Stripe.
- Map Stripe customers to Gerpy users, members, tenants, or subscriptions through SQL references.
- Create checkout/session endpoints for:
  - SaaS tenant billing.
  - Membership payments.
  - One-time POS/payment links only if needed.
- Add webhook route:
  - Verify Stripe signature.
  - Resolve `tenantId` from metadata, account mapping, or stored integration config.
  - Enforce unique idempotency on `(provider, externalEventId)`.
  - Update SQL payment/subscription/invoice state inside Prisma transaction.
  - Write `OutboxEvent` for audit, CRM, analytics, and integration logs.
- Do not write directly to MongoDB from webhook request handler except through an outbox worker in a later step.

### Resend

- Add Resend SDK and env documentation:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
- Create transactional email service for:
  - Welcome/onboarding.
  - Payment receipt.
  - Failed payment.
  - Subscription renewal reminder.
  - Password/auth notification if Auth.js flow needs it later.
- Prefer React Email templates when email design becomes part of the product.
- Trigger emails from outbox events where possible, not directly from core transactions.

### File Storage

- Decide storage provider before implementation:
  - Supabase Storage, Vercel Blob, or S3-compatible storage.
- Initial document types:
  - Tenant logos and brand assets.
  - Legal documents.
  - Employee documents.
  - Supplier invoices.
  - Member attachments if required by operations.
- Store metadata in SQL and binary assets in object storage.
- Keep signed URL generation tenant-scoped and permission-guarded.

### Outbox Worker

- Add worker/service for `OutboxEvent` processing:
  - Claim pending events safely.
  - Mark as `PROCESSING`, `PROCESSED`, or `FAILED`.
  - Use retry attempts and `availableAt` for backoff.
  - Ensure idempotent handlers.
- First handlers:
  - `audit.event.created` -> Mongo `audit_events`.
  - `integration.event.received` -> Mongo `integration_event_logs`.
  - `payment.succeeded` -> CRM/email/analytics updates.
  - `subscription.changed` -> CRM/audit/email updates.

### MongoDB Processing

- Use existing Mongoose contracts from Phase 1.
- Write Mongo documents from workers:
  - `audit_events`
  - `integration_event_logs`
  - `crm_profiles`
  - `analytics_snapshots`
- Add indexes/unique keys where missing before high-volume writes.
- Keep Mongo failures retryable; they must not invalidate committed SQL transactions.

### Security And Observability

- Never trust provider payload tenant IDs without verifying against stored integration configuration.
- Verify all webhook signatures.
- Add request/event IDs to logs.
- Avoid logging secrets, tokens, card data, or raw PII beyond required audit fields.
- Add provider event status transitions for support/debugging.

### Mandatory Pause Before Live Testing

Before running live provider calls, webhook tunnel tests, or worker jobs against real infrastructure:

1. Stop and notify that provider credentials are required.
2. User adds `.env` values for Stripe, Resend, storage, and any provider-specific secrets.
3. If needed, provide setup tutorials for Stripe webhook CLI, Resend domain verification, and storage buckets.
4. Continue only after user confirms `.env` and provider dashboards are ready.

### Suggested Verification

- `pnpm test:api`
- `pnpm test:auth`
- Provider unit tests with mocked SDK calls.
- Webhook signature tests with fixed fixtures.
- Outbox idempotency tests.
- `pnpm typecheck`
- `pnpm build`

## Mandatory Pause

When real PostgreSQL or MongoDB databases are needed, stop before running connection tests, migrations, `prisma db push`, or seed scripts.

Required flow:

1. Notify that real databases are now required.
2. The user creates PostgreSQL/MongoDB and adds values to `.env`.
3. If requested, provide a step-by-step setup tutorial.
4. Continue only after the user confirms `.env` is ready.

## Later Phases

- Phase 2 - Auth + Tenant Context: authentication, secure tenant resolution, RBAC, module guards, and branch scope.
- Phase 3 - Module APIs: SaaS Admin, subscriptions, finance, POS, inventory, HR, marketing, and specialists APIs.
- Phase 4 - Premium Integrations: Stripe, Resend, file storage, outbox workers, audit events, and MongoDB processing. Planned and deferred.
- Phase 5 - Functional Frontend: replace static module mocks with real data, CRUD actions, filters, and dashboards.

## Decisions

- PostgreSQL is the transactional source of truth.
- MongoDB is used through Mongoose for flexible and high-volume documents.
- The current Next.js app will evolve in place; it will not be re-created as a new T3Stack project.
- No Docker, cloud infrastructure, real `.env`, migrations, or DB connection tests are part of Phase 1.

## Verification Log

- `pnpm db:validate` passed.
- `pnpm db:generate` passed.
- `pnpm db:check-env` passed using documented URL shapes.
- `pnpm test:db-env` passed with 5 Node tests.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- PostgreSQL schema was pushed to Supabase with `pnpm prisma db push --accept-data-loss` after confirming affected tables were empty.
- Supabase `public` schema contains 45 tables from the Prisma schema.
- Phase 2: `pnpm test:auth` passed with 5 Node tests.
- Phase 2: `pnpm db:validate` passed after Auth.js schema changes.
- Phase 2: `pnpm db:generate` passed after Auth.js schema changes.
- Phase 2: Supabase Auth.js schema update was pushed with `pnpm prisma db push --accept-data-loss` after confirming `users` had 0 rows and 0 duplicate email groups.
- Phase 2: `pnpm typecheck` passed.
- Phase 2: `pnpm build` passed.
- Phase 2: production server smoke test confirmed unauthenticated `GET /es/dashboard` redirects to `/es/signin` with HTTP 307.
- Phase 3: `pnpm test:api` passed with 3 Node tests.
- Phase 3: `pnpm test:auth` passed with 7 Node tests.
- Phase 3: `pnpm test:db-env` passed with 5 Node tests.
- Phase 3: `pnpm db:validate`, `pnpm db:generate`, and `pnpm db:check-env` passed.
- Phase 3: `pnpm typecheck` passed.
- Phase 3: `pnpm build` passed and includes API routes for admin tenant, branches, memberships, and module summaries.
- Phase 3: dashboard module pages now render tenant-scoped summary service data through `ModulePage`; `pnpm test:api`, `pnpm test:auth`, `pnpm typecheck`, and `pnpm build` passed after the integration.
- Phase 3: expanded module APIs with tenant-scoped GET/POST routes across Access, Finance, Inventory, POS, HR, and Specialists; `pnpm typecheck` passed after the endpoint expansion.
- Phase 3: verification passed after endpoint expansion: `pnpm test:api`, `pnpm test:auth`, `pnpm test:db-env`, `pnpm db:validate`, `pnpm db:generate`, `pnpm db:check-env`, `pnpm typecheck`, and `pnpm build`.
- Workplan 2.0 Sprint 1 local closeout: created `docs/workplan2/sprint-1-foundation-evidence.md`, documented CI/CD as deferred, corrected QA audit routes from `/RH` to `/hr`, and passed `pnpm test:db-env`, `pnpm test:auth`, `pnpm test:api`, `pnpm typecheck`, and `pnpm build`.
