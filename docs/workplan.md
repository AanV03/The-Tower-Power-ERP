# Gerpy ERP - Workplan 2.0 Implementation Guide


> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the missing Gerpy ERP implementation work against `workplan2.0.pdf`, using the current software state as the baseline.

**Architecture:** Gerpy will continue evolving in the existing Next.js 15 application. PostgreSQL/Supabase via Prisma remains the transactional source of truth, MongoDB/Mongoose remains the flexible/event/document store, and all modules must stay tenant-scoped through Auth.js session context, RBAC, module guards, and branch guards.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma 7, PostgreSQL/Supabase, Mongoose/MongoDB, Auth.js, Zod, Tailwind CSS, shadcn/Radix-style UI, Recharts, Pa11y, Lighthouse CI, Node test runner, pnpm.

---

## Current Baseline

Date: 2026-05-29  
Reference plan: `C:\Users\aaron\Desktop\workplan2.0.pdf`  
Repository: `C:\Dev\School\Gerpy`

The current codebase already includes:

- Next.js 15 localized dashboard shell with Spanish, English, and French routes.
- Sidebar/navigation for 18 ERP modules, exceeding the 10-module minimum in Sprint 1.
- Auth.js credentials/OAuth authentication with Prisma Adapter.
- Tenant bootstrap for new users.
- Session/JWT tenant context with roles, permissions, modules, and branch scope.
- Prisma schema with broad ERP coverage.
- Mongoose models for audit, branding, CRM, access telemetry, analytics, integration logs, and maintenance tickets.
- Tenant-scoped API helpers, pagination, module access guards, and JSON response helpers.
- GET/POST APIs for many core resources.
- Module summary pages wired to live aggregate data.
- Pa11y/Lighthouse scripts and build/test scripts in `package.json`.
- Documentation artifacts:
  - `plan.md`
  - `backend.md`
  - `front.md`
  - `database.md`
  - `ERP-analisis.md`
  - `agent-guidelines.md`
  - `testing-guidelines.md`

The main gap is not foundational architecture. The main gap is converting the existing platform skeleton into complete operational workflows with real write-side business logic, UI forms, audit trails, RLS/security hardening, and final evidence.

## Global Implementation Rules

- Do not recreate the project. Continue in the current Next.js app.
- New feature work should follow the existing App Router, Prisma, Mongoose, Zod, and API response patterns.
- Any new API must call `requireApiContext` or an equivalent tenant-aware guard.
- Any branch-scoped write must validate branch ownership.
- Any financial or inventory mutation must use a Prisma transaction.
- Any user-facing workflow must have frontend state for loading, empty, error, and success cases.
- Any sprint implementation must update this `workplan.md` checklist and `plan.md` verification log.
- Before marking a sprint task complete, run the verification commands listed in that sprint.
- Per local project instruction, run `pnpm build` before considering work complete.

## Suggested Branch Strategy

- Sprint 1 closeout: `codex/workplan2-sprint1-closeout`
- Sprint 2: `codex/workplan2-auth-rls`
- Sprint 3: `codex/workplan2-operations`
- Sprint 4: `codex/workplan2-hr-specialists`
- Sprint 5: `codex/workplan2-marketing-finance`
- Sprint 6: `codex/workplan2-admin-hardening`

Use smaller branches if a sprint becomes too large.

---

## Sprint 1: Foundation Setup & Architecture

Timeline: May 12, 2026 - May 26, 2026  
Status: Locally closed after verification; CI/CD deferred.

### Sprint Objective

Establish repository foundations, design multi-tenant directory layouts, and construct the responsive UI shell with localized mock paths.

### Current State

Implemented:

- Global dashboard layout exists under `app/[locale]/(dashboard)`.
- Localized routing exists for `es`, `en`, and `fr`.
- Module navigation exists in `data/navigation.ts`.
- Reusable module UI exists through `components/shared/module-page.tsx`.
- Prisma is connected through `lib/db/prisma.ts`.
- MongoDB connector exists in `lib/db/mongodb.ts`.
- Accessibility scripts exist: `check:accessibility`, `check:accessibility:all`, `lhci:*`.
- Existing module shell exceeds the requested 10 modules.

