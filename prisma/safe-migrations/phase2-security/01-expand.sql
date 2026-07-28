\set ON_ERROR_STOP on

SET lock_timeout = '5s';
SET statement_timeout = '15min';
SET search_path = public, pg_catalog;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_type.typname = 'MfaCredentialType'
      AND pg_namespace.nspname = 'public'
  ) THEN
    CREATE TYPE "MfaCredentialType" AS ENUM ('TOTP');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_type.typname = 'SecurityEventType'
      AND pg_namespace.nspname = 'public'
  ) THEN
    CREATE TYPE "SecurityEventType" AS ENUM (
      'LOGIN_FAILED',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'PASSWORD_CHANGED',
      'PASSWORD_RESET',
      'SESSION_REVOKED',
      'MFA_CHALLENGE_FAILED',
      'MFA_ENABLED',
      'MFA_DISABLED'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_type.typname = 'InvitationStatus'
      AND pg_namespace.nspname = 'public'
  ) THEN
    CREATE TYPE "InvitationStatus" AS ENUM (
      'PENDING',
      'ACCEPTED',
      'REVOKED',
      'EXPIRED'
    );
  END IF;
END;
$$;

ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "deviceInfo" JSONB,
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "isRevoked" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "jti" TEXT,
  ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP(3)
    DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

CREATE TABLE IF NOT EXISTS "mfa_credentials" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "MfaCredentialType" NOT NULL DEFAULT 'TOTP',
  "label" TEXT,
  "secretEncrypted" TEXT NOT NULL,
  "isEnabled" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "mfa_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recovery_codes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "credentialId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recovery_codes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "branchId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "oldValues" JSONB,
  "newValues" JSONB,
  "ipAddress" TEXT,
  "correlationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "security_events" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "userId" TEXT,
  "eventType" "SecurityEventType" NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_invitations" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "roleAssignments" JSONB NOT NULL,
  "branchIds" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "invitedByMembershipId" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "mfa_credentials_userId_isEnabled_idx"
  ON "mfa_credentials"("userId", "isEnabled");
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  "mfa_credentials_userId_id_key"
  ON "mfa_credentials"("userId", "id");
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  "recovery_codes_codeHash_key"
  ON "recovery_codes"("codeHash");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "recovery_codes_userId_usedAt_idx"
  ON "recovery_codes"("userId", "usedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "audit_logs_tenantId_createdAt_idx"
  ON "audit_logs"("tenantId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "audit_logs_tenantId_actorId_createdAt_idx"
  ON "audit_logs"("tenantId", "actorId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "audit_logs_tenantId_entity_entityId_idx"
  ON "audit_logs"("tenantId", "entity", "entityId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "audit_logs_tenantId_correlationId_idx"
  ON "audit_logs"("tenantId", "correlationId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "security_events_tenantId_eventType_createdAt_idx"
  ON "security_events"("tenantId", "eventType", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "security_events_tenantId_userId_createdAt_idx"
  ON "security_events"("tenantId", "userId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "security_events_ipAddress_createdAt_idx"
  ON "security_events"("ipAddress", "createdAt");
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
  "user_invitations_tokenHash_key"
  ON "user_invitations"("tokenHash");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "user_invitations_tenantId_email_status_idx"
  ON "user_invitations"("tenantId", "email", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "user_invitations_tenantId_expiresAt_idx"
  ON "user_invitations"("tenantId", "expiresAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "sessions_tenantId_userId_idx"
  ON "sessions"("tenantId", "userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  "sessions_userId_isRevoked_expires_idx"
  ON "sessions"("userId", "isRevoked", "expires");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sessions_tenantId_userId_fkey'
      AND conrelid = 'public.sessions'::regclass
  ) THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_tenantId_userId_fkey"
      FOREIGN KEY ("tenantId", "userId")
      REFERENCES "tenant_memberships"("tenantId", "userId")
      ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mfa_credentials_userId_fkey'
      AND conrelid = 'public.mfa_credentials'::regclass
  ) THEN
    ALTER TABLE "mfa_credentials"
      ADD CONSTRAINT "mfa_credentials_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recovery_codes_userId_credentialId_fkey'
      AND conrelid = 'public.recovery_codes'::regclass
  ) THEN
    ALTER TABLE "recovery_codes"
      ADD CONSTRAINT "recovery_codes_userId_credentialId_fkey"
      FOREIGN KEY ("userId", "credentialId")
      REFERENCES "mfa_credentials"("userId", "id")
      ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recovery_codes_userId_fkey'
      AND conrelid = 'public.recovery_codes'::regclass
  ) THEN
    ALTER TABLE "recovery_codes"
      ADD CONSTRAINT "recovery_codes_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'audit_logs_tenantId_actorId_fkey'
      AND conrelid = 'public.audit_logs'::regclass
  ) THEN
    ALTER TABLE "audit_logs"
      ADD CONSTRAINT "audit_logs_tenantId_actorId_fkey"
      FOREIGN KEY ("tenantId", "actorId")
      REFERENCES "tenant_memberships"("tenantId", "id")
      ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'audit_logs_tenantId_branchId_fkey'
      AND conrelid = 'public.audit_logs'::regclass
  ) THEN
    ALTER TABLE "audit_logs"
      ADD CONSTRAINT "audit_logs_tenantId_branchId_fkey"
      FOREIGN KEY ("tenantId", "branchId")
      REFERENCES "branches"("tenantId", "id")
      ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'audit_logs_tenantId_fkey'
      AND conrelid = 'public.audit_logs'::regclass
  ) THEN
    ALTER TABLE "audit_logs"
      ADD CONSTRAINT "audit_logs_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'security_events_tenantId_userId_fkey'
      AND conrelid = 'public.security_events'::regclass
  ) THEN
    ALTER TABLE "security_events"
      ADD CONSTRAINT "security_events_tenantId_userId_fkey"
      FOREIGN KEY ("tenantId", "userId")
      REFERENCES "tenant_memberships"("tenantId", "userId")
      ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'security_events_tenantId_fkey'
      AND conrelid = 'public.security_events'::regclass
  ) THEN
    ALTER TABLE "security_events"
      ADD CONSTRAINT "security_events_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname =
      'user_invitations_tenantId_invitedByMembershipId_fkey'
      AND conrelid = 'public.user_invitations'::regclass
  ) THEN
    ALTER TABLE "user_invitations"
      ADD CONSTRAINT
        "user_invitations_tenantId_invitedByMembershipId_fkey"
      FOREIGN KEY ("tenantId", "invitedByMembershipId")
      REFERENCES "tenant_memberships"("tenantId", "id")
      ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_invitations_tenantId_fkey'
      AND conrelid = 'public.user_invitations'::regclass
  ) THEN
    ALTER TABLE "user_invitations"
      ADD CONSTRAINT "user_invitations_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
  END IF;
END;
$$;
