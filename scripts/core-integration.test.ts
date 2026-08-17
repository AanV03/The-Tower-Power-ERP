import "dotenv/config";

import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import pg from "pg";
import {
  BranchStatus,
  InvitationStatus,
  MembershipStatus,
  NotificationCategory,
  NotificationPriority,
  PlanInterval,
  Prisma,
  RoleScope,
  TenantStatus,
  UserStatus,
} from "@prisma/client";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const moduleUrl = (path: string) => new URL(path, import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }

    if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith("file:")
    ) {
      const sourcePath = resolve(
        dirname(fileURLToPath(context.parentURL)),
        specifier,
      );
      const candidate = [`${sourcePath}.ts`, `${sourcePath}.tsx`].find(
        existsSync,
      );

      if (candidate) {
        return {
          shortCircuit: true,
          url: pathToFileURL(candidate).href,
        };
      }
    }

    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

    const sourcePath = resolve(projectRoot, specifier.slice(2));
    const candidate = [
      `${sourcePath}.ts`,
      `${sourcePath}.tsx`,
      resolve(sourcePath, "index.ts"),
    ].find(existsSync);

    if (!candidate) return nextResolve(specifier, context);
    return {
      shortCircuit: true,
      url: pathToFileURL(candidate).href,
    };
  },
});

const [
  databaseModule,
  invitationTokenModule,
  invitationSchemaModule,
  invitationServiceModule,
  onboardingSchemaModule,
  onboardingServiceModule,
  notificationServiceModule,
  tenantBootstrapModule,
] = await Promise.all([
  import(moduleUrl("../lib/db/prisma.ts")) as Promise<
    typeof import("../lib/db/prisma")
  >,
  import(moduleUrl("../lib/auth/invitation-token.ts")) as Promise<
    typeof import("../lib/auth/invitation-token")
  >,
  import(moduleUrl("../modules/auth/schemas/invitation.schema.ts")) as Promise<
    typeof import("../modules/auth/schemas/invitation.schema")
  >,
  import(moduleUrl("../modules/auth/services/invitation.service.ts")) as Promise<
    typeof import("../modules/auth/services/invitation.service")
  >,
  import(moduleUrl("../modules/onboarding/schemas/onboarding.schema.ts")) as Promise<
    typeof import("../modules/onboarding/schemas/onboarding.schema")
  >,
  import(moduleUrl("../modules/onboarding/services/onboarding.service.ts")) as Promise<
    typeof import("../modules/onboarding/services/onboarding.service")
  >,
  import(moduleUrl("../lib/services/notification-service.ts")) as Promise<
    typeof import("../lib/services/notification-service")
  >,
  import(moduleUrl("../lib/auth/tenant-context.ts")) as Promise<
    typeof import("../lib/auth/tenant-context")
  >,
]);

const { prisma, withTenantTransaction } = databaseModule;
const { createInvitationToken, verifyInvitationToken } =
  invitationTokenModule;
const { acceptInvitationSchema } = invitationSchemaModule;
const { activateInvitedUser } = invitationServiceModule;
const {
  onboardingGymInfoSchema,
  onboardingPlanSelectionSchema,
} = onboardingSchemaModule;
const {
  completeOnboarding,
  saveOnboardingGymInfo,
  saveOnboardingPlan,
} = onboardingServiceModule;
const { triggerNotification } = notificationServiceModule;
const {
  DEFAULT_OWNER_PERMISSIONS,
  enableDefaultTenantModules,
  permissionDefinition,
} = tenantBootstrapModule;

type IntegrationState = {
  tenantId: string | null;
  branchId: string | null;
  planId: string | null;
  adminUserId: string | null;
  adminMembershipId: string | null;
  invitedUserId: string | null;
  invitedRoleId: string | null;
  invitedRoleName: string | null;
  notificationId: string | null;
};

const state: IntegrationState = {
  tenantId: null,
  branchId: null,
  planId: null,
  adminUserId: null,
  adminMembershipId: null,
  invitedUserId: null,
  invitedRoleId: null,
  invitedRoleName: null,
  notificationId: null,
};

function required(value: string | null, name: string) {
  assert.ok(value, `${name} must be initialized by a previous phase.`);
  return value;
}

function jsonObject(value: Prisma.JsonValue | null) {
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  return value as Record<string, Prisma.JsonValue>;
}

