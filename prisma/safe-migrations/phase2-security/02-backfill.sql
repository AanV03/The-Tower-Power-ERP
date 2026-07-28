\set ON_ERROR_STOP on

SET lock_timeout = '5s';
SET statement_timeout = '15min';
SET search_path = public, pg_catalog;

CREATE SCHEMA IF NOT EXISTS private;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'twoFactorSecret'
  ) THEN
    RAISE EXCEPTION
      'PHASE2_BACKFILL_NOT_APPLICABLE: legacy MFA columns are absent';
  END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE
  private.backfill_phase2_sessions(batch_size integer DEFAULT 1000)
LANGUAGE plpgsql
AS $$
DECLARE
  affected_rows integer;
BEGIN
  LOOP
    WITH batch AS (
      SELECT session_row.id
      FROM "sessions" AS session_row
      WHERE session_row."jti" IS NULL
      ORDER BY session_row.id
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    ),
    tenant_context AS (
      SELECT
        batch.id AS "sessionId",
        CASE
          WHEN COUNT(membership."tenantId") = 1
          THEN MIN(membership."tenantId")
          ELSE NULL
        END AS "tenantId"
      FROM batch
      JOIN "sessions" AS session_row
        ON session_row.id = batch.id
      LEFT JOIN "tenant_memberships" AS membership
        ON membership."userId" = session_row."userId"
      GROUP BY batch.id
    )
    UPDATE "sessions" AS session_row
    SET
      "jti" = 'legacy:' || session_row.id,
      "tenantId" = COALESCE(
        session_row."tenantId",
        tenant_context."tenantId"
      ),
      "isRevoked" = true,
      "lastActivity" = COALESCE(
        session_row."lastActivity",
        CURRENT_TIMESTAMP
      )
    FROM tenant_context
    WHERE session_row.id = tenant_context."sessionId";

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    EXIT WHEN affected_rows = 0;
    COMMIT;
  END LOOP;
END;
$$;

CALL private.backfill_phase2_sessions(1000);
DROP PROCEDURE private.backfill_phase2_sessions(integer);

INSERT INTO "security_events" (
  "id",
  "tenantId",
  "userId",
  "eventType",
  "metadata",
  "createdAt"
)
SELECT
  'phase2-mfa-' || md5(user_row.id),
  membership_context."tenantId",
  user_row.id,
  'ACCOUNT_LOCKED'::"SecurityEventType",
  jsonb_build_object(
    'reason',
    'LEGACY_MFA_REENROLLMENT_REQUIRED',
    'migration',
    'phase2-security'
  ),
  CURRENT_TIMESTAMP
FROM "users" AS user_row
LEFT JOIN LATERAL (
  SELECT
    CASE
      WHEN COUNT(membership."tenantId") = 1
      THEN MIN(membership."tenantId")
      ELSE NULL
    END AS "tenantId"
  FROM "tenant_memberships" AS membership
  WHERE membership."userId" = user_row.id
) AS membership_context ON true
WHERE
  user_row."twoFactorEnabled" = true
  OR user_row."twoFactorSecret" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

CREATE OR REPLACE PROCEDURE
  private.suspend_legacy_mfa_users(batch_size integer DEFAULT 500)
LANGUAGE plpgsql
AS $$
DECLARE
  affected_rows integer;
BEGIN
  LOOP
    WITH batch AS (
      SELECT user_row.id
      FROM "users" AS user_row
      WHERE (
        user_row."twoFactorEnabled" = true
        OR user_row."twoFactorSecret" IS NOT NULL
      )
      AND user_row."status" <> 'SUSPENDED'
      ORDER BY user_row.id
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    UPDATE "users" AS user_row
    SET
      "status" = 'SUSPENDED',
      "updatedAt" = CURRENT_TIMESTAMP
    FROM batch
    WHERE user_row.id = batch.id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    EXIT WHEN affected_rows = 0;
    COMMIT;
  END LOOP;
END;
$$;

CALL private.suspend_legacy_mfa_users(500);
DROP PROCEDURE private.suspend_legacy_mfa_users(integer);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "sessions" WHERE "jti" IS NULL
  ) THEN
    RAISE EXCEPTION
      'PHASE2_BACKFILL_INCOMPLETE: sessions.jti still contains NULL';
  END IF;

  IF EXISTS (
    SELECT "jti"
    FROM "sessions"
    GROUP BY "jti"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'PHASE2_BACKFILL_INVALID: duplicate sessions.jti values';
  END IF;
END;
$$;
