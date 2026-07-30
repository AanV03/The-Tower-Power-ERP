BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'CREATE ROLE authenticated NOLOGIN';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'CREATE ROLE service_role NOLOGIN';
  END IF;

  EXECUTE 'CREATE SCHEMA IF NOT EXISTS private;';

  IF to_regprocedure('private.current_tenant_id()') IS NULL THEN
    EXECUTE '
      CREATE FUNCTION private.current_tenant_id() 
      RETURNS text AS $func$
      BEGIN 
        RETURN ''00000000-0000-0000-0000-000000000000''::text;
      END; 
      $func$ LANGUAGE plpgsql;
    ';
  END IF;
END;
$$;
GRANT USAGE ON SCHEMA public, private TO authenticated;
GRANT EXECUTE ON FUNCTION private.current_tenant_id() TO authenticated;
GRANT USAGE ON TYPE "ClassBookingStatus" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.workout_plans
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.workout_plan_exercises
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.class_sessions
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.class_bookings
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.member_portal_settings
  TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'service_role'
  ) THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public, private TO service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION private.current_tenant_id() TO service_role';
    EXECUTE 'GRANT USAGE ON TYPE "ClassBookingStatus" TO service_role';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
      public.workout_plans,
      public.workout_plan_exercises,
      public.class_sessions,
      public.class_bookings,
      public.member_portal_settings
      TO service_role';
  END IF;
END;
$$;

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_select ON public.workout_plans;
DROP POLICY IF EXISTS tenant_isolation_insert ON public.workout_plans;
DROP POLICY IF EXISTS tenant_isolation_update ON public.workout_plans;
DROP POLICY IF EXISTS tenant_isolation_delete ON public.workout_plans;
CREATE POLICY tenant_isolation_select
  ON public.workout_plans
  FOR SELECT TO authenticated
  USING ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_insert
  ON public.workout_plans
  FOR INSERT TO authenticated
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_update
  ON public.workout_plans
  FOR UPDATE TO authenticated
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_delete
  ON public.workout_plans
  FOR DELETE TO authenticated
  USING ("tenantId" = private.current_tenant_id());

ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_select ON public.workout_plan_exercises;
DROP POLICY IF EXISTS tenant_isolation_insert ON public.workout_plan_exercises;
DROP POLICY IF EXISTS tenant_isolation_update ON public.workout_plan_exercises;
DROP POLICY IF EXISTS tenant_isolation_delete ON public.workout_plan_exercises;
CREATE POLICY tenant_isolation_select
  ON public.workout_plan_exercises
  FOR SELECT TO authenticated
  USING ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_insert
  ON public.workout_plan_exercises
  FOR INSERT TO authenticated
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_update
  ON public.workout_plan_exercises
  FOR UPDATE TO authenticated
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_delete
  ON public.workout_plan_exercises
  FOR DELETE TO authenticated
  USING ("tenantId" = private.current_tenant_id());

ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_select ON public.class_sessions;
DROP POLICY IF EXISTS tenant_isolation_insert ON public.class_sessions;
DROP POLICY IF EXISTS tenant_isolation_update ON public.class_sessions;
DROP POLICY IF EXISTS tenant_isolation_delete ON public.class_sessions;
CREATE POLICY tenant_isolation_select
  ON public.class_sessions
  FOR SELECT TO authenticated
  USING ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_insert
  ON public.class_sessions
  FOR INSERT TO authenticated
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_update
  ON public.class_sessions
  FOR UPDATE TO authenticated
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_delete
  ON public.class_sessions
  FOR DELETE TO authenticated
  USING ("tenantId" = private.current_tenant_id());

ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_select ON public.class_bookings;
DROP POLICY IF EXISTS tenant_isolation_insert ON public.class_bookings;
DROP POLICY IF EXISTS tenant_isolation_update ON public.class_bookings;
DROP POLICY IF EXISTS tenant_isolation_delete ON public.class_bookings;
CREATE POLICY tenant_isolation_select
  ON public.class_bookings
  FOR SELECT TO authenticated
  USING ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_insert
  ON public.class_bookings
  FOR INSERT TO authenticated
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_update
  ON public.class_bookings
  FOR UPDATE TO authenticated
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_delete
  ON public.class_bookings
  FOR DELETE TO authenticated
  USING ("tenantId" = private.current_tenant_id());

ALTER TABLE public.member_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_portal_settings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_select ON public.member_portal_settings;
DROP POLICY IF EXISTS tenant_isolation_insert ON public.member_portal_settings;
DROP POLICY IF EXISTS tenant_isolation_update ON public.member_portal_settings;
DROP POLICY IF EXISTS tenant_isolation_delete ON public.member_portal_settings;
CREATE POLICY tenant_isolation_select
  ON public.member_portal_settings
  FOR SELECT TO authenticated
  USING ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_insert
  ON public.member_portal_settings
  FOR INSERT TO authenticated
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_update
  ON public.member_portal_settings
  FOR UPDATE TO authenticated
  USING ("tenantId" = private.current_tenant_id())
  WITH CHECK ("tenantId" = private.current_tenant_id());
CREATE POLICY tenant_isolation_delete
  ON public.member_portal_settings
  FOR DELETE TO authenticated
  USING ("tenantId" = private.current_tenant_id());

COMMIT;
