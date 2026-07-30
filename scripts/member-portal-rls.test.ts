import "dotenv/config";

import assert from "node:assert/strict";
import { after, test } from "node:test";

const prismaModule = await import(
  new URL("../lib/db/prisma.ts", import.meta.url).href
) as typeof import("../lib/db/prisma");
const { prisma, withTenantTransaction } = prismaModule;

const PORTAL_TABLES = [
  "workout_plans",
  "workout_plan_exercises",
  "class_sessions",
  "class_bookings",
  "member_portal_settings",
] as const;

type PrivilegeRow = {
  tableName: string;
  rowSecurity: boolean;
  forceRowSecurity: boolean;
  canSelect: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  policyCount: bigint;
};

after(async () => {
  await prisma.$disconnect();
});

test("portal tables grant authenticated access and enforce tenant RLS", async () => {
  const privileges = await prisma.$queryRaw<PrivilegeRow[]>`
    SELECT
      source."tableName",
      catalog.relrowsecurity AS "rowSecurity",
      catalog.relforcerowsecurity AS "forceRowSecurity",
      has_table_privilege(
        'authenticated',
        format('public.%I', source."tableName"),
        'SELECT'
      ) AS "canSelect",
      has_table_privilege(
        'authenticated',
        format('public.%I', source."tableName"),
        'INSERT'
      ) AS "canInsert",
      has_table_privilege(
        'authenticated',
        format('public.%I', source."tableName"),
        'UPDATE'
      ) AS "canUpdate",
      has_table_privilege(
        'authenticated',
        format('public.%I', source."tableName"),
        'DELETE'
      ) AS "canDelete",
      (
        SELECT count(*)
        FROM pg_policies AS policy
        WHERE policy.schemaname = 'public'
          AND policy.tablename = source."tableName"
          AND policy.policyname LIKE 'tenant_isolation_%'
      ) AS "policyCount"
    FROM unnest(
      ARRAY[
        'workout_plans',
        'workout_plan_exercises',
        'class_sessions',
        'class_bookings',
        'member_portal_settings'
      ]::text[]
    ) AS source("tableName")
    JOIN pg_class AS catalog
      ON catalog.oid = to_regclass(
        format('public.%I', source."tableName")
      )
    ORDER BY source."tableName"
  `;

  assert.equal(privileges.length, PORTAL_TABLES.length);
  for (const privilege of privileges) {
    assert.equal(privilege.rowSecurity, true);
    assert.equal(privilege.forceRowSecurity, true);
    assert.equal(privilege.canSelect, true);
    assert.equal(privilege.canInsert, true);
    assert.equal(privilege.canUpdate, true);
    assert.equal(privilege.canDelete, true);
    assert.equal(Number(privilege.policyCount), 4);
  }

  const tenant = await prisma.tenant.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  assert.ok(tenant, "Development database must contain at least one tenant.");

  const visibility = await withTenantTransaction(
    tenant.id,
    async (tx) =>
      Promise.all(
        PORTAL_TABLES.map(async (tableName) => {
          const [result] = await tx.$queryRawUnsafe<
            Array<{ isolated: boolean | null }>
          >(
            `SELECT bool_and("tenantId" = private.current_tenant_id()) AS isolated
             FROM public.${tableName}`,
          );

          return {
            tableName,
            isolated: result?.isolated ?? true,
          };
        }),
      ),
  );

  assert.deepEqual(
    visibility.map((result) => result.isolated),
    PORTAL_TABLES.map(() => true),
  );
});
