import "dotenv/config";

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import pg from "pg";

import {
  prisma,
  withTenantTransaction,
} from "../lib/db/prisma.ts";

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const rlsSqlUrl = new URL("../prisma/rls.sql", import.meta.url);

async function installRls() {
  const client = new pg.Client({ connectionString });

  await client.connect();
  try {
    await client.query(await readFile(rlsSqlUrl, "utf8"));
  } finally {
    await client.end();
  }
}

after(async () => {
  await prisma.$disconnect();
});

test(
  "RLS aisla Tenant, Branch, AuditLog y JournalEntry",
  {
    skip: connectionString
      ? false
      : "DIRECT_URL or DATABASE_URL is required for the RLS test.",
    timeout: 120_000,
  },
  async () => {
    await installRls();

    const suffix = randomUUID().slice(0, 8);
    const tenantIds = [];
    const userIds = [];

    try {
      const tenantA = await prisma.tenant.create({
        data: {
          name: `RLS Tenant A ${suffix}`,
          status: "ACTIVE",
        },
      });
      const tenantB = await prisma.tenant.create({
        data: {
          name: `RLS Tenant B ${suffix}`,
          status: "ACTIVE",
        },
      });
      tenantIds.push(tenantA.id, tenantB.id);

      const userA = await prisma.user.create({
        data: {
          email: `rls-a-${suffix}@towerpower.test`,
          status: "ACTIVE",
        },
      });
      const userB = await prisma.user.create({
        data: {
          email: `rls-b-${suffix}@towerpower.test`,
          status: "ACTIVE",
        },
      });
      userIds.push(userA.id, userB.id);

      const branchA = await prisma.branch.create({
        data: {
          tenantId: tenantA.id,
          name: "RLS Branch A",
          code: `RLS-A-${suffix}`,
          status: "ACTIVE",
        },
      });
      const branchB = await prisma.branch.create({
        data: {
          tenantId: tenantB.id,
          name: "RLS Branch B",
          code: `RLS-B-${suffix}`,
          status: "ACTIVE",
        },
      });

      const membershipA = await prisma.tenantMembership.create({
        data: {
          tenantId: tenantA.id,
          userId: userA.id,
          defaultBranchId: branchA.id,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      });
      const membershipB = await prisma.tenantMembership.create({
        data: {
          tenantId: tenantB.id,
          userId: userB.id,
          defaultBranchId: branchB.id,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      });

      await prisma.auditLog.createMany({
        data: [
          {
            tenantId: tenantA.id,
            actorId: membershipA.id,
            branchId: branchA.id,
            action: "RLS_TEST",
            entity: "Tenant",
            entityId: tenantA.id,
            correlationId: `rls-a-${suffix}`,
          },
          {
            tenantId: tenantB.id,
            actorId: membershipB.id,
            branchId: branchB.id,
            action: "RLS_TEST",
            entity: "Tenant",
            entityId: tenantB.id,
            correlationId: `rls-b-${suffix}`,
          },
        ],
      });

      const journalA = await prisma.journalEntry.create({
        data: {
          tenantId: tenantA.id,
          sourceType: "RLS_TEST",
          sourceId: `journal-a-${suffix}`,
          entryDate: new Date(),
          status: "DRAFT",
        },
      });
      const journalB = await prisma.journalEntry.create({
        data: {
          tenantId: tenantB.id,
          sourceType: "RLS_TEST",
          sourceId: `journal-b-${suffix}`,
          entryDate: new Date(),
          status: "DRAFT",
        },
      });

      const visibleFromTenantA = await withTenantTransaction(
        tenantA.id,
        async (tx) => {
          const [tenantSetting, tenants, branches, auditLogs, journals] =
            await Promise.all([
              tx.$queryRaw`
                SELECT private.current_tenant_id() AS "tenantId"
              `,
              tx.tenant.findMany({
                where: { id: { in: tenantIds } },
                orderBy: { id: "asc" },
              }),
              tx.branch.findMany({
                where: { id: { in: [branchA.id, branchB.id] } },
                orderBy: { id: "asc" },
              }),
              tx.auditLog.findMany({
                where: {
                  correlationId: {
                    in: [`rls-a-${suffix}`, `rls-b-${suffix}`],
                  },
                },
              }),
              tx.journalEntry.findMany({
                where: { id: { in: [journalA.id, journalB.id] } },
                orderBy: { id: "asc" },
              }),
            ]);

          const crossTenantUpdate = await tx.branch.updateMany({
            where: { id: branchB.id },
            data: { name: "RLS LEAK" },
          });

          return {
            tenantSetting,
            tenants,
            branches,
            auditLogs,
            journals,
            crossTenantUpdate,
          };
        },
      );

      assert.deepEqual(visibleFromTenantA.tenantSetting, [
        { tenantId: tenantA.id },
      ]);
      assert.deepEqual(
        visibleFromTenantA.tenants.map((tenant) => tenant.id),
        [tenantA.id],
      );
      assert.deepEqual(
        visibleFromTenantA.branches.map((branch) => branch.id),
        [branchA.id],
      );
      assert.deepEqual(
        visibleFromTenantA.auditLogs.map((auditLog) => auditLog.tenantId),
        [tenantA.id],
      );
      assert.deepEqual(
        visibleFromTenantA.journals.map((journal) => journal.id),
        [journalA.id],
      );
      assert.equal(visibleFromTenantA.crossTenantUpdate.count, 0);

      await assert.rejects(
        () =>
          withTenantTransaction(tenantA.id, (tx) =>
            tx.journalEntry.create({
              data: {
                tenantId: tenantB.id,
                sourceType: "RLS_TEST",
                sourceId: `blocked-${suffix}`,
                entryDate: new Date(),
                status: "DRAFT",
              },
            }),
          ),
        /row-level security|permission denied/i,
      );
    } finally {
      if (tenantIds.length > 0) {
        await prisma.auditLog.deleteMany({
          where: { tenantId: { in: tenantIds } },
        });
        await prisma.tenant.deleteMany({
          where: { id: { in: tenantIds } },
        });
      }

      if (userIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: userIds } },
        });
      }
    }
  },
);
