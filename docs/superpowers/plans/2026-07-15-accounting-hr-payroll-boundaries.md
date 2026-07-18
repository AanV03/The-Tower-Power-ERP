# Accounting, HR, and Payroll Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `/accounting`, `/hr`, and `/payroll` so each module has a clear business responsibility, role model, permission surface, and UI/UX contract.

**Architecture:** Keep HR as the source of people, contracts, and attendance. Keep Payroll as the period-based calculation, approval, and payment workflow that consumes HR and specialist settlement data. Keep Accounting as the ledger/journal layer that receives traceable source events from Payroll and other financial modules. Specialist logic remains as it works today: specialists can be paid through settlements/commissions, and the future model where the gym hires specialists and charges users is explicitly out of scope for this refactor.

**Tech Stack:** Next.js App Router, React Server Components, Prisma, NextAuth, TypeScript, shadcn/ui-style components, Node test scripts under `scripts/`.

## Global Constraints

- Do not change the current specialist business model beyond clarifying how Payroll presents existing specialist commissions.
- Do not implement the future model where the gym hires specialists and charges members in this refactor.
- Do not remove existing demo data paths until replacement API-backed screens are working.
- Preserve tenant and branch scoping in all new or modified API paths.
- Replace broad `*.manage` checks with action-specific permissions where a workflow creates, approves, posts, pays, or voids records.
- Keep `/hr` focused on employee master data, contracts, and attendance capture.
- Keep `/payroll` focused on periods, receipts, calculations, approval readiness, and payment state.
- Keep `/accounting` focused on chart of accounts, journal entries, posting, voiding, and source traceability.

---

## File Structure

- Modify `data/navigation.ts`: rename module labels/descriptions so HR no longer promises payroll and Payroll no longer sounds like HR administration.
- Modify `data/modules.ts`: update generic module metadata and dashboard summaries to reflect the new boundaries.
- Modify `lib/api/module-access.ts`: keep module-level access for navigation, but prepare action-specific permission usage.
- Modify `lib/api/context.ts`: remove or gate demo RBAC bypass before relying on action permissions outside local demo mode.
- Modify `prisma/seed.ts`: rebalance roles and seed granular permissions by realistic responsibility.
- Modify `lib/auth/tenant-context.ts`: align bootstrap tenant permissions with the revised permission model.
- Modify `components/modules/hr/hr-client.tsx`: adjust copy, metrics, tabs, and footer guidance to HR-only responsibilities.
- Modify `components/modules/hr/hr-dashboard.tsx`: remove payroll period awareness from HR summaries.
- Modify `app/api/hr/time-clock/route.ts`: make `hr.attendance.write` required for clock writes and `hr.read` for reads.
- Review `app/api/hr/attendance/route.ts`: either deprecate in favor of `timeClock` or route it through the same canonical attendance service.
- Modify `components/modules/payroll/payroll-dashboard.tsx`: present HR and specialist data as payroll inputs, not editable HR data.
- Modify `components/modules/payroll/config.ts`: clarify payroll copy and labels.
- Modify `components/modules/payroll/payroll-action-bar.tsx`: split period creation, preview, approval, and export by permission/action.
- Modify `app/api/payroll/periods/route.ts`: require `payroll.read` for GET and `payroll.period.write` for POST.
- Modify `app/api/payroll/items/route.ts`: require `payroll.read` for GET and `payroll.receipt.write` for POST.
- Modify `app/api/payroll/periods/[periodId]/preview/route.ts`: require `payroll.preview`; keep existing specialist settlement behavior but label source as specialist payout data.
- Create `app/api/payroll/periods/[periodId]/approve/route.ts`: approve draft periods with `payroll.approve`.
- Create `app/api/payroll/periods/[periodId]/pay/route.ts`: mark approved periods as paid with `payroll.pay`.
- Modify `app/[locale]/(dashboard)/accounting/page.tsx`: replace demo-only controller path with API-backed loader while retaining demo fallback if no accounts exist.
- Modify `app/api/accounting/accounts/route.ts`: require `accounting.read` for GET and `accounting.account.write` for POST.
- Modify `app/api/accounting/journal-entries/route.ts`: validate double-entry balance; require `accounting.read`, `accounting.journal.write`, and `accounting.post` based on action.
- Create `app/api/accounting/journal-entries/[journalEntryId]/void/route.ts`: void posted entries with `accounting.void`.
- Create `lib/accounting/payroll-posting.ts`: convert approved or paid payroll periods into traceable journal entry payloads.
- Add or update tests in `scripts/api.test.mjs`, `scripts/rbac.test.mjs`, `scripts/payroll-demo-controller.test.mjs`, and a new `scripts/accounting-payroll-posting.test.mjs`.