async function teardown() {
  const tenantId = state.tenantId;

  if (tenantId) {
    await prisma.$transaction(async (tx) => {
      await tx.notificationRecipient.deleteMany({ where: { tenantId } });
      await tx.notification.deleteMany({ where: { tenantId } });
      await tx.securityEvent.deleteMany({ where: { tenantId } });
      await tx.auditLog.deleteMany({ where: { tenantId } });
      await tx.userInvitation.deleteMany({ where: { tenantId } });
      await tx.tenantBillingProfile.deleteMany({ where: { tenantId } });
      await tx.roleAssignment.deleteMany({ where: { tenantId } });
      await tx.branchMembership.deleteMany({ where: { tenantId } });
      await tx.tenantMembership.deleteMany({ where: { tenantId } });
      await tx.role.deleteMany({ where: { tenantId } });
      await tx.branch.deleteMany({ where: { tenantId } });
      await tx.tenant.deleteMany({ where: { id: tenantId } });
    });
  }

  const userIds = [state.adminUserId, state.invitedUserId].filter(
    (value): value is string => Boolean(value),
  );
  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  if (state.planId) {
    await prisma.saasPlan.deleteMany({ where: { id: state.planId } });
  }
}

const connectionString = process.env.DATABASE_URL;
const directConnectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const authSecret = process.env.AUTH_SECRET;
const rlsSqlUrl = new URL("../prisma/rls.sql", import.meta.url);

async function installRls() {
  assert.ok(directConnectionString);
  const client = new pg.Client({ connectionString: directConnectionString });

  await client.connect();
  try {
    await client.query(await readFile(rlsSqlUrl, "utf8"));
  } finally {
    await client.end();
  }
}

