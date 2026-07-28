BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '');
$$;

REVOKE ALL ON FUNCTION private.current_tenant_id() FROM PUBLIC;

GRANT USAGE ON SCHEMA public, private TO authenticated;
GRANT EXECUTE ON FUNCTION private.current_tenant_id() TO authenticated;

DO $$
DECLARE
  tenant_table text;
  existing_policy text;
BEGIN
  FOR tenant_table IN
    SELECT columns.table_name
    FROM information_schema.columns AS columns
    WHERE columns.table_schema = 'public'
      AND columns.column_name = 'tenantId'
      AND columns.table_name NOT IN ('audit_logs', 'security_events')
    ORDER BY columns.table_name
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      tenant_table
    );
    EXECUTE format(
      'ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',
      tenant_table
    );

    FOR existing_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = tenant_table
    LOOP
      EXECUTE format(
        'DROP POLICY %I ON public.%I',
        existing_policy,
        tenant_table
      );
    END LOOP;

    EXECUTE format(
      'CREATE POLICY tenant_isolation_select ON public.%I
       FOR SELECT TO authenticated
       USING (%I = private.current_tenant_id())',
      tenant_table,
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY tenant_isolation_insert ON public.%I
       FOR INSERT TO authenticated
       WITH CHECK (%I = private.current_tenant_id())',
      tenant_table,
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY tenant_isolation_update ON public.%I
       FOR UPDATE TO authenticated
       USING (%I = private.current_tenant_id())
       WITH CHECK (%I = private.current_tenant_id())',
      tenant_table,
      'tenantId',
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY tenant_isolation_delete ON public.%I
       FOR DELETE TO authenticated
       USING (%I = private.current_tenant_id())',
      tenant_table,
      'tenantId'
    );
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
      tenant_table
    );
  END LOOP;
END;
$$;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  existing_policy text;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenants'
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON public.tenants',
      existing_policy
    );
  END LOOP;
END;
$$;

CREATE POLICY tenant_isolation_select
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = private.current_tenant_id());

CREATE POLICY tenant_isolation_insert
  ON public.tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (id = private.current_tenant_id());

CREATE POLICY tenant_isolation_update
  ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (id = private.current_tenant_id())
  WITH CHECK (id = private.current_tenant_id());

CREATE POLICY tenant_isolation_delete
  ON public.tenants
  FOR DELETE
  TO authenticated
  USING (id = private.current_tenant_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tenants TO authenticated;

DO $$
DECLARE
  append_only_table text;
  existing_policy text;
BEGIN
  FOREACH append_only_table IN ARRAY ARRAY[
    'audit_logs',
    'security_events'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      append_only_table
    );
    EXECUTE format(
      'ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',
      append_only_table
    );

    FOR existing_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = append_only_table
    LOOP
      EXECUTE format(
        'DROP POLICY %I ON public.%I',
        existing_policy,
        append_only_table
      );
    END LOOP;

    EXECUTE format(
      'CREATE POLICY tenant_isolation_select ON public.%I
       FOR SELECT TO authenticated
       USING (%I = private.current_tenant_id())',
      append_only_table,
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY tenant_isolation_insert ON public.%I
       FOR INSERT TO authenticated
       WITH CHECK (%I = private.current_tenant_id())',
      append_only_table,
      'tenantId'
    );
    EXECUTE format(
      'GRANT SELECT, INSERT ON TABLE public.%I TO authenticated',
      append_only_table
    );
    EXECUTE format(
      'REVOKE UPDATE, DELETE ON TABLE public.%I FROM authenticated',
      append_only_table
    );
  END LOOP;
END;
$$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  existing_policy text;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON public.users',
      existing_policy
    );
  END LOOP;
END;
$$;

CREATE POLICY users_via_membership_select
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tenant_memberships AS membership
      WHERE membership."userId" = users.id
        AND membership."tenantId" = private.current_tenant_id()
    )
  );

CREATE POLICY users_via_membership_update
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.tenant_memberships AS membership
      WHERE membership."userId" = users.id
        AND membership."tenantId" = private.current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tenant_memberships AS membership
      WHERE membership."userId" = users.id
        AND membership."tenantId" = private.current_tenant_id()
    )
  );

GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;
REVOKE INSERT, DELETE ON TABLE public.users FROM authenticated;

DO $$
DECLARE
  identity_table text;
  existing_policy text;
BEGIN
  FOREACH identity_table IN ARRAY ARRAY[
    'accounts',
    'mfa_credentials',
    'recovery_codes'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      identity_table
    );
    EXECUTE format(
      'ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',
      identity_table
    );

    FOR existing_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = identity_table
    LOOP
      EXECUTE format(
        'DROP POLICY %I ON public.%I',
        existing_policy,
        identity_table
      );
    END LOOP;

    EXECUTE format(
      'CREATE POLICY identity_via_membership_select ON public.%I
       FOR SELECT TO authenticated
       USING (
         EXISTS (
           SELECT 1
           FROM public.tenant_memberships AS membership
           WHERE membership.%I = public.%I.%I
             AND membership.%I = private.current_tenant_id()
         )
       )',
      identity_table,
      'userId',
      identity_table,
      'userId',
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY identity_via_membership_insert ON public.%I
       FOR INSERT TO authenticated
       WITH CHECK (
         EXISTS (
           SELECT 1
           FROM public.tenant_memberships AS membership
           WHERE membership.%I = public.%I.%I
             AND membership.%I = private.current_tenant_id()
         )
       )',
      identity_table,
      'userId',
      identity_table,
      'userId',
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY identity_via_membership_update ON public.%I
       FOR UPDATE TO authenticated
       USING (
         EXISTS (
           SELECT 1
           FROM public.tenant_memberships AS membership
           WHERE membership.%I = public.%I.%I
             AND membership.%I = private.current_tenant_id()
         )
       )
       WITH CHECK (
         EXISTS (
           SELECT 1
           FROM public.tenant_memberships AS membership
           WHERE membership.%I = public.%I.%I
             AND membership.%I = private.current_tenant_id()
         )
       )',
      identity_table,
      'userId',
      identity_table,
      'userId',
      'tenantId',
      'userId',
      identity_table,
      'userId',
      'tenantId'
    );
    EXECUTE format(
      'CREATE POLICY identity_via_membership_delete ON public.%I
       FOR DELETE TO authenticated
       USING (
         EXISTS (
           SELECT 1
           FROM public.tenant_memberships AS membership
           WHERE membership.%I = public.%I.%I
             AND membership.%I = private.current_tenant_id()
         )
       )',
      identity_table,
      'userId',
      identity_table,
      'userId',
      'tenantId'
    );
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
      identity_table
    );
  END LOOP;
END;
$$;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  existing_policy text;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'role_permissions'
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON public.role_permissions',
      existing_policy
    );
  END LOOP;
END;
$$;

CREATE POLICY role_permissions_tenant_access
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.roles AS role
      WHERE role.id = role_permissions."roleId"
        AND role."tenantId" = private.current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.roles AS role
      WHERE role.id = role_permissions."roleId"
        AND role."tenantId" = private.current_tenant_id()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.role_permissions
  TO authenticated;

GRANT SELECT ON TABLE public.permissions, public.saas_plans TO authenticated;

DROP FUNCTION IF EXISTS private.jwt_claims();

COMMIT;