Missing or incomplete:

- CI/CD remains deferred by project decision.
- Local evidence package is maintained in `docs/workplan2/sprint-1-foundation-evidence.md`.
- Documentation explicitly maps current architecture to Workplan 2.0.

### Task 1.1: Close Sprint 1 Evidence

**Files:**

- Modify: `workplan.md`
- Modify: `plan.md`
- Create: `docs/workplan2/sprint-1-foundation-evidence.md`

- [x] Create `docs/workplan2/sprint-1-foundation-evidence.md` with:
  - Dashboard routes implemented.
  - Module count and route list.
  - Backend/API foundation summary.
  - Prisma/Supabase connection summary.
  - Accessibility script list.
  - Build/test command outputs.

- [x] Add links in `docs/plan.md` to the Sprint 1 evidence document.

- [x] Run:

```powershell
pnpm test:api
pnpm test:auth
pnpm test:db-env
pnpm typecheck
pnpm build
```

Expected: all commands pass.

### Task 1.2: CI Pipeline Deferred

**Files:**

- Modify: `workplan.md`
- Modify: `docs/plan.md`

- [x] Record that GitHub Actions CI/CD is deferred for this cycle.
- [x] Keep local verification as the Sprint 1 closeout gate:

```powershell
pnpm test:db-env
pnpm test:auth
pnpm test:api
pnpm typecheck
pnpm build
```

- [x] Document the future CI/CD command set in `docs/workplan2/sprint-1-foundation-evidence.md`.

### Sprint 1 Acceptance Criteria

- [x] App shell routes exist for all modules.
- [x] Locales `es`, `en`, `fr` work.
- [x] Backend and database connection architecture is documented.
- [x] Accessibility scripts are documented.
- [x] CI/CD is documented as deferred and does not block local closeout.
- [x] `pnpm build` passes.

---

## Sprint 2: Core Multi-Tenancy & Authentication

Timeline: May 26, 2026 - June 9, 2026  
Status: Strong partial implementation; security alignment remains.

### Sprint Objective

Wire authentication screens to real login services, enforce role-based rules, and guarantee total data isolation between gyms.

### Current State

Implemented:

- Auth.js credentials login.
- Google and Discord providers.
- Signup endpoint.
- Tenant bootstrap.
- RBAC helper functions.
- Module guards.
- Branch guards.
- Dashboard route protection.
- Tenant-scoped API queries.

Missing or incomplete:

- Supabase Row Level Security policies are not documented/implemented in repo.
- Workplan asks for `x-tenant-id` middleware; current implementation uses session/JWT tenant context.
- Cross-tenant validation evidence is missing.
- Role seeds for Branch Manager, Trainer, Cashier, and Auditor are not formalized.

### Task 2.1: Decide Tenant Header vs Session Context

**Files:**

- Create: `docs/workplan2/sprint-2-tenant-isolation-decision.md`
- Modify: `plan.md`

- [ ] Document the current approach:
  - Tenant comes from authenticated session/JWT.
  - Client-provided `x-tenant-id` is not trusted for user dashboard APIs.
  - Optional `x-tenant-id` may only be allowed for machine-to-machine APIs after signature/API-key validation.

- [ ] Include explicit mapping to Workplan 2.0:
  - If the evaluator requires `x-tenant-id`, implement it only as a validated compatibility path.
  - Default app behavior remains session-based to reduce tenant spoofing risk.

### Task 2.2: Add Role Seeds

**Files:**

- Modify: `scripts/seed-dev.mjs`
- Modify: `scripts/seed-dev.test.mjs`
- Modify: `lib/auth/tenant-context.ts` if bootstrap should create defaults

- [ ] Add default roles:
  - Owner
  - Branch Manager
  - Trainer
  - Cashier
  - Auditor

