# Workplan 2.0 Release Phase Evidence

Date: 2026-07-27
Status: Deployment baseline and backend CI prepared

## Evidence

- Backend workflow: `.github/workflows/backend.yml`
- Safe Phase 2 scripts:
  `prisma/safe-migrations/phase2-security/`
- Prisma migration history: `prisma/migrations/`
- RLS installation: `prisma/rls.sql`
- Isolation test: `scripts/tenant-isolation.test.mjs`
- Session test: `scripts/session-revocation.test.mjs`

## Standard Deployment

Use this path when Prisma reports that Phase 2 is already applied:

```bash
npm ci
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 -f prisma/rls.sql
```

Do not edit or replace an already-applied migration. Prisma records its
checksum and will report drift if its SQL changes.

## Legacy Phase 2 Baseline

Use this only when the database contains the pre-Phase-2 schema and
`20260726041423_phase2_security_audit` is not recorded as applied.

1. Create and verify a restorable database backup.
2. Stop writes that create legacy sessions or change MFA state.
3. Run the expand script:

```bash
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 \
  -f prisma/safe-migrations/phase2-security/01-expand.sql
```

4. Keep authentication writes stopped and run the batched backfill:

```bash
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 \
  -f prisma/safe-migrations/phase2-security/02-backfill.sql
```

Legacy sessions are revoked. Accounts containing plaintext legacy MFA
secrets are suspended and require controlled MFA re-enrollment.

5. Verify all affected users are either suspended or have an enabled
`mfa_credentials` record.
6. Run the contract script:

```bash
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 \
  -f prisma/safe-migrations/phase2-security/03-contract.sql
```

7. Baseline the equivalent historical migration, then deploy the
remaining migrations:

```bash
npx prisma migrate resolve \
  --applied 20260726041423_phase2_security_audit
npx prisma migrate deploy
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 -f prisma/rls.sql
```

8. Deploy the new application version, run authentication smoke tests,
and only then restore normal traffic.

## Release Gate

Deployment is accepted only when these commands finish successfully:

```bash
npm run typecheck
npm run test:auth
npm run test:api
node --experimental-strip-types --test \
  scripts/tenant-isolation.test.mjs
npm run test:session
npm run test:e2e
```

The contract step must not be forced past a failed precondition. Restore
the backup or correct the affected data, then rerun the step.