---

## Task 1: Product Boundary Copy and Navigation

**Files:**
- Modify: `data/navigation.ts`
- Modify: `data/modules.ts`
- Modify: `components/modules/hr/hr-client.tsx`
- Modify: `components/modules/payroll/config.ts`

**Interfaces:**
- Consumes: existing `ModuleId`, `navigationItems`, `moduleConfigs`, `hrLabels`, `payrollLabels`.
- Produces: user-facing copy that separates HR, Payroll, and Accounting before permissions or data changes.

- [ ] **Step 1: Write the failing navigation assertion**

Add assertions to `scripts/navigation.test.mjs` that enforce the new Spanish labels and descriptions:

```js
assert.equal(hr.labels.es, "Recursos Humanos");
assert.equal(hr.description.es, "Expedientes, contratos y asistencia del personal.");
assert.equal(payroll.labels.es, "Nomina");
assert.equal(payroll.description.es, "Periodos, recibos, deducciones, comisiones y pagos.");
assert.equal(accounting.labels.es, "Contabilidad");
assert.equal(accounting.description.es, "Catalogo de cuentas, polizas y partida doble.");
```

- [ ] **Step 2: Run the focused test**

Run: `node --test scripts/navigation.test.mjs`

Expected: FAIL because HR still says `RH y nomina` and mentions commissions.

- [ ] **Step 3: Update navigation copy**

In `data/navigation.ts`, set:

```ts
// hr
labels: { es: "Recursos Humanos", en: "Human Resources", fr: "Ressources humaines" },
description: {
  es: "Expedientes, contratos y asistencia del personal.",
  en: "Employee records, contracts, and staff attendance.",
  fr: "Dossiers employes, contrats et presence du personnel.",
}

// payroll
labels: { es: "Nomina", en: "Payroll", fr: "Paie" },
description: {
  es: "Periodos, recibos, deducciones, comisiones y pagos.",
  en: "Periods, receipts, deductions, commissions, and payments.",
  fr: "Periodes, recus, deductions, commissions et paiements.",
}
```

- [ ] **Step 4: Update module metadata**

In `data/modules.ts`, change HR title/subtitle/metrics so it no longer says `RH y nomina`, `nomina`, or `comisiones`. Payroll may still mention commissions because existing specialist and employee commission logic remains in Payroll.

- [ ] **Step 5: Update screen copy**

In `components/modules/hr/hr-client.tsx`, keep:

```ts
title: "Recursos Humanos",
subtitle: "Expedientes, contratos y asistencia diaria con vista operativa por sucursal.",
```

In `components/modules/payroll/config.ts`, keep:

```ts
title: "Nomina",
subtitle: "Periodos, recibos, deducciones, comisiones y cierre de pago.",
```

- [ ] **Step 6: Verify**

Run: `node --test scripts/navigation.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add data/navigation.ts data/modules.ts components/modules/hr/hr-client.tsx components/modules/payroll/config.ts scripts/navigation.test.mjs
git commit -m "refactor: clarify hr payroll accounting module boundaries"
```

---

## Task 2: Permission Matrix and Role Rebalance

**Files:**
- Modify: `lib/api/module-access.ts`
- Modify: `lib/api/context.ts`
- Modify: `lib/auth/tenant-context.ts`
- Modify: `prisma/seed.ts`
- Modify: `scripts/rbac.test.mjs`
- Modify: `scripts/api.test.mjs`

**Interfaces:**
- Consumes: `requireApiContext(options)`, seeded permission keys, existing role names.
- Produces: action-specific permission keys available to APIs and seeded roles.