- [ ] Add permissions matching module responsibilities:
  - `dashboard.read`
  - `memberships.manage`
  - `access.manage`
  - `finance.manage`
  - `pos.manage`
  - `inventory.manage`
  - `hr.manage`
  - `marketing.manage`
  - `specialists.manage`
  - `admin.manage`
  - `catalog.manage`
  - `purchases.manage`
  - `warehouse.manage`
  - `accounting.manage`
  - `payroll.manage`
  - `analytics.manage`
  - `integrations.manage`
  - `maintenance.manage`

- [ ] Add tests verifying each required role exists.

### Task 2.3: Add RLS Documentation and SQL Policy Plan

**Files:**

- Create: `docs/workplan2/supabase-rls-plan.md`
- Optional Create: `prisma/rls/supabase-policies.sql`

- [ ] Document required RLS policy pattern per tenant-owned table.

- [ ] Include SQL policy examples for:
  - `tenants`
  - `branches`
  - `users`
  - `members`
  - `membership_plans`
  - `subscriptions`
  - `invoices`
  - `payments`
  - `products`
  - `warehouses`
  - `inventory_items`
  - `sales`

- [ ] Do not run live Supabase policy changes without explicit confirmation and ready credentials.

### Task 2.4: Cross-Tenant Validation Tests

**Files:**

- Create: `scripts/tenant-isolation.test.mjs`
- Modify: `package.json`

- [ ] Add test cases:
  - User from tenant A cannot access tenant B branch.
  - User from tenant A cannot create member in tenant B branch.
  - Disabled module returns `MODULE_DISABLED`.
  - Missing permission returns `PERMISSION_DENIED`.

- [ ] Add script:

```json
"test:tenant-isolation": "node --experimental-strip-types --test scripts/tenant-isolation.test.mjs"
```

### Sprint 2 Acceptance Criteria

- [ ] Login/signup work with real APIs.
- [ ] Required roles are seeded or documented.
- [ ] Tenant isolation has automated tests.
- [ ] RLS strategy is documented and ready for Supabase implementation.
- [ ] Header-based tenant behavior is explicitly accepted, rejected, or safely scoped.
- [ ] `pnpm test:tenant-isolation`, `pnpm test:auth`, `pnpm test:api`, `pnpm typecheck`, and `pnpm build` pass.

---

## Sprint 3: Core Gym Operations

Timeline: June 9, 2026 - June 23, 2026  
Status: Completed.

### Sprint Objective

Replace mock files for subscriptions, access control checkpoints, and retail transactions with live database-driven business logic.

### Current State

Implemented:

- Membership, subscription, access device, product, warehouse, inventory, POS, sale, and payment models.
- GET/POST APIs for members, plans, devices, products, warehouses, sales, stock items, and movements.
- Summary pages read live aggregate data.
- Membership lifecycle endpoints for pausing, cancelling, and reactivating.
- Hardware access checkpoints check device online status and subscription status.
- POS checkout UI connected to sales POST API.
- Stock items automatically decremented on POS checkout.
- Audit logging on outbox events.
- Live interactive panels and simulators in memberships and access pages.

### Task 3.1: Membership Lifecycle APIs

**Files:**

- Create: `app/api/memberships/subscriptions/route.ts`
- Create: `app/api/memberships/subscriptions/[subscriptionId]/pause/route.ts`
- Create: `app/api/memberships/subscriptions/[subscriptionId]/cancel/route.ts`
- Modify: `scripts/api.test.mjs`

- [x] Implement `GET /api/memberships/subscriptions`.
- [x] Implement `POST /api/memberships/subscriptions`.
- [x] Implement pause endpoint.
- [x] Implement cancel endpoint.
- [x] Validate tenant ownership for member and plan IDs.
- [x] Add tests for active, paused, cancelled, and past due subscriptions.

### Task 3.2: Access Validation Endpoint

**Files:**

- Create: `app/api/access/validate/route.ts`
- Modify: `lib/db/mongo-models.ts` if telemetry fields need adjustment
- Modify: `scripts/api.test.mjs`

