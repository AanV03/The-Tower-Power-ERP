\set ON_ERROR_STOP on

SET lock_timeout = '5s';
SET statement_timeout = '15min';
SET search_path = public, pg_catalog;

DO $$
DECLARE
  unsafe_mfa_users boolean := false;
BEGIN
  IF EXISTS (
    SELECT 1 FROM "sessions" WHERE "jti" IS NULL
  ) THEN
    RAISE EXCEPTION
      'PHASE2_CONTRACT_BLOCKED: sessions.jti contains NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "sessions" WHERE "isRevoked" IS NULL
  ) THEN
    RAISE EXCEPTION
      'PHASE2_CONTRACT_BLOCKED: sessions.isRevoked contains NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "sessions" WHERE "lastActivity" IS NULL
  ) THEN
    RAISE EXCEPTION
      'PHASE2_CONTRACT_BLOCKED: sessions.lastActivity contains NULL';
  END IF;

  IF EXISTS (
    SELECT "jti"
    FROM "sessions"
    GROUP BY "jti"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'PHASE2_CONTRACT_BLOCKED: sessions.jti contains duplicates';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'twoFactorSecret'
  ) THEN
    EXECUTE $check$
      SELECT EXISTS (
        SELECT 1
        FROM "users" AS user_row
        WHERE (
          user_row."twoFactorEnabled" = true
          OR user_row."twoFactorSecret" IS NOT NULL
        )
        AND user_row."status" <> 'SUSPENDED'
        AND NOT EXISTS (
          SELECT 1
          FROM "mfa_credentials" AS credential
          WHERE credential."userId" = user_row.id
            AND credential."isEnabled" = true
            AND credential."revokedAt" IS NULL
        )
      )
    $check$ INTO unsafe_mfa_users;

    IF unsafe_mfa_users THEN
      RAISE EXCEPTION
        'PHASE2_CONTRACT_BLOCKED: active legacy MFA users require re-enrollment';
    END IF;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sessions_jti_not_null_check'
      AND conrelid = 'public.sessions'::regclass
  ) THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_jti_not_null_check"
      CHECK ("jti" IS NOT NULL) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sessions_isRevoked_not_null_check'
      AND conrelid = 'public.sessions'::regclass
  ) THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_isRevoked_not_null_check"
      CHECK ("isRevoked" IS NOT NULL) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sessions_lastActivity_not_null_check'
      AND conrelid = 'public.sessions'::regclass
  ) THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_lastActivity_not_null_check"
      CHECK ("lastActivity" IS NOT NULL) NOT VALID;
  END IF;
END;
$$;

ALTER TABLE "sessions"
  VALIDATE CONSTRAINT "sessions_jti_not_null_check";
ALTER TABLE "sessions"
  VALIDATE CONSTRAINT "sessions_isRevoked_not_null_check";
ALTER TABLE "sessions"
  VALIDATE CONSTRAINT "sessions_lastActivity_not_null_check";

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  "sessions_jti_key" ON "sessions"("jti");

ALTER TABLE "sessions"
  ALTER COLUMN "jti" SET NOT NULL,
  ALTER COLUMN "isRevoked" SET DEFAULT false,
  ALTER COLUMN "isRevoked" SET NOT NULL,
  ALTER COLUMN "lastActivity" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "lastActivity" SET NOT NULL;

ALTER TABLE "sessions"
  DROP CONSTRAINT IF EXISTS "sessions_jti_not_null_check",
  DROP CONSTRAINT IF EXISTS "sessions_isRevoked_not_null_check",
  DROP CONSTRAINT IF EXISTS "sessions_lastActivity_not_null_check";

ALTER TABLE "sessions"
  VALIDATE CONSTRAINT "sessions_tenantId_userId_fkey";
ALTER TABLE "mfa_credentials"
  VALIDATE CONSTRAINT "mfa_credentials_userId_fkey";
ALTER TABLE "recovery_codes"
  VALIDATE CONSTRAINT "recovery_codes_userId_credentialId_fkey";
ALTER TABLE "recovery_codes"
  VALIDATE CONSTRAINT "recovery_codes_userId_fkey";
ALTER TABLE "audit_logs"
  VALIDATE CONSTRAINT "audit_logs_tenantId_actorId_fkey";
ALTER TABLE "audit_logs"
  VALIDATE CONSTRAINT "audit_logs_tenantId_branchId_fkey";
ALTER TABLE "audit_logs"
  VALIDATE CONSTRAINT "audit_logs_tenantId_fkey";
ALTER TABLE "security_events"
  VALIDATE CONSTRAINT "security_events_tenantId_userId_fkey";
ALTER TABLE "security_events"
  VALIDATE CONSTRAINT "security_events_tenantId_fkey";
ALTER TABLE "user_invitations"
  VALIDATE CONSTRAINT
    "user_invitations_tenantId_invitedByMembershipId_fkey";
ALTER TABLE "user_invitations"
  VALIDATE CONSTRAINT "user_invitations_tenantId_fkey";

DROP INDEX CONCURRENTLY IF EXISTS "sessions_userId_idx";

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "twoFactorEnabled",
  DROP COLUMN IF EXISTS "twoFactorSecret";