- [ ] **Step 1: Write permission tests**

In `scripts/rbac.test.mjs`, assert these permissions exist in seeded role definitions or generated permission lists:

```js
const required = [
  "hr.read",
  "hr.employee.write",
  "hr.contract.write",
  "hr.attendance.write",
  "payroll.read",
  "payroll.period.write",
  "payroll.receipt.write",
  "payroll.preview",
  "payroll.approve",
  "payroll.pay",
  "accounting.read",
  "accounting.account.write",
  "accounting.journal.write",
  "accounting.post",
  "accounting.void",
];

for (const permission of required) {
  assert.equal(allPermissionKeys.includes(permission), true, `${permission} is seeded`);
}
```

- [ ] **Step 2: Run RBAC tests**

Run: `node --test scripts/rbac.test.mjs scripts/api.test.mjs`

Expected: FAIL because custom action permissions are not yet modeled.

- [ ] **Step 3: Add explicit permission lists**

In `prisma/seed.ts`, add a constant:

```ts
const BUSINESS_PERMISSIONS = [
  "hr.read",
  "hr.employee.write",
  "hr.contract.write",
  "hr.attendance.write",
  "payroll.read",
  "payroll.period.write",
  "payroll.receipt.write",
  "payroll.preview",
  "payroll.approve",
  "payroll.pay",
  "accounting.read",
  "accounting.account.write",
  "accounting.journal.write",
  "accounting.post",
  "accounting.void",
] as const;
```

Include `...BUSINESS_PERMISSIONS` in `ALL_PERMISSIONS`.

- [ ] **Step 4: Rebalance demo roles**

Set role intent:

```ts
// Auditor
permissions: withDashboardRead([
  "finance.read",
  "accounting.read",
  "payroll.read",
  "analytics.read",
  "inventory.read",
  "integrations.read",
])

// Entrenador
permissions: withDashboardRead([
  "memberships.read",
  "access.read",
  "hr.read",
  "hr.attendance.write",
  "specialists.read",
])
```

Owner and Super Admin keep all permissions.

- [ ] **Step 5: Align self-service tenant bootstrap**

In `lib/auth/tenant-context.ts`, include the same business permissions in `DEFAULT_PERMISSIONS` for the Owner role.

- [ ] **Step 6: Gate demo bypass**

In `lib/api/context.ts`, replace:

```ts
const DEMO_MODE_GUARD_BYPASS = true;
```

with:

```ts
const DEMO_MODE_GUARD_BYPASS = process.env.GERPY_DEMO_RBAC_BYPASS === "true";
```

- [ ] **Step 7: Verify**

Run:

```bash
node --test scripts/rbac.test.mjs scripts/api.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add lib/api/module-access.ts lib/api/context.ts lib/auth/tenant-context.ts prisma/seed.ts scripts/rbac.test.mjs scripts/api.test.mjs
git commit -m "refactor: add action specific permissions"
```

---

## Task 3: HR as People and Attendance Source

**Files:**
- Modify: `components/modules/hr/hr-dashboard.tsx`
- Modify: `components/modules/hr/hr-client.tsx`
- Modify: `app/api/hr/time-clock/route.ts`
- Review/modify: `app/api/hr/attendance/route.ts`

**Interfaces:**
- Consumes: `Employee`, `EmployeeContract`, `TimeClock`.
- Produces: HR UI and APIs that do not depend on payroll period state.

- [ ] **Step 1: Write HR API permission tests**

Add tests that document route permission intent:

```js
assert.equal(resolveRoutePermission("GET", "/api/hr/time-clock"), "hr.read");
assert.equal(resolveRoutePermission("POST", "/api/hr/time-clock"), "hr.attendance.write");
assert.equal(resolveRoutePermission("GET", "/api/hr/employees"), "hr.read");
assert.equal(resolveRoutePermission("POST", "/api/hr/employees"), "hr.employee.write");
```

- [ ] **Step 2: Run tests**

Run: `node --test scripts/api.test.mjs`

Expected: FAIL until route permission mapping is implemented.

- [ ] **Step 3: Remove payroll awareness from HR summaries**