- [x] Implement `POST /api/access/validate`.

Expected request:

```json
{
  "memberId": "member_id",
  "branchId": "branch_id",
  "deviceCode": "FRONT_QR_01"
}
```

Expected response:

```json
{
  "allowed": true,
  "reason": "ACTIVE_SUBSCRIPTION"
}
```

- [x] Return `allowed: false` for missing, cancelled, expired, or past due subscription.
- [x] Write access telemetry to Mongo when `MONGODB_URI` is available.
- [x] Keep response lightweight for hardware use.

### Task 3.3: POS Transaction Service

**Files:**

- Create: `lib/api/pos-service.ts`
- Modify: `app/api/pos/sales/route.ts`
- Modify: `scripts/api.test.mjs`

- [x] Move sale creation into a service.
- [x] Use a Prisma transaction.
- [x] Validate cash session belongs to tenant/branch and is open.
- [x] Validate stock exists for each product.
- [x] Create sale and sale items.
- [x] Decrement `InventoryItem.quantityOnHand`.
- [x] Create `Payment` for paid sale.
- [x] Create `InventoryMovement` rows of type `SALE`.
- [x] Create `OutboxEvent` for audit/analytics.

### Task 3.4: Operational UI for Memberships, Access, Inventory, POS

**Files:**

- Modify: `app/[locale]/(dashboard)/memberships/page.tsx`
- Modify: `app/[locale]/(dashboard)/access/page.tsx`
- Modify: `app/[locale]/(dashboard)/inventory/page.tsx`
- Modify: `app/[locale]/(dashboard)/pos/page.tsx`
- Create focused client components under `components/modules/*`

- [x] Memberships page: member list, plan list, create plan/member forms.
- [x] Access page: validation test form and device list.
- [x] Inventory page: stock table, movement form, low-stock warnings.
- [x] POS page: checkout interface with product search, cart, totals, and submit.

### Sprint 3 Acceptance Criteria

- [x] Membership lifecycle reads/writes real DB records.
- [x] Access validation returns true/false with reason.
- [x] POS sale decrements inventory exactly.
- [x] Inventory movement history is written.
- [x] Operational pages no longer rely only on static configs.
- [x] Audit/outbox events are created for critical operations.
- [x] `pnpm test:api`, `pnpm typecheck`, `pnpm build`, and accessibility checks pass.

---

## Sprint 4: Human Resources & Specialist Models

Timeline: June 23, 2026 - July 7, 2026  
Status: Completed.

### Sprint Objective

Connect internal staff operations, daily employee time clocks, and specialized commission calculations for independent gym trainers.

### Current State

Implemented:

- Employee, contract, attendance, payroll, specialist, session, contract, service, settlement models.
- GET/POST API for employees.
- GET/POST API for payroll periods/items.
- GET/POST API for specialists.
- Summary pages for HR, payroll, and specialists.
- Digital clock-in/out checador attendance endpoints and dialogs.
- Employee intake with contract model.
- Specialist contract scheme splits and payout settlements.

Missing or incomplete:

- Branch budget controls (omitted from scope).
- Dynamic payroll and contractor dashboards.

### Task 4.1: Attendance Time Clock

**Files:**

- Create: `app/api/hr/attendance/clock-in/route.ts`
- Create: `app/api/hr/attendance/clock-out/route.ts`
- Create: `app/api/hr/attendance/route.ts`
- Modify: `scripts/api.test.mjs`

- [x] Implement clock-in with employee/branch ownership validation.
- [x] Reject double clock-in if open attendance exists.
- [x] Implement clock-out only for open attendance.
- [x] Return clear errors for missing employee, wrong branch, or no open record.

### Task 4.2: Branch Budget Controls

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `app/api/hr/branch-budgets/route.ts`
- Modify: `scripts/api.test.mjs`

- [ ] Add a tenant/branch budget model if required by product scope.
- [ ] Track payroll budget and specialist budget by period.
- [ ] Validate budgets are non-negative.
- [ ] Show budget usage in HR summaries.

