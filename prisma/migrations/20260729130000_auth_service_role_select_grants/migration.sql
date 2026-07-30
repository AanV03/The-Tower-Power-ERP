BEGIN;

DO $$
DECLARE
  service_role_bypasses_rls boolean;
BEGIN
  SELECT rolbypassrls
  INTO service_role_bypasses_rls
  FROM pg_roles
  WHERE rolname = 'service_role';

  IF service_role_bypasses_rls IS NULL THEN
    RAISE NOTICE 'Role "service_role" does not exist; auth grants were skipped';
    RETURN;
  END IF;

  IF service_role_bypasses_rls IS DISTINCT FROM true THEN
    RAISE EXCEPTION
      'Role "service_role" must have BYPASSRLS; refusing to create a permissive auth policy';
  END IF;

  EXECUTE 'GRANT USAGE ON SCHEMA public TO service_role';
  EXECUTE 'GRANT SELECT ON TABLE
    public.users,
    public.mfa_credentials,
    public.tenant_memberships,
    public.tenants,
    public.branch_memberships,
    public.branches,
    public.role_assignments,
    public.roles,
    public.role_permissions,
    public.permissions,
    public.tenant_modules
    TO service_role';
END;
$$;

COMMIT;