In `components/modules/hr/hr-dashboard.tsx`, keep only:

```ts
const [employees, positions, timeClocks, activeEmployees, attendanceToday, openAttendance] = await Promise.all([...]);
```

Do not query `payrollPeriod` in HR summary code.

- [ ] **Step 4: Fix duplicated HR metrics**

In `components/modules/hr/hr-client.tsx`, replace the duplicate open attendance metric with a contract health metric once available. Until contract health is implemented, use:

```tsx
<MetricCard label="Contratos visibles" value={String(initialContracts.length)} change="Expedientes" locale={locale} />
```

- [ ] **Step 5: Apply route permissions**

In `app/api/hr/time-clock/route.ts`, use:

```ts
const context = await requireApiContext({ moduleId: "hr", permission: "hr.read" });
```

for GET, and:

```ts
const context = await requireApiContext({ moduleId: "hr", permission: "hr.attendance.write" });
```

for POST.

- [ ] **Step 6: Decide canonical attendance endpoint**

Use `TimeClock` as canonical because Payroll preview already consumes `timeClocks`. Update `app/api/hr/attendance/route.ts` to either delegate to `TimeClock` behavior or return a clear deprecation response with migration guidance for internal callers.

- [ ] **Step 7: Verify**

Run:

```bash
node --test scripts/api.test.mjs scripts/rbac.test.mjs
npm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add components/modules/hr/hr-dashboard.tsx components/modules/hr/hr-client.tsx app/api/hr/time-clock/route.ts app/api/hr/attendance/route.ts scripts/api.test.mjs
git commit -m "refactor: keep hr focused on people and attendance"
```

---

## Task 4: Payroll as Period Calculation and Approval Workflow

**Files:**
- Modify: `components/modules/payroll/payroll-dashboard.tsx`
- Modify: `components/modules/payroll/payroll-action-bar.tsx`
- Modify: `components/modules/payroll/config.ts`
- Modify: `app/api/payroll/periods/route.ts`
- Modify: `app/api/payroll/items/route.ts`
- Modify: `app/api/payroll/periods/[periodId]/preview/route.ts`
- Create: `app/api/payroll/periods/[periodId]/approve/route.ts`
- Create: `app/api/payroll/periods/[periodId]/pay/route.ts`

**Interfaces:**
- Consumes: HR employees/contracts/time clocks, current specialist settlement and commission logic.
- Produces: period workflow with explicit preview, approval, and paid transitions.

- [ ] **Step 1: Write workflow tests**

Add tests for valid transitions:

```js
assert.deepEqual(validPayrollTransition("DRAFT", "APPROVED"), { ok: true });
assert.deepEqual(validPayrollTransition("APPROVED", "PAID"), { ok: true });
assert.deepEqual(validPayrollTransition("DRAFT", "PAID"), { ok: false, code: "PAYROLL_PERIOD_NOT_APPROVED" });
assert.deepEqual(validPayrollTransition("PAID", "DRAFT"), { ok: false, code: "PAYROLL_PERIOD_LOCKED" });
```

- [ ] **Step 2: Run tests**

Run: `node --test scripts/payroll-demo-controller.test.mjs scripts/api.test.mjs`

Expected: FAIL until transition helper/routes exist.

- [ ] **Step 3: Apply route permissions**

Use these permissions:

```ts
GET /api/payroll/periods -> payroll.read
POST /api/payroll/periods -> payroll.period.write
GET /api/payroll/items -> payroll.read
POST /api/payroll/items -> payroll.receipt.write
POST /api/payroll/periods/[periodId]/preview -> payroll.preview
POST /api/payroll/periods/[periodId]/approve -> payroll.approve
POST /api/payroll/periods/[periodId]/pay -> payroll.pay
```

- [ ] **Step 4: Keep specialist behavior but clarify source**

In `app/api/payroll/periods/[periodId]/preview/route.ts`, keep `resolveSpecialistPayrollEmployee` and existing commission calculations. Add a returned preview field:

```ts
sourceLabel: input.source === "SPECIALIST" ? "Especialista / comision" : "Empleado",
```

Do not design the future hired-specialist/member-charge model here.

