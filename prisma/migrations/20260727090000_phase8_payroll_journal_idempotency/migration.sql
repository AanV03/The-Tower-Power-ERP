DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "journal_entries"
    GROUP BY "tenantId", "sourceType", "sourceId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce journal-entry idempotency: duplicate tenant/source records exist';
  END IF;
END
$$;

CREATE UNIQUE INDEX "journal_entries_tenantId_sourceType_sourceId_key"
  ON "journal_entries"("tenantId", "sourceType", "sourceId");

DROP INDEX IF EXISTS "journal_entries_tenantId_sourceType_sourceId_idx";