### Task 4.3: Specialist Settlement Engine

**Files:**

- Create: `lib/api/specialist-settlement-service.ts`
- Create: `app/api/specialists/settlements/route.ts`
- Modify: `scripts/api.test.mjs`

- [x] Calculate fixed rent settlements.
- [x] Calculate commission settlements.
- [x] Support hybrid contracts.
- [x] Use Decimal-safe calculations.
- [x] Create settlement and settlement items in one transaction.
- [x] Add tests for exact 85/15 split and fixed rent deductions.

### Task 4.4: HR and Specialist UI

**Files:**

- Modify: `app/[locale]/(dashboard)/hr/page.tsx`
- Modify: `app/[locale]/(dashboard)/specialists/page.tsx`
- Create: `components/modules/hr/*`
- Create: `components/modules/specialists/*`

- [x] HR page: employee table, employee form, clock-in/clock-out controls, attendance list.
- [x] Specialists page: specialist list, contract view, settlement calculator, settlement table.
- [x] Display exact financial breakdowns.

### Sprint 4 Acceptance Criteria

- [x] Time clock works and blocks invalid double clock-in.
- [x] HR page displays real attendance counts.
- [x] Specialist settlements calculate fixed rent and commission correctly.
- [x] Settlement records are persisted.
- [x] UI shows exact automated financial breakdowns.
- [x] `pnpm test:api`, `pnpm typecheck`, `pnpm build`, and accessibility checks pass.

---

## Sprint 5: Marketing Funnels & Financial Reconciliation

Timeline: July 7, 2026 - July 21, 2026  
Status: Model foundation exists; functional systems are mostly pending.

### Sprint Objective

Implement automated customer relations tools alongside cash flow reconciliation engines to manage branch revenues and reduce member churn.

### Current State

Implemented:

- CRM profile Mongoose model.
- Analytics snapshot Mongoose model.
- Finance invoices/payments models and APIs.
- Marketing and analytics summaries.
- Outbox model.

Missing or incomplete:

- Sales funnel tracking.
- Churn algorithm based on attendance.
- Renewal reminder simulation.
- Accounts receivable workflow.
- Bank reconciliation ledger streams.
- Marketing/finance UI filters and live charts.

### Task 5.1: CRM Funnel Models and APIs

**Files:**

- Modify: `lib/db/mongo-models.ts`
- Create: `app/api/marketing/crm-profiles/route.ts`
- Create: `app/api/marketing/funnels/route.ts`
- Modify: `scripts/api.test.mjs`

- [ ] Add or extend CRM fields for funnel stage, last contact, and owner.
- [ ] Implement CRM profile list/create/update endpoints.
- [ ] Validate tenant scope.
- [ ] Add tests for tenant-scoped CRM reads.

### Task 5.2: Churn Risk Algorithm

**Files:**

- Create: `lib/api/churn-service.ts`
- Create: `app/api/analytics/churn/route.ts`
- Modify: `scripts/api.test.mjs`

- [ ] Calculate churn risk from:
  - Low attendance.
  - Failed payments.
  - Past due subscriptions.
  - Upcoming expiration.

- [ ] Return a score and reason list per member.
- [ ] Store snapshots in Mongo when available.

### Task 5.3: Renewal Reminder Automation

**Files:**

- Create: `scripts/run-renewal-reminders.mjs`
- Create: `scripts/renewal-reminders.test.mjs`
- Modify: `package.json`

- [ ] Find subscriptions expiring within 7 days.
- [ ] Print deterministic Email/SMS simulation messages.
- [ ] Create outbox events for reminders.
- [ ] Add test script:

```json
"test:renewals": "node --test scripts/renewal-reminders.test.mjs"
```

### Task 5.4: Accounts Receivable and Reconciliation

**Files:**

- Create: `lib/api/reconciliation-service.ts`
- Create: `app/api/finance/reconciliation/route.ts`
- Modify: `scripts/api.test.mjs`