- [ ] **Step 5: Add approval route**

Create `approve/route.ts` that:

```ts
const context = await requireApiContext({ moduleId: "payroll", permission: "payroll.approve" });
```

Then updates only matching draft periods:

```ts
await prisma.payrollPeriod.updateMany({
  where: { id: periodId, tenantId: context.tenantId, status: "DRAFT" },
  data: { status: "APPROVED" },
});
```

Return conflict if no row changed.

- [ ] **Step 6: Add pay route**

Create `pay/route.ts` that:

```ts
const context = await requireApiContext({ moduleId: "payroll", permission: "payroll.pay" });
```

Then updates only approved periods:

```ts
await prisma.payrollPeriod.updateMany({
  where: { id: periodId, tenantId: context.tenantId, status: "APPROVED" },
  data: { status: "PAID" },
});
```

Return conflict if no row changed.

- [ ] **Step 7: Update UI actions**

In `payroll-action-bar.tsx`, show primary actions in workflow order:

```txt
Crear periodo -> Vista previa -> Aprobar periodo -> Marcar pagado -> Exportar
```

Disable approval when readiness has missing receipts or open attendances.

- [ ] **Step 8: Verify**

Run:

```bash
node --test scripts/payroll-demo-controller.test.mjs scripts/api.test.mjs
npm run lint
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add components/modules/payroll app/api/payroll scripts/payroll-demo-controller.test.mjs scripts/api.test.mjs
git commit -m "refactor: separate payroll period approval workflow"
```

---

## Task 5: Accounting as Ledger and Payroll Posting Target

**Files:**
- Modify: `app/[locale]/(dashboard)/accounting/page.tsx`
- Modify: `app/api/accounting/accounts/route.ts`
- Modify: `app/api/accounting/journal-entries/route.ts`
- Create: `app/api/accounting/journal-entries/[journalEntryId]/void/route.ts`
- Create: `lib/accounting/payroll-posting.ts`
- Create: `scripts/accounting-payroll-posting.test.mjs`

**Interfaces:**
- Consumes: `PayrollPeriod`, `PayrollItem`, `ChartAccount`, `JournalEntry`, `JournalEntryLine`.
- Produces: balanced journal entry payloads that can be traced to a payroll period.

- [ ] **Step 1: Write double-entry validation tests**

In `scripts/accounting-payroll-posting.test.mjs`:

```js
assert.equal(isBalancedJournal([
  { debit: 100, credit: 0 },
  { debit: 0, credit: 100 },
]), true);

assert.equal(isBalancedJournal([
  { debit: 100, credit: 0 },
  { debit: 0, credit: 90 },
]), false);
```

- [ ] **Step 2: Run test**

Run: `node --test scripts/accounting-payroll-posting.test.mjs`

Expected: FAIL because helper does not exist.

- [ ] **Step 3: Create posting helper**

Create `lib/accounting/payroll-posting.ts` with:

```ts
export type JournalLineInput = {
  accountId: string;
  debit: number;
  credit: number;
};

export function isBalancedJournal(lines: JournalLineInput[]) {
  const totals = lines.reduce(
    (acc, line) => ({
      debit: acc.debit + Number(line.debit || 0),
      credit: acc.credit + Number(line.credit || 0),
    }),
    { debit: 0, credit: 0 },
  );

  return Math.round((totals.debit - totals.credit) * 100) === 0;
}
```

- [ ] **Step 4: Validate journal entry API**

In `app/api/accounting/journal-entries/route.ts`, reject unbalanced entries:

```ts
if (!isBalancedJournal(data.lines)) {
  throw new ApiError("Journal entry must be balanced before it can be saved.", 400, "JOURNAL_NOT_BALANCED");
}
```

- [ ] **Step 5: Apply route permissions**

Use:

```ts
GET /api/accounting/accounts -> accounting.read
POST /api/accounting/accounts -> accounting.account.write
GET /api/accounting/journal-entries -> accounting.read
POST /api/accounting/journal-entries -> accounting.journal.write or accounting.post based on status
POST /api/accounting/journal-entries/[journalEntryId]/void -> accounting.void
```

