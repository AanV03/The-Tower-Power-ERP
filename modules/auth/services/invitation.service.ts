import {
  InvitationStatus,
  MembershipStatus,
  Prisma,
  RoleScope,
  SecurityEventType,
  TenantStatus,
  UserStatus,
} from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import type {
  InvitationTokenClaims,
} from "@/lib/auth/invitation-token";
import { ApiError } from "@/lib/api/response";
import {
  prisma,
  withTenantTransaction,
  type TenantTransactionClient,
} from "@/lib/db/prisma";
import type {
  AcceptInvitationInput,
} from "@/modules/auth/schemas/invitation.schema";

type InvitationRequestMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string;
};

type RequestedRole = {
  roleId: string;
  branchId: string | null;
};

function asJsonRecord(value: Prisma.JsonValue): Record<string, Prisma.JsonValue> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, Prisma.JsonValue>;
}

function validId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 191
  );
}

function parseStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter(validId)));
}

function parseRequestedRoles(value: Prisma.JsonValue): RequestedRole[] {
  const values = Array.isArray(value) ? value : [value];
  const roles = values.flatMap<RequestedRole>((item) => {
    if (validId(item)) return [{ roleId: item, branchId: null }];

    const record = asJsonRecord(item);
    const roleId = record.roleId;
    const branchId = record.branchId;
    if (!validId(roleId)) return [];

    return [{
      roleId,
      branchId: validId(branchId) ? branchId : null,
    }];
  });

  return Array.from(
    new Map(
      roles.map((role) => [
        `${role.roleId}:${role.branchId ?? ""}`,
        role,
      ]),
    ).values(),
  );
}