test(
  "core backend integration: invitations, onboarding and RBAC notifications",
  {
    skip: !connectionString
      ? "DATABASE_URL or DIRECT_URL is required."
      : !authSecret || Buffer.byteLength(authSecret, "utf8") < 32
        ? "AUTH_SECRET with at least 32 bytes is required."
        : false,
    timeout: 120_000,
  },
  async (t) => {
    t.after(async () => {
      await teardown();
      await prisma.$disconnect();
    });

    const suffix = randomUUID().replaceAll("-", "").slice(0, 12);

    await t.test("setup creates the tenant and administrator", async () => {
      await installRls();

      const setup = await prisma.$transaction(async (tx) => {
        const plan = await tx.saasPlan.create({
          data: {
            name: `Core Integration Plan ${suffix}`,
            description: "Temporary plan for backend integration testing.",
            price: new Prisma.Decimal("999.00"),
            currency: "MXN",
            interval: PlanInterval.MONTHLY,
          },
        });
        const tenant = await tx.tenant.create({
          data: {
            name: `Core Integration Tenant ${suffix}`,
            status: TenantStatus.ACTIVE,
            brandIdentity: {
              integrationRunId: suffix,
              adminOnboardingCompleted: false,
            },
          },
        });
        await enableDefaultTenantModules(tx, tenant.id);
        const branch = await tx.branch.create({
          data: {
            tenantId: tenant.id,
            name: "Sucursal Integracion",
            code: `CORE-${suffix}`,
            status: BranchStatus.ACTIVE,
          },
        });
        const adminUser = await tx.user.create({
          data: {
            name: "Core Integration Admin",
            email: `core-admin-${suffix}@gerpy.test`,
            status: UserStatus.ACTIVE,
          },
        });
        const adminMembership = await tx.tenantMembership.create({
          data: {
            tenantId: tenant.id,
            userId: adminUser.id,
            defaultBranchId: branch.id,
            status: MembershipStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
        await tx.branchMembership.create({
          data: {
            tenantId: tenant.id,
            membershipId: adminMembership.id,
            branchId: branch.id,
          },
        });
        const adminRole = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: `Integration Admin ${suffix}`,
            scope: RoleScope.TENANT,
          },
        });
        const ownerPermissions = await Promise.all(
          DEFAULT_OWNER_PERMISSIONS.map((key) =>
            tx.permission.upsert({
              where: { key },
              update: {},
              create: {
                ...permissionDefinition(key),
                description: `Allows ${key}.`,
              },
            }),
          ),
        );
        await tx.rolePermission.createMany({
          data: ownerPermissions.map((permission) => ({
            roleId: adminRole.id,
            permissionId: permission.id,
          })),
          skipDuplicates: true,
        });
        await tx.roleAssignment.create({
          data: {
            tenantId: tenant.id,
            membershipId: adminMembership.id,
            roleId: adminRole.id,
          },
        });
        const invitedRole = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: `Integration Operator ${suffix}`,
            scope: RoleScope.BRANCH,
          },
        });

        return {
          tenant,
          branch,
          plan,
          adminUser,
          adminMembership,
          invitedRole,
        };
      });

      state.tenantId = setup.tenant.id;
      state.branchId = setup.branch.id;
      state.planId = setup.plan.id;
      state.adminUserId = setup.adminUser.id;
      state.adminMembershipId = setup.adminMembership.id;
      state.invitedRoleId = setup.invitedRole.id;
      state.invitedRoleName = setup.invitedRole.name;

      assert.equal(setup.tenant.status, TenantStatus.ACTIVE);
      assert.equal(setup.adminMembership.status, MembershipStatus.ACTIVE);
    });

    await t.test(
      "invitation token activates the user and assigns tenant, branch and role",
      async () => {
        const tenantId = required(state.tenantId, "tenantId");
        const branchId = required(state.branchId, "branchId");
        const roleId = required(state.invitedRoleId, "invitedRoleId");
        const adminMembershipId = required(
          state.adminMembershipId,
          "adminMembershipId",
        );
        const expiresAt = Date.now() + 60 * 60 * 1000;

        const invitationSetup = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: "Invited Integration User",
              email: `core-invited-${suffix}@gerpy.test`,
              status: UserStatus.INVITED,
            },
          });
          const membership = await tx.tenantMembership.create({
            data: {
              tenantId,
              userId: user.id,
              defaultBranchId: branchId,
              status: MembershipStatus.INVITED,
            },
          });
          const token = createInvitationToken({
            userId: user.id,
            tenantId,
            expiresAt,
          });

          await tx.userInvitation.create({
            data: {
              tenantId,
              email: user.email!,
              tokenHash: createHash("sha256")
                .update(token, "utf8")
                .digest("hex"),
              roleAssignments: [{ roleId, branchId }],
              branchIds: [branchId],
              expiresAt: new Date(expiresAt),
              status: InvitationStatus.PENDING,
              invitedByMembershipId: adminMembershipId,
            },
          });

          return { user, membership, token };
        });
        state.invitedUserId = invitationSetup.user.id;

        const claims = verifyInvitationToken(invitationSetup.token);
        assert.ok(claims, "The HMAC invitation token must be valid.");
        const input = acceptInvitationSchema.parse({
          token: invitationSetup.token,
          name: "Invited Integration User",
          password: "CoreIntegration!2026",
        });
        const result = await activateInvitedUser(claims, input, {
          ipAddress: "127.0.0.1",
          userAgent: "Gerpy core integration test",
          correlationId: `core-invitation-${suffix}`,
        });

        assert.deepEqual(result, {
          userId: invitationSetup.user.id,
          tenantId,
        });

        const activated = await withTenantTransaction(
          tenantId,
          async (tx) =>
            tx.tenantMembership.findUnique({
              where: {
                tenantId_userId: {
                  tenantId,
                  userId: invitationSetup.user.id,
                },
              },
              include: {
                user: true,
                branchMemberships: true,
                roleAssignments: { include: { role: true } },
              },
            }),
        );

        assert.ok(activated);
        assert.equal(activated.status, MembershipStatus.ACTIVE);
        assert.equal(activated.user.status, UserStatus.ACTIVE);
        assert.ok(
          activated.branchMemberships.some(
            (membership) =>
              membership.branchId === branchId &&
              membership.revokedAt === null,
          ),
        );
        assert.ok(
          activated.roleAssignments.some(
            (assignment) =>
              assignment.roleId === roleId &&
              assignment.branchId === branchId &&
              assignment.revokedAt === null,
          ),
        );
      },
    );

    await t.test(
      "onboarding persists fiscal, billing and progress state",
      async () => {
        const tenantId = required(state.tenantId, "tenantId");
        const branchId = required(state.branchId, "branchId");
        const planId = required(state.planId, "planId");
        const adminUserId = required(state.adminUserId, "adminUserId");
        const context = {
          tenantId,
          branchId,
          userId: adminUserId,
        };
        const gymInfo = onboardingGymInfoSchema.parse({
          gymName: `Gerpy Integration Gym ${suffix}`,
          address: "Av. Reforma 123, Cuauhtemoc, CDMX",
          timeZone: "America/Mexico_City",
          curp: "GODE561231HDFMRS09",
          rfc: "XAXX010101000",
        });
        const plan = onboardingPlanSelectionSchema.parse({
          planId,
          paymentMethodToken: `pm_core_${suffix}`,
        });

        await saveOnboardingGymInfo(context, gymInfo);
        await saveOnboardingPlan(context, plan);
        const completed = await completeOnboarding(context);

        assert.equal(completed.onboarding.completed, true);
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          include: {
            billingProfile: true,
            branches: { where: { id: branchId } },
          },
        });

        assert.ok(tenant);
        assert.equal(tenant.planId, planId);
        assert.equal(
          tenant.billingProfile?.paymentMethodToken,
          plan.paymentMethodToken,
        );
        assert.equal(tenant.branches[0]?.timezone, gymInfo.timeZone);
        const identity = jsonObject(tenant.brandIdentity);
        const onboarding = jsonObject(identity.onboarding ?? null);

        assert.equal(identity.ownerCurp, gymInfo.curp);
        assert.equal(identity.adminOnboardingCompleted, true);
        assert.equal(onboarding.gymInfoCompleted, true);
        assert.equal(onboarding.planCompleted, true);
        assert.equal(onboarding.paymentMethodAttached, true);
      },
    );

    await t.test(
      "RBAC notification is delivered unread and can be marked as read",
      async () => {
        const tenantId = required(state.tenantId, "tenantId");
        const branchId = required(state.branchId, "branchId");
        const invitedUserId = required(
          state.invitedUserId,
          "invitedUserId",
        );
        const targetRoleName = required(
          state.invitedRoleName,
          "invitedRoleName",
        );
        const notification = await triggerNotification({
          tenantId,
          branchId,
          title: "Alerta critica de integracion",
          description:
            "La invitacion, el onboarding y el despacho RBAC estan conectados.",
          category: NotificationCategory.ADMIN,
          priority: NotificationPriority.CRITICAL,
          targetRoleName,
          resourceType: "TenantMembership",
          resourceId: invitedUserId,
        });
        state.notificationId = notification.id;

        assert.equal(notification.recipients.length, 1);
        assert.equal(notification.recipients[0]?.userId, invitedUserId);

        const feed = await withTenantTransaction(
          tenantId,
          async (tx) =>
            tx.notificationRecipient.findMany({
              where: {
                tenantId,
                userId: invitedUserId,
                deleted: false,
                notification: { tenantId },
              },
              include: { notification: true },
              orderBy: { notification: { createdAt: "desc" } },
            }),
        );

        const unread = feed.find(
          (recipient) => recipient.notificationId === notification.id,
        );
        assert.ok(unread);
        assert.equal(unread.read, false);
        assert.equal(unread.readAt, null);
        assert.equal(
          unread.notification.priority,
          NotificationPriority.CRITICAL,
        );

        await withTenantTransaction(tenantId, async (tx) => {
          const existing = await tx.notificationRecipient.findFirst({
            where: {
              tenantId,
              notificationId: notification.id,
              userId: invitedUserId,
              deleted: false,
              notification: { tenantId },
            },
          });
          assert.ok(existing);

          await tx.notificationRecipient.update({
            where: {
              notificationId_userId: {
                notificationId: notification.id,
                userId: invitedUserId,
              },
            },
            data: { read: true, readAt: new Date() },
          });
        });

        const persisted = await prisma.notificationRecipient.findUnique({
          where: {
            notificationId_userId: {
              notificationId: notification.id,
              userId: invitedUserId,
            },
          },
        });

        assert.ok(persisted);
        assert.equal(persisted.tenantId, tenantId);
        assert.equal(persisted.read, true);
        assert.ok(persisted.readAt instanceof Date);
        assert.ok(Number.isFinite(persisted.readAt.getTime()));
      },
    );

    await t.test("teardown removes every temporary database record", async () => {
      const tenantId = required(state.tenantId, "tenantId");
      const planId = required(state.planId, "planId");
      const userIds = [
        required(state.adminUserId, "adminUserId"),
        required(state.invitedUserId, "invitedUserId"),
      ];

      await teardown();

      const [tenantCount, userCount, planCount] = await Promise.all([
        prisma.tenant.count({ where: { id: tenantId } }),
        prisma.user.count({ where: { id: { in: userIds } } }),
        prisma.saasPlan.count({ where: { id: planId } }),
      ]);

      assert.equal(tenantCount, 0);
      assert.equal(userCount, 0);
      assert.equal(planCount, 0);
    });
  },
);
