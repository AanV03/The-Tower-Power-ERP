import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { after, test } from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) {
      return nextResolve(specifier, context);
    }

    return {
      shortCircuit: true,
      url: new URL(
        `../${specifier.slice(2)}.ts`,
        import.meta.url,
      ).href,
    };
  },
});

const {
  createPersistedSession,
  revokeSessionByJti,
  verifyAuthToken,
} = await import("../lib/auth/session.ts");
const { prisma } = await import("../lib/db/prisma.ts");

const hasDatabase = Boolean(process.env.DATABASE_URL);

after(async () => {
  await prisma.$disconnect();
});

test(
  "persiste, audita y revoca una sesion por jti",
  {
    skip: hasDatabase ? false : "DATABASE_URL is required.",
    timeout: 120_000,
  },
  async () => {
    const suffix = randomUUID().slice(0, 8);
    const tenant = await prisma.tenant.create({
      data: {
        name: `Session Tenant ${suffix}`,
        status: "ACTIVE",
      },
    });
    const user = await prisma.user.create({
      data: {
        email: `session-${suffix}@towerpower.test`,
        status: "ACTIVE",
      },
    });

    try {
      const branch = await prisma.branch.create({
        data: {
          tenantId: tenant.id,
          name: "Session Branch",
          code: `SES-${suffix}`,
          status: "ACTIVE",
        },
      });
      await prisma.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          defaultBranchId: branch.id,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      });

      const issued = await createPersistedSession(
        {
          typ: "session",
          userId: user.id,
          tenantId: tenant.id,
          branchId: branch.id,
          branchIds: [branch.id],
          role: "Owner",
          roles: ["Owner"],
          roleScopes: ["TENANT"],
          permissions: ["dashboard.read"],
          modules: ["DASHBOARD"],
          isSystemAdmin: false,
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "session-revocation-test",
          correlationId: `session-${suffix}`,
        },
      );

      assert.ok(
        await verifyAuthToken(issued.token, "session"),
        "the issued session must be active",
      );

      const persisted = await prisma.session.findUniqueOrThrow({
        where: { jti: issued.payload.jti },
      });
      assert.equal(persisted.isRevoked, false);
      assert.equal(persisted.userId, user.id);
      assert.equal(persisted.tenantId, tenant.id);

      assert.equal(
        await revokeSessionByJti(issued.payload.jti, {
          reason: "LOGOUT",
        }),
        true,
      );
      assert.equal(
        await verifyAuthToken(issued.token, "session"),
        null,
      );

      const events = await prisma.securityEvent.findMany({
        where: {
          tenantId: tenant.id,
          userId: user.id,
        },
        orderBy: { createdAt: "asc" },
      });
      assert.deepEqual(
        events.map((event) => event.eventType),
        ["LOGIN_SUCCEEDED", "LOGOUT"],
      );

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          tenantId: tenant.id,
          entityId: issued.payload.jti,
        },
        orderBy: { createdAt: "asc" },
      });
      assert.deepEqual(
        auditLogs.map((entry) => entry.action),
        ["AUTH.LOGIN_SUCCEEDED", "AUTH.LOGOUT"],
      );
    } finally {
      await prisma.auditLog.deleteMany({
        where: { tenantId: tenant.id },
      });
      await prisma.securityEvent.deleteMany({
        where: { tenantId: tenant.id },
      });
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
      await prisma.tenant.delete({
        where: { id: tenant.id },
      });
      await prisma.user.delete({
        where: { id: user.id },
      });
    }
  },
);