- [ ] Aggregate issued/overdue invoices.
- [ ] Match succeeded payments to invoices.
- [ ] Mark reconciliation status in response.
- [ ] Do not mutate financial records unless endpoint explicitly confirms reconciliation.

### Task 5.5: Marketing and Finance UI

**Files:**

- Modify: `app/[locale]/(dashboard)/marketing/page.tsx`
- Modify: `app/[locale]/(dashboard)/finance/page.tsx`
- Create: `components/modules/marketing/*`
- Create: `components/modules/finance/*`

- [ ] Marketing page: CRM table, churn risk panel, reminder simulation view.
- [ ] Finance page: AR table, payment matching, reconciliation status, filters.
- [ ] Charts must respond to filter changes.

### Sprint 5 Acceptance Criteria

- [ ] CRM profiles are tenant-scoped.
- [ ] Churn endpoint returns explainable risk scores.
- [ ] Renewal reminders are generated by script and outbox.
- [ ] Reconciliation endpoint reports invoice/payment matching.
- [ ] Marketing and finance pages use live endpoints.
- [ ] `pnpm test:api`, `pnpm test:renewals`, `pnpm typecheck`, `pnpm build`, and accessibility checks pass.

---

## Sprint 6: Super-Admin SaaS Dashboard & Hardening

Timeline: July 21, 2026 - August 4, 2026  
Status: Partially scaffolded; final hardening incomplete.

### Sprint Objective

Create master SaaS tier controls, convert frontend themes to true white-label configurations, and complete final security hardening.

### Current State

Implemented:

- Admin module page exists.
- Tenant module table exists.
- Branding UI exists with localStorage persistence.
- Mongo schema exists for tenant branding config.
- Accessibility and Lighthouse scripts exist.

Missing or incomplete:

- Root super-admin control center.
- Tenant creation/freeze/license controls.
- Feature flags by tier.
- True tenant-driven white-label themes.
- Custom domain handling.
- Final hardening checklist.
- Mandatory `CHANGELOG.md`.

### Task 6.1: Super Admin Control Center

**Files:**

- Create: `app/api/super-admin/tenants/route.ts`
- Create: `app/api/super-admin/tenants/[tenantId]/route.ts`
- Create: `app/api/super-admin/tenants/[tenantId]/modules/route.ts`
- Create: `app/api/super-admin/tenants/[tenantId]/freeze/route.ts`
- Modify: `lib/auth/rbac.ts`
- Modify: `scripts/api.test.mjs`

- [ ] Define system-level permission, for example `system.tenants.manage`.
- [ ] Restrict super-admin endpoints to system-level users only.
- [ ] Implement tenant list/create/update/freeze.
- [ ] Implement module flag updates.
- [ ] Test non-system users receive `PERMISSION_DENIED`.

### Task 6.2: Tier and Feature Flag Enforcement

**Files:**

- Modify: `prisma/schema.prisma`
- Modify: `lib/api/module-access.ts`
- Create: `lib/api/plan-limits.ts`
- Modify: `scripts/api.test.mjs`

- [ ] Formalize Basic, Pro, and Enterprise plans.
- [ ] Map enabled modules and limits per tier.
- [ ] Enforce plan limits in module guards or write endpoints.
- [ ] Add tests for blocked Basic access to premium modules.

### Task 6.3: Dynamic White-Label Theming

**Files:**

- Create: `app/api/admin/branding/route.ts`
- Modify: `components/branding/brand-style-provider.tsx`
- Modify: `components/branding/branding-panel.tsx`
- Modify: `components/branding/brand-color-applier.tsx`
- Modify: `app/[locale]/layout.tsx` or dashboard layout as needed
- Modify: `lib/db/mongo-models.ts` if schema needs logo/domain fields

- [ ] Persist palette, logo text/logo URL, and optional custom domain per tenant.
- [ ] Load tenant branding server-side after auth.
- [ ] Keep local preview behavior, but save final config to backend.
- [ ] Apply branding without relying only on localStorage.
- [ ] Add validation for hex colors and safe logo URL.

### Task 6.4: Hardening and Accessibility

