# Gerpy ERP SaaS - Implementation Plan

## Current Phase

- Phase: 2 - Auth + Tenant Context
- Branch: `Auth-tenant-context`
- Status: Implemented
- Goal: implement Auth.js authentication, secure tenant resolution, RBAC context, module access context, and dashboard protection.

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
- Phase 4 - Premium Integrations: Stripe, Resend, file storage, outbox workers, audit events, and MongoDB processing.
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
