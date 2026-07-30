import { MembershipStatus, MemberStatus, RoleScope, TenantStatus, UserStatus } from "@prisma/client";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { ApiError } from "@/lib/api/response";
import {
  type TenantTransactionClient,
  withTenantTransaction,
} from "@/lib/db/prisma";

const TenantSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i);

export type PortalContext = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  brandColors: unknown;
  userId: string;
  membershipId: string;
  memberId: string;
  branchId: string;
  member: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    birthDate: Date | null;
    createdAt: Date;
  };
  user: {
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
};

function isCurrent(
  validFrom: Date,
  validUntil: Date | null,
  revokedAt: Date | null,
  now: Date,
) {
  return !revokedAt && validFrom <= now && (!validUntil || validUntil >= now);
}

export async function withPortalContext<T>(
  tenantSlug: string,
  operation: (
    tx: TenantTransactionClient,
    context: PortalContext,
  ) => Promise<T>,
) {
  const slug = TenantSlugSchema.parse(tenantSlug).toLowerCase();
  const authContext = await requireApiContext();

  return withTenantTransaction(authContext.tenantId, async (tx) => {
    const now = new Date();
    const membership = await tx.tenantMembership.findFirst({
      where: {
        tenantId: authContext.tenantId,
        userId: authContext.userId,
        status: MembershipStatus.ACTIVE,
        tenant: {
          slug,
          status: TenantStatus.ACTIVE,
        },
        user: {
          status: UserStatus.ACTIVE,
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            brandColors: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        member: {
          select: {
            id: true,
            branchId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            birthDate: true,
            createdAt: true,
            status: true,
          },
        },
        roleAssignments: {
          include: {
            role: {
              select: {
                name: true,
                scope: true,
              },
            },
          },
        },
        branchMemberships: true,
      },
    });

    if (!membership || !membership.member) {
      throw new ApiError(
        "No existe una membresia de socio activa para este tenant.",
        403,
        "PORTAL_MEMBERSHIP_REQUIRED",
      );
    }

    if (membership.member.status !== MemberStatus.ACTIVE) {
      throw new ApiError(
        "La ficha del socio no esta activa.",
        403,
        "MEMBER_INACTIVE",
      );
    }

    const memberRole = membership.roleAssignments.some((assignment) => {
      if (
        assignment.role.name.toUpperCase() !== "MEMBER" ||
        !isCurrent(
          assignment.validFrom,
          assignment.validUntil,
          assignment.revokedAt,
          now,
        )
      ) {
        return false;
      }

      if (assignment.role.scope === RoleScope.TENANT) {
        return assignment.branchId === null;
      }

      return (
        assignment.role.scope === RoleScope.BRANCH &&
        assignment.branchId === membership.member?.branchId
      );
    });
    const branchAccess = membership.branchMemberships.some(
      (branchMembership) =>
        branchMembership.branchId === membership.member?.branchId &&
        isCurrent(
          branchMembership.validFrom,
          branchMembership.validUntil,
          branchMembership.revokedAt,
          now,
        ),
    );

    if (!memberRole || !branchAccess) {
      throw new ApiError(
        "El usuario no tiene acceso MEMBER vigente en esta sucursal.",
        403,
        "PORTAL_ACCESS_DENIED",
      );
    }

    return operation(tx, {
      tenantId: membership.tenant.id,
      tenantSlug: membership.tenant.slug,
      tenantName: membership.tenant.name,
      brandColors: membership.tenant.brandColors,
      userId: membership.user.id,
      membershipId: membership.id,
      memberId: membership.member.id,
      branchId: membership.member.branchId,
      member: membership.member,
      user: membership.user,
    });
  });
}

export function getPortalContext(tenantSlug: string) {
  return withPortalContext(tenantSlug, async (_tx, context) => context);
}