async function resolveInvitationIdentity(claims: InvitationTokenClaims) {
  const user = await prisma.user.findUnique({
    where: { id: claims.userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      memberships: {
        select: {
          id: true,
          tenantId: true,
          status: true,
          tenant: { select: { status: true } },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(
      "El usuario invitado no existe.",
      404,
      "INVITED_USER_NOT_FOUND",
    );
  }

  if (user.status === UserStatus.ACTIVE) {
    throw new ApiError(
      "Esta cuenta ya fue activada.",
      409,
      "USER_ALREADY_ACTIVE",
    );
  }

  const memberships = claims.tenantId
    ? user.memberships.filter(
        (membership) => membership.tenantId === claims.tenantId,
      )
    : user.memberships.filter(
        (membership) => membership.status === MembershipStatus.INVITED,
      );

  if (memberships.length !== 1) {
    throw new ApiError(
      "La invitacion no identifica una membresia unica.",
      400,
      "INVITATION_MEMBERSHIP_INVALID",
    );
  }

  const membership = memberships[0];
  if (
    membership.status === MembershipStatus.SUSPENDED ||
    membership.tenant.status !== TenantStatus.ACTIVE
  ) {
    throw new ApiError(
      "La membresia o el tenant no estan activos.",
      403,
      "INVITATION_MEMBERSHIP_DISABLED",
    );
  }

  return { user, membership };
}

async function upsertBranchMemberships(
  tx: TenantTransactionClient,
  tenantId: string,
  membershipId: string,
  branchIds: string[],
) {
  if (branchIds.length === 0) return;

  const branches = await tx.branch.findMany({
    where: {
      tenantId,
      id: { in: branchIds },
      status: "ACTIVE",
    },
    select: { id: true },
  });
  const validBranchIds = new Set(branches.map((branch) => branch.id));

  if (validBranchIds.size !== branchIds.length) {
    throw new ApiError(
      "La invitacion contiene una sucursal invalida.",
      400,
      "INVITATION_BRANCH_INVALID",
    );
  }

  await Promise.all(
    branchIds.map((branchId) =>
      tx.branchMembership.upsert({
        where: {
          tenantId_membershipId_branchId: {
            tenantId,
            membershipId,
            branchId,
          },
        },
        update: {
          revokedAt: null,
          validUntil: null,
        },
        create: {
          tenantId,
          membershipId,
          branchId,
        },
      }),
    ),
  );
}

async function upsertRoleAssignment(
  tx: TenantTransactionClient,
  input: {
    tenantId: string;
    membershipId: string;
    roleId: string;
    branchId: string | null;
    assignedByMembershipId: string | null;
    now: Date;
  },
) {
  const existing = await tx.roleAssignment.findFirst({
    where: {
      tenantId: input.tenantId,
      membershipId: input.membershipId,
      roleId: input.roleId,
      branchId: input.branchId,
    },
    select: { id: true },
  });

  if (existing) {
    await tx.roleAssignment.update({
      where: { id: existing.id },
      data: {
        revokedAt: null,
        validFrom: input.now,
        validUntil: null,
      },
    });
    return;
  }

  await tx.roleAssignment.create({
    data: {
      tenantId: input.tenantId,
      membershipId: input.membershipId,
      roleId: input.roleId,
      branchId: input.branchId,
      assignedByMembershipId: input.assignedByMembershipId,
      validFrom: input.now,
    },
  });
}

async function applyInvitationRoles(
  tx: TenantTransactionClient,
  input: {
    tenantId: string;
    membershipId: string;
    defaultBranchId: string | null;
    invitation: {
      invitedByMembershipId: string;
      roleAssignments: Prisma.JsonValue;
      branchIds: Prisma.JsonValue;
    } | null;
    now: Date;
  },
) {
  const currentAssignments = await tx.roleAssignment.findMany({
    where: {
      tenantId: input.tenantId,
      membershipId: input.membershipId,
      revokedAt: null,
      validFrom: { lte: input.now },
      OR: [
        { validUntil: null },
        { validUntil: { gte: input.now } },
      ],
    },
    select: {
      branchId: true,
      role: { select: { scope: true } },
    },
  });

  if (
    currentAssignments.some(
      (assignment) =>
        assignment.role.scope === RoleScope.SYSTEM ||
        (assignment.role.scope === RoleScope.BRANCH &&
          !assignment.branchId) ||
        (assignment.role.scope === RoleScope.TENANT &&
          assignment.branchId !== null),
    )
  ) {
    throw new ApiError(
      "La invitacion contiene un rol invalido.",
      400,
      "INVITATION_ROLE_INVALID",
    );
  }

  const invitationRoles = input.invitation
    ? parseRequestedRoles(input.invitation.roleAssignments)
    : [];
  if (currentAssignments.length === 0 && invitationRoles.length === 0) {
    throw new ApiError(
      "La invitacion no contiene un rol valido.",
      400,
      "INVITATION_ROLE_REQUIRED",
    );
  }

  const requestedBranchIds = input.invitation
    ? parseStringArray(input.invitation.branchIds)
    : [];
  const roleBranchIds = invitationRoles.flatMap((role) =>
    role.branchId ? [role.branchId] : [],
  );
  const currentBranchIds = currentAssignments.flatMap((assignment) =>
    assignment.branchId ? [assignment.branchId] : [],
  );
  const branchIds = Array.from(
    new Set([
      ...requestedBranchIds,
      ...roleBranchIds,
      ...currentBranchIds,
      ...(input.defaultBranchId ? [input.defaultBranchId] : []),
    ]),
  );

  await upsertBranchMemberships(
    tx,
    input.tenantId,
    input.membershipId,
    branchIds,
  );

  if (invitationRoles.length === 0) return;

  const roleIds = Array.from(
    new Set(invitationRoles.map((role) => role.roleId)),
  );
  const roles = await tx.role.findMany({
    where: {
      tenantId: input.tenantId,
      id: { in: roleIds },
    },
    select: { id: true, scope: true },
  });
  const rolesById = new Map(roles.map((role) => [role.id, role]));

  if (
    roles.length !== roleIds.length ||
    roles.some((role) => role.scope === RoleScope.SYSTEM)
  ) {
    throw new ApiError(
      "La invitacion contiene un rol invalido.",
      400,
      "INVITATION_ROLE_INVALID",
    );
  }

  for (const requestedRole of invitationRoles) {
    const role = rolesById.get(requestedRole.roleId);
    if (!role) {
      throw new ApiError(
        "La invitacion contiene un rol invalido.",
        400,
        "INVITATION_ROLE_INVALID",
      );
    }

    if (role.scope === RoleScope.BRANCH) {
      const scopedBranchIds = requestedRole.branchId
        ? [requestedRole.branchId]
        : requestedBranchIds.length > 0
          ? requestedBranchIds
          : input.defaultBranchId
            ? [input.defaultBranchId]
            : [];

      if (scopedBranchIds.length === 0) {
        throw new ApiError(
          "El rol de sucursal requiere una sucursal valida.",
          400,
          "INVITATION_BRANCH_REQUIRED",
        );
      }

      for (const branchId of scopedBranchIds) {
        await upsertRoleAssignment(tx, {
          tenantId: input.tenantId,
          membershipId: input.membershipId,
          roleId: role.id,
          branchId,
          assignedByMembershipId:
            input.invitation?.invitedByMembershipId ?? null,
          now: input.now,
        });
      }
      continue;
    }

    await upsertRoleAssignment(tx, {
      tenantId: input.tenantId,
      membershipId: input.membershipId,
      roleId: role.id,
      branchId: null,
      assignedByMembershipId:
        input.invitation?.invitedByMembershipId ?? null,
      now: input.now,
    });
  }
}

export async function activateInvitedUser(
  claims: InvitationTokenClaims,
  input: AcceptInvitationInput,
  metadata: InvitationRequestMetadata,
) {
  const { user, membership } = await resolveInvitationIdentity(claims);
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await withTenantTransaction(membership.tenantId, async (tx) => {
    const currentMembership = await tx.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId: membership.tenantId,
          userId: user.id,
        },
      },
      select: {
        id: true,
        defaultBranchId: true,
        status: true,
      },
    });

    if (!currentMembership) {
      throw new ApiError(
        "La membresia invitada no existe.",
        404,
        "INVITED_MEMBERSHIP_NOT_FOUND",
      );
    }

    const invitation = user.email
      ? await tx.userInvitation.findFirst({
          where: {
            tenantId: membership.tenantId,
            email: user.email,
            status: InvitationStatus.PENDING,
            expiresAt: { gt: now },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            invitedByMembershipId: true,
            roleAssignments: true,
            branchIds: true,
          },
        })
      : null;

    const activated = await tx.user.updateMany({
      where: {
        id: user.id,
        status: UserStatus.INVITED,
      },
      data: {
        name: input.name ?? user.name,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerified: now,
      },
    });

    if (activated.count !== 1) {
      throw new ApiError(
        "Esta cuenta ya fue activada.",
        409,
        "USER_ALREADY_ACTIVE",
      );
    }

    await applyInvitationRoles(tx, {
      tenantId: membership.tenantId,
      membershipId: currentMembership.id,
      defaultBranchId: currentMembership.defaultBranchId,
      invitation,
      now,
    });

    await tx.tenantMembership.update({
      where: {
        tenantId_id: {
          tenantId: membership.tenantId,
          id: currentMembership.id,
        },
      },
      data: {
        status: MembershipStatus.ACTIVE,
        joinedAt: currentMembership.status === MembershipStatus.ACTIVE
          ? undefined
          : now,
      },
    });

    if (invitation) {
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: now,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        tenantId: membership.tenantId,
        actorId: currentMembership.id,
        branchId: currentMembership.defaultBranchId,
        action: "auth.invitation.accept",
        entity: "User",
        entityId: user.id,
        oldValues: { status: UserStatus.INVITED },
        newValues: { status: UserStatus.ACTIVE },
        ipAddress: metadata.ipAddress,
        correlationId: metadata.correlationId,
      },
    });

    await tx.securityEvent.create({
      data: {
        tenantId: membership.tenantId,
        userId: user.id,
        eventType: SecurityEventType.PASSWORD_CHANGED,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: {
          source: "INVITATION_ACCEPTED",
          correlationId: metadata.correlationId,
        },
      },
    });
  });

  return {
    userId: user.id,
    tenantId: membership.tenantId,
  };
}