- [ ] **Step 6: Replace accounting demo-only page**

In `app/[locale]/(dashboard)/accounting/page.tsx`, load accounts and journal entries from the database. Keep the current demo controller only as empty-state fallback when the tenant has no chart accounts.

- [ ] **Step 7: Verify**

Run:

```bash
node --test scripts/accounting-demo-controller.test.mjs scripts/accounting-payroll-posting.test.mjs scripts/api.test.mjs
npm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add app/api/accounting app/[locale]/(dashboard)/accounting lib/accounting scripts/accounting-payroll-posting.test.mjs
git commit -m "refactor: make accounting the ledger boundary"
```

---

## Task 6: Cross-Module Dashboard Summaries

**Files:**
- Modify: `lib/api/module-summary.ts`
- Modify: `scripts/api.test.mjs`

**Interfaces:**
- Consumes: existing `hrSummary`, `payrollSummary`, `accountingSummary`.
- Produces: dashboard summaries that reinforce boundaries instead of blending modules.

- [ ] **Step 1: Write summary tests**

Assert:

```js
assert.equal(hrSummaryKeys.includes("payrollDrafts"), false);
assert.equal(payrollSummaryKeys.includes("attendance"), true);
assert.equal(accountingSummaryKeys.includes("postedEntries"), true);
```

- [ ] **Step 2: Run tests**

Run: `node --test scripts/api.test.mjs`

Expected: FAIL while HR still reports payroll draft periods.

- [ ] **Step 3: Update HR summary**

HR summary metrics:

```txt
Active staff
Attendance today
Open attendance
Contracts visible
```

- [ ] **Step 4: Update Payroll summary**

Payroll summary metrics:

```txt
Draft periods
People in payroll
Open attendance incidents
Net payroll
```

- [ ] **Step 5: Update Accounting summary**

Accounting summary metrics:

```txt
Accounts
Draft entries
Posted entries
Journal lines
```

- [ ] **Step 6: Verify**

Run:

```bash
node --test scripts/api.test.mjs
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add lib/api/module-summary.ts scripts/api.test.mjs
git commit -m "refactor: align module summaries with business boundaries"
```

---

## Task 7: End-to-End Verification Pass

**Files:**
- Verify only unless a previous task leaves a defect.

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: confidence that module separation works together.

- [ ] **Step 1: Run all focused tests**

Run:

```bash
node --test scripts/rbac.test.mjs scripts/api.test.mjs scripts/navigation.test.mjs scripts/accounting-demo-controller.test.mjs scripts/payroll-demo-controller.test.mjs scripts/accounting-payroll-posting.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Manual UX smoke test**

Start app:

```bash
npm run dev
```

Visit:

```txt
/es/hr
/es/payroll
/es/accounting
```

Expected:

```txt
HR reads as people/contracts/attendance.
Payroll reads as periods/receipts/approval/payment.
Accounting reads as chart of accounts/journal entries/posting.
Specialist commission rows in Payroll are labeled as specialist payouts, not normal HR employees.
```

- [ ] **Step 4: Commit final fixes**

Run:

```bash
git status --short
git add <only-files-changed-for-verification-fixes>
git commit -m "chore: verify accounting hr payroll separation"
```

---

## Out of Scope

- Designing the future specialist model where the gym hires the specialist and charges users.
- Replacing the full Specialists module.
- Changing commission settlement math beyond labels/source clarity in Payroll.
- Building a full accounting rules engine for all modules.
- Creating bank transfer or fiscal receipt integrations.

## Specialist Future Model Notes

The current system treats specialists as a distinct business model with settlements/commissions. Payroll can include those payouts as specialist-sourced compensation. A future refactor should model the hired-specialist scenario separately with its own discovery/spec because it changes revenue recognition, service catalog, booking, member billing, specialist compensation, and accounting posting.

## Self-Review

- Spec coverage: The plan covers navigation/copy, RBAC, HR source boundaries, Payroll workflow, Accounting ledger behavior, summaries, and verification.
- Placeholder scan: No implementation task depends on an unspecified future specialist model.
- Type consistency: Permission names are consistent across tasks and route references.
