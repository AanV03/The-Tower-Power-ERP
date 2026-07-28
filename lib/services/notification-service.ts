import {
  BranchStatus,
  MembershipStatus,
  NotificationCategory,
  NotificationPriority,
  Prisma,
  RoleScope,
  UserStatus,
} from "@prisma/client";
import { z } from "zod";

import type { TenantTransactionClient } from "../db/prisma";

const TriggerNotificationSchema = z
  .object({
    tenantId: z.string().trim().min(1).max(191),
    branchId: z.string().trim().min(1).max(191).optional(),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(2_000),
    category: z.enum(NotificationCategory),
    priority: z.enum(NotificationPriority),
    targetRoleName: z.string().trim().min(1).max(120).optional(),
    targetUserId: z.string().trim().min(1).max(191).optional(),
    resourceType: z.string().trim().min(1).max(120).optional(),
    resourceId: z.string().trim().min(1).max(191).optional(),
  })
  .strict();

export type TriggerNotificationInput = z.input<
  typeof TriggerNotificationSchema
>;

class NotificationDispatchError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const activePeriod = (now: Date) => ({
  revokedAt: null,
  validFrom: { lte: now },
  OR: [{ validUntil: null }, { validUntil: { gte: now } }],
});

async function assertBranch(
  tx: TenantTransactionClient,
  tenantId: string,
  branchId: string | undefined,
) {
  if (!branchId) return;

  const branch = await tx.branch.findUnique({
    where: { tenantId_id: { tenantId, id: branchId } },
    select: { id: true, status: true },
  });

  if (!branch || branch.status !== BranchStatus.ACTIVE) {
    throw new NotificationDispatchError(
      "The target branch does not belong to the tenant.",
      404,
      "NOTIFICATION_BRANCH_NOT_FOUND",
    );
  }
}

async function resolveDirectRecipient(
  tx: TenantTransactionClient,
  input: z.output<typeof TriggerNotificationSchema>,
  now: Date,
) {
  if (!input.targetUserId) return null;

  const membership = await tx.tenantMembership.findFirst({
    where: {
      tenantId: input.tenantId,
      userId: input.targetUserId,
      status: MembershipStatus.ACTIVE,
      user: { status: UserStatus.ACTIVE },
      ...(input.branchId
        ? {
            branchMemberships: {
              some: {
                tenantId: input.tenantId,
                branchId: input.branchId,
                ...activePeriod(now),
              },
            },
          }
        : {}),
    },
    select: { userId: true },
  });

  if (!membership) {
    throw new NotificationDispatchError(
      "The target user has no active membership in this scope.",
      404,
      "NOTIFICATION_USER_NOT_FOUND",
    );
  }

  return membership.userId;
}

async function resolveRoleRecipients(
  tx: TenantTransactionClient,
  input: z.output<typeof TriggerNotificationSchema>,
  now: Date,
) {
  if (!input.targetRoleName) {
    return { roleId: null, userIds: [] as string[] };
  }

  const role = await tx.role.findFirst({
    where: {
      tenantId: input.tenantId,
      name: input.targetRoleName,
    },
    select: { id: true, scope: true },
  });

  if (!role) {
    throw new NotificationDispatchError(
      "The target role does not exist in this tenant.",
      404,
      "NOTIFICATION_ROLE_NOT_FOUND",
    );
  }

  const assignments = await tx.roleAssignment.findMany({
    where: {
      tenantId: input.tenantId,
      roleId: role.id,
      ...activePeriod(now),
      membership: {
        status: MembershipStatus.ACTIVE,
        user: { status: UserStatus.ACTIVE },
      },
    },
    select: {
      branchId: true,
      membershipId: true,
      membership: { select: { userId: true } },
    },
  });

  const branchMemberships = await tx.branchMembership.findMany({
    where: {
      tenantId: input.tenantId,
      membershipId: { in: assignments.map(({ membershipId }) => membershipId) },
      ...activePeriod(now),
      branch: { status: "ACTIVE" },
      ...(input.branchId ? { branchId: input.branchId } : {}),
    },
    select: { membershipId: true, branchId: true },
  });
  const branchesByMembership = new Map<string, Set<string>>();

  for (const membership of branchMemberships) {
    const branchIds =
      branchesByMembership.get(membership.membershipId) ?? new Set<string>();
    branchIds.add(membership.branchId);
    branchesByMembership.set(membership.membershipId, branchIds);
  }

  const userIds = assignments.flatMap((assignment) => {
    const activeBranchIds =
      branchesByMembership.get(assignment.membershipId) ?? new Set<string>();

    if (input.branchId && !activeBranchIds.has(input.branchId)) return [];
    if (role.scope === RoleScope.BRANCH) {
      if (!assignment.branchId) return [];
      if (input.branchId && assignment.branchId !== input.branchId) return [];
      if (!activeBranchIds.has(assignment.branchId)) return [];
    } else if (assignment.branchId !== null) {
      return [];
    }

    return [assignment.membership.userId];
  });

  return { roleId: role.id, userIds };
}

async function resolveBroadcastRecipients(
  tx: TenantTransactionClient,
  input: z.output<typeof TriggerNotificationSchema>,
  now: Date,
) {
  if (input.targetRoleName || input.targetUserId) return [];

  const memberships = await tx.tenantMembership.findMany({
    where: {
      tenantId: input.tenantId,
      status: MembershipStatus.ACTIVE,
      user: { status: UserStatus.ACTIVE },
      ...(input.branchId
        ? {
            branchMemberships: {
              some: {
                tenantId: input.tenantId,
                branchId: input.branchId,
                ...activePeriod(now),
              },
            },
          }
        : {}),
    },
    select: { userId: true },
  });

  return memberships.map(({ userId }) => userId);
}

export async function triggerNotification(rawInput: TriggerNotificationInput) {
  const input = TriggerNotificationSchema.parse(rawInput);
  const { withTenantTransaction } = await import("../db/prisma");

  return withTenantTransaction(input.tenantId, async (tx) => {
    const now = new Date();
    await assertBranch(tx, input.tenantId, input.branchId);

    const directUserId = await resolveDirectRecipient(tx, input, now);
    const roleRecipients = await resolveRoleRecipients(tx, input, now);
    const broadcastUserIds = await resolveBroadcastRecipients(
      tx,
      input,
      now,
    );
    const recipientUserIds = Array.from(
      new Set([
        ...(directUserId ? [directUserId] : []),
        ...roleRecipients.userIds,
        ...broadcastUserIds,
      ]),
    );

    if (recipientUserIds.length === 0) {
      throw new NotificationDispatchError(
        "No active recipients were found for this notification.",
        422,
        "NOTIFICATION_RECIPIENTS_NOT_FOUND",
      );
    }

    return tx.notification.create({
      data: {
        tenantId: input.tenantId,
        branchId: input.branchId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        targetRoleId: roleRecipients.roleId,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        recipients: {
          createMany: {
            data: recipientUserIds.map((userId) => ({
              userId,
            })),
          },
        },
      },
      include: {
        recipients: {
          select: {
            id: true,
            userId: true,
            read: true,
            readAt: true,
            deleted: true,
          },
        },
      },
    });
  });
}
