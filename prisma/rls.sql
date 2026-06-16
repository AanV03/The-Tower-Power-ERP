-- Supabase RLS policies for Gerpy multi-tenant tables.
-- The application JWT must include a tenantId claim.
-- For server-side Prisma transactions, set app.current_tenant_id when using a
-- non-bypassing database role, or connect with a role whose JWT claims are
-- populated by Supabase/PostgREST.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.jwt_claims()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

CREATE OR REPLACE FUNCTION private.current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(private.jwt_claims() ->> 'tenantId', ''),
    NULLIF(private.jwt_claims() ->> 'tenant_id', ''),
    NULLIF(current_setting('app.current_tenant_id', true), '')
  );
$$;

ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "branches" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sales" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_tenant_isolation_select ON "tenants";
DROP POLICY IF EXISTS tenants_tenant_isolation_insert ON "tenants";
DROP POLICY IF EXISTS tenants_tenant_isolation_update ON "tenants";
DROP POLICY IF EXISTS tenants_tenant_isolation_delete ON "tenants";

CREATE POLICY tenants_tenant_isolation_select
  ON "tenants"
  FOR SELECT
  USING ("id" = private.current_tenant_id());

CREATE POLICY tenants_tenant_isolation_insert
  ON "tenants"
  FOR INSERT
  WITH CHECK ("id" = private.current_tenant_id());

CREATE POLICY tenants_tenant_isolation_update
  ON "tenants"
  FOR UPDATE
  USING ("id" = private.current_tenant_id())
  WITH CHECK ("id" = private.current_tenant_id());

CREATE POLICY tenants_tenant_isolation_delete
  ON "tenants"
  FOR DELETE
  USING ("id" = private.current_tenant_id());

DROP POLICY IF EXISTS users_tenant_isolation_select ON "users";
DROP POLICY IF EXISTS users_tenant_isolation_insert ON "users";
DROP POLICY IF EXISTS users_tenant_isolation_update ON "users";
DROP POLICY IF EXISTS users_tenant_isolation_delete ON "users";

CREATE POLICY users_tenant_isolation_select
  ON "users"
  FOR SELECT
  USING ("tenantId" = private.current_tenant_id());

CREATE POLICY users_tenant_isolation_insert
  ON "users"
  FOR INSERT
  WITH CHECK ("tenantId" = private.current_tenant_id());

CREATE POLICY users_tenant_isolation_update
  ON "users"
  FOR UPDATE
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());

CREATE POLICY users_tenant_isolation_delete
  ON "users"
  FOR DELETE
  USING ("tenantId" = private.current_tenant_id());

DROP POLICY IF EXISTS branches_tenant_isolation_select ON "branches";
DROP POLICY IF EXISTS branches_tenant_isolation_insert ON "branches";
DROP POLICY IF EXISTS branches_tenant_isolation_update ON "branches";
DROP POLICY IF EXISTS branches_tenant_isolation_delete ON "branches";

CREATE POLICY branches_tenant_isolation_select
  ON "branches"
  FOR SELECT
  USING ("tenantId" = private.current_tenant_id());

CREATE POLICY branches_tenant_isolation_insert
  ON "branches"
  FOR INSERT
  WITH CHECK ("tenantId" = private.current_tenant_id());

CREATE POLICY branches_tenant_isolation_update
  ON "branches"
  FOR UPDATE
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());

CREATE POLICY branches_tenant_isolation_delete
  ON "branches"
  FOR DELETE
  USING ("tenantId" = private.current_tenant_id());

DROP POLICY IF EXISTS sales_tenant_isolation_select ON "sales";
DROP POLICY IF EXISTS sales_tenant_isolation_insert ON "sales";
DROP POLICY IF EXISTS sales_tenant_isolation_update ON "sales";
DROP POLICY IF EXISTS sales_tenant_isolation_delete ON "sales";

CREATE POLICY sales_tenant_isolation_select
  ON "sales"
  FOR SELECT
  USING ("tenantId" = private.current_tenant_id());

CREATE POLICY sales_tenant_isolation_insert
  ON "sales"
  FOR INSERT
  WITH CHECK ("tenantId" = private.current_tenant_id());

CREATE POLICY sales_tenant_isolation_update
  ON "sales"
  FOR UPDATE
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());

CREATE POLICY sales_tenant_isolation_delete
  ON "sales"
  FOR DELETE
  USING ("tenantId" = private.current_tenant_id());