**Files:**

- Create: `docs/workplan2/security-hardening.md`
- Create: `docs/workplan2/accessibility-report.md`
- Create: `CHANGELOG.md`
- Modify: `testing-guidelines.md`

- [ ] Document security boundaries:
  - Tenant isolation.
  - Permission checks.
  - Branch checks.
  - RLS plan/status.
  - Secret handling.
  - PII logging rules.

- [ ] Run:

```powershell
pnpm test:db-env
pnpm test:auth
pnpm test:api
pnpm typecheck
pnpm build
pnpm check:accessibility:all
pnpm lhci:all
```

- [ ] Record results in `docs/workplan2/accessibility-report.md`.
- [ ] Create `CHANGELOG.md` with sprint-by-sprint implementation summary.

### Sprint 6 Acceptance Criteria

- [ ] Super-admin endpoints exist and are permission-protected.
- [ ] Tenants can be created, frozen, and module-gated.
- [ ] Basic/Pro/Enterprise behavior is enforced.
- [ ] Branding is loaded from tenant configuration.
- [ ] Final hardening documentation exists.
- [ ] `CHANGELOG.md` exists.
- [ ] `pnpm build`, Pa11y, and Lighthouse checks pass.

---

## Buffer & Release Phase

Timeline: August 4, 2026 - August 7, 2026  
Status: Not started.

### Objective

Validate production environment configuration, backups, documentation, and handover readiness.

### Release Tasks

- [ ] Confirm `.env.example` includes every required variable and no real secrets.
- [ ] Confirm real `.env` is not committed.
- [ ] Confirm Prisma schema validates.
- [ ] Confirm database migration strategy is documented.
- [ ] Confirm Supabase backup/RLS policy status is documented.
- [ ] Confirm MongoDB collections/indexes are documented.
- [ ] Confirm final routes and module capabilities are documented.
- [ ] Confirm presentation evidence exists:
  - screenshots
  - short recordings
  - test logs
  - build logs
  - accessibility reports
- [ ] Run final command set:

```powershell
pnpm test:db-env
pnpm test:auth
pnpm test:api
pnpm typecheck
pnpm build
pnpm check:accessibility:all
pnpm lhci:all
```

### Final Delivery Acceptance Criteria

- [ ] Repository builds without errors.
- [ ] Core workflows can be demonstrated end-to-end.
- [ ] Documentation is up to date.
- [ ] Test and accessibility evidence is collected.
- [ ] Known gaps are listed clearly.
- [ ] Final handover package is ready by August 7, 2026.

---

## Cross-Sprint Documentation Checklist

Maintain these documents as implementation progresses:

- [ ] `plan.md`: update verification log after each task group.
- [ ] `workplan.md`: update checklist status.
- [ ] `backend.md`: update backend status after new APIs/services.
- [ ] `front.md`: update frontend status after operational UI work.
- [ ] `database.md`: update schema/DB status after Prisma or Mongo changes.
- [ ] `ERP-analisis.md`: update global state after each sprint.
- [ ] `CHANGELOG.md`: create by Sprint 6 and keep final changes summarized.
- [ ] `docs/workplan2/*`: keep sprint evidence and audit reports.

## Recommended Immediate Next Steps

1. Close Sprint 1 evidence locally; CI/CD remains deferred.
2. Decide and document the `x-tenant-id` vs session-context interpretation.
3. Add tenant isolation tests.
4. Add required roles and role evidence.
5. Implement Sprint 3 operational workflows in this order:
   - memberships lifecycle
   - access validation
   - POS transaction service
   - operational UI pages

## Verification Commands Reference

Use these commands repeatedly:

```powershell
pnpm test:db-env
pnpm test:auth
pnpm test:api
pnpm typecheck
pnpm build
```

Use these before final sprint signoff:

```powershell
pnpm check:accessibility:all
pnpm lhci:all
```

Do not run live database migrations, Supabase policy changes, production seeds, provider webhooks, or external service calls without confirming credentials and environment readiness first.
