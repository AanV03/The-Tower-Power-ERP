import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { test } from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "../db/prisma" &&
      context.parentURL?.endsWith("/lib/services/notification-service.ts")
    ) {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export const withTenantTransaction = (...args) => globalThis.__notificationTenantTransaction(...args)",
      };
    }

    return nextResolve(specifier, context);
  },
});

const { triggerNotification } = await import(
  "../lib/services/notification-service.ts"
);

function notificationCreate(capture) {
  return async ({ data }) => {
    capture.data = data;
    return {
      id: "notification-1",
      createdAt: new Date(),
      ...data,
      recipients: data.recipients.createMany.data.map((recipient, index) => ({
        id: `recipient-${index + 1}`,
        notificationId: "notification-1",
        read: false,
        readAt: null,
        deleted: false,
        ...recipient,
      })),
    };
  };
}

test("dispatches a branch-role notification only to active scoped members", async () => {
  const capture = {};
  const tx = {
    branch: {
      findUnique: async ({ where }) => {
        assert.deepEqual(where, {
          tenantId_id: { tenantId: "tenant-a", id: "branch-a" },
        });
        return { id: "branch-a", status: "ACTIVE" };
      },
    },
    role: {
      findFirst: async ({ where }) => {
        assert.deepEqual(where, {
          tenantId: "tenant-a",
          name: "Receptionist",
        });
        return { id: "role-reception", scope: "BRANCH" };
      },
    },
    roleAssignment: {
      findMany: async () => [
        {
          branchId: "branch-a",
          membershipId: "membership-a",
          membership: { userId: "user-a" },
        },
        {
          branchId: "branch-b",
          membershipId: "membership-b",
          membership: { userId: "user-b" },
        },
      ],
    },
    branchMembership: {
      findMany: async () => [
        { membershipId: "membership-a", branchId: "branch-a" },
      ],
    },
    tenantMembership: {
      findFirst: async () => null,
      findMany: async () => [],
    },
    notification: { create: notificationCreate(capture) },
  };

  globalThis.__notificationTenantTransaction = async (
    tenantId,
    operation,
  ) => {
    assert.equal(tenantId, "tenant-a");
    return operation(tx);
  };

  const notification = await triggerNotification({
    tenantId: "tenant-a",
    branchId: "branch-a",
    title: "Access denied",
    description: "A turnstile rejected a membership.",
    category: "ACCESS",
    priority: "WARNING",
    targetRoleName: "Receptionist",
  });

  assert.equal(notification.targetRoleId, "role-reception");
  assert.deepEqual(capture.data.recipients.createMany.data, [
    { userId: "user-a" },
  ]);
});

test("broadcasts to active tenant memberships when no target is provided", async () => {
  const capture = {};
  const tx = {
    branch: { findUnique: async () => null },
    role: { findFirst: async () => null },
    roleAssignment: { findMany: async () => [] },
    branchMembership: { findMany: async () => [] },
    tenantMembership: {
      findFirst: async () => null,
      findMany: async () => [
        { userId: "user-a" },
        { userId: "user-b" },
      ],
    },
    notification: { create: notificationCreate(capture) },
  };

  globalThis.__notificationTenantTransaction = async (
    tenantId,
    operation,
  ) => operation(tx);

  await triggerNotification({
    tenantId: "tenant-a",
    title: "Maintenance",
    description: "Scheduled maintenance begins at midnight.",
    category: "SYSTEM",
    priority: "INFO",
  });

  assert.deepEqual(capture.data.recipients.createMany.data, [
    { userId: "user-a" },
    { userId: "user-b" },
  ]);
});

test("rejects a direct recipient without an active tenant membership", async () => {
  const tx = {
    branch: { findUnique: async () => null },
    tenantMembership: {
      findFirst: async () => null,
      findMany: async () => [],
    },
  };

  globalThis.__notificationTenantTransaction = async (
    tenantId,
    operation,
  ) => operation(tx);

  await assert.rejects(
    triggerNotification({
      tenantId: "tenant-a",
      title: "Private message",
      description: "This message must remain tenant-scoped.",
      category: "ADMIN",
      priority: "INFO",
      targetUserId: "user-outside-tenant",
    }),
    (error) => error.code === "NOTIFICATION_USER_NOT_FOUND",
  );
});

test("dispatcher never references the legacy UserRole model", async () => {
  const source = await readFile(
    new URL("../lib/services/notification-service.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /\bUserRole\b|\buserRole\b/);
  assert.match(source, /\broleAssignment\b/);
  assert.match(source, /\bbranchMembership\b/);
  assert.match(source, /\btenantMembership\b/);
});
