import { ModuleKey, Prisma, RoleScope, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import type { TenantContext } from "@/lib/auth/rbac";

const DEFAULT_MODULES: ModuleKey[] = [
  ModuleKey.DASHBOARD,
  ModuleKey.MEMBERSHIPS,
  ModuleKey.ACCESS,
  ModuleKey.FINANCE,
  ModuleKey.POS,
  ModuleKey.INVENTORY,
  ModuleKey.HR,
  ModuleKey.MARKETING,
  ModuleKey.SPECIALISTS,
  ModuleKey.ADMIN,
  ModuleKey.CATALOG,
  ModuleKey.PURCHASES,
  ModuleKey.WAREHOUSE,
  ModuleKey.ACCOUNTING,
  ModuleKey.PAYROLL,
  ModuleKey.ANALYTICS,
  ModuleKey.INTEGRATIONS,
  ModuleKey.MAINTENANCE,
];

const DEFAULT_PERMISSIONS = [
  "dashboard.read",
  "hr.read",
  "hr.employee.write",
  "hr.contract.write",
  "hr.attendance.write",
  "payroll.read",
  "payroll.period.write",
  "payroll.receipt.write",
  "payroll.preview",
  "payroll.approve",
  "payroll.pay",
  "accounting.read",
  "accounting.account.write",
  "accounting.journal.write",
  "accounting.post",
  "accounting.void",
  "memberships.manage",
  "access.manage",
  "finance.manage",
  "pos.manage",
  "inventory.manage",
  "hr.manage",
  "marketing.manage",
  "specialists.manage",
  "admin.manage",
  "catalog.manage",
  "purchases.manage",
  "warehouse.manage",
  "accounting.manage",
  "payroll.manage",
  "analytics.manage",
  "integrations.manage",
  "maintenance.manage",
];

type PrismaTx = Prisma.TransactionClient;

export type CreateTenantUserInput = {
  name: string;
  email: string;
  password: string;
};

function workspaceName(name: string | null | undefined, email: string | null | undefined) {
  const trimmedName = name?.trim();
  if (trimmedName) return `${trimmedName} Workspace`;

  const emailPrefix = email?.split("@")[0]?.trim();
  return emailPrefix ? `${emailPrefix} Workspace` : "The Tower Power Workspace";
}

function permissionDefinition(key: string) {
  const [moduleSegment, ...segments] = key.split(".");
  const action = segments.pop() ?? "manage";
  const resource = segments.join(".") || moduleSegment;
  const moduleKey = moduleSegment.toUpperCase() as ModuleKey;

  if (!Object.values(ModuleKey).includes(moduleKey)) {
    throw new Error(`INVALID_PERMISSION_MODULE:${key}`);
  }

  return { key, moduleKey, resource, action };
}

async function bootstrapTenantForUser(
  tx: PrismaTx,
  input: {
    userId: string;
    name?: string | null;
    email?: string | null;
  },
) {
  const plan = await tx.saasPlan.upsert({
    where: { name: "Starter" },
    update: {},
    create: {
      name: "Starter",
      description: "Default plan for self-service ERP workspaces.",
      price: new Prisma.Decimal(0),
      currency: "MXN",
      interval: "MONTHLY",
      limits: {
        branches: 1,
        users: 5,
        modules: DEFAULT_MODULES,
      },
    },
  });

  const tenant = await tx.tenant.create({
    data: {
      name: workspaceName(input.name, input.email),
      status: "ACTIVE",
      planId: plan.id,
      brandIdentity: { adminOnboardingCompleted: false },
    },
  });

  const branch = await tx.branch.create({
    data: {
      tenantId: tenant.id,
      name: "Sucursal Principal",
      code: "MAIN",
      timezone: "America/Mexico_City",
      status: "ACTIVE",
    },
  });

  await tx.tenantModule.createMany({
    data: DEFAULT_MODULES.map((moduleKey) => ({
      tenantId: tenant.id,
      moduleKey,
      enabled: true,
    })),
    skipDuplicates: true,
  });

  const role = await tx.role.create({
    data: {
      tenantId: tenant.id,
      name: "Owner",
      scope: RoleScope.TENANT,
      description: "Full access role created with the tenant.",
    },
  });

  const permissions = await Promise.all(
    DEFAULT_PERMISSIONS.map((key) => {
      const definition = permissionDefinition(key);

      return tx.permission.upsert({
        where: { key },
        update: {},
        create: { ...definition, description: `Allows ${key}.` },
      });
    }),
  );

  await tx.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  await tx.user.update({
    where: { id: input.userId },
    data: {
      name: input.name ?? undefined,
      email: input.email ? normalizeEmail(input.email) : undefined,
      status: UserStatus.ACTIVE,
    },
  });

  const membership = await tx.tenantMembership.create({
    data: {
      tenantId: tenant.id,
      userId: input.userId,
      defaultBranchId: branch.id,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  });

  await tx.branchMembership.create({
    data: {
      tenantId: tenant.id,
      membershipId: membership.id,
      branchId: branch.id,
    },
  });

  await tx.roleAssignment.create({
    data: {
      tenantId: tenant.id,
      membershipId: membership.id,
      roleId: role.id,
    },
  });

  return tenant;
}

export async function createUserWithTenant(input: CreateTenantUserInput) {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    const user = await tx.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });

    await bootstrapTenantForUser(tx, {
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    return user;
  });
}

export async function ensureTenantForUser(input: {
  userId: string;
  name?: string | null;
  email?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        memberships: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.memberships.length > 0) return null;

    return bootstrapTenantForUser(tx, input);
  });
}

export async function getTenantContext(
  userId: string,
  options: {
    tenantId?: string | null;
    branchId?: string | null;
  } = {},
): Promise<TenantContext | null> {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      status: true,
      memberships: {
        where: {
          status: "ACTIVE",
          tenant: { status: "ACTIVE" },
        },
        select: {
          id: true,
          tenantId: true,
          defaultBranchId: true,
          branchMemberships: {
            where: {
              revokedAt: null,
              validFrom: { lte: now },
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
              branch: { status: "ACTIVE" },
            },
            select: { branchId: true },
          },
          roleAssignments: {
            where: {
              revokedAt: null,
              validFrom: { lte: now },
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
            },
            select: {
              branchId: true,
              role: {
                select: {
                  name: true,
                  scope: true,
                  permissions: {
                    select: {
                      permission: {
                        select: { key: true },
                      },
                    },
                  },
                },
              },
            },
          },
          tenant: {
            select: {
              modules: {
                where: { enabled: true },
                select: { moduleKey: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user || user.status !== UserStatus.ACTIVE || user.memberships.length === 0) {
    return null;
  }

  const membership =
    (options.tenantId
      ? user.memberships.find((item) => item.tenantId === options.tenantId)
      : user.memberships[0]) ?? null;

  if (!membership) return null;

  const branchIds = membership.branchMemberships.map((item) => item.branchId);
  if (options.branchId && !branchIds.includes(options.branchId)) return null;

  const branchId =
    options.branchId ??
    (membership.defaultBranchId && branchIds.includes(membership.defaultBranchId)
      ? membership.defaultBranchId
      : branchIds[0] ?? null);

  const systemAssignments = user.memberships.flatMap((item) =>
    item.roleAssignments.filter((assignment) => assignment.role.scope === RoleScope.SYSTEM),
  );
  const scopedAssignments = membership.roleAssignments.filter((assignment) => {
    if (assignment.role.scope === RoleScope.TENANT) {
      return assignment.branchId === null;
    }

    if (assignment.role.scope === RoleScope.BRANCH) {
      return Boolean(branchId && assignment.branchId === branchId);
    }

    return false;
  });
  const assignments = [...systemAssignments, ...scopedAssignments];
  const roleScopes = Array.from(new Set(assignments.map((assignment) => assignment.role.scope)));
  const isSystemAdmin = roleScopes.includes(RoleScope.SYSTEM);

  return {
    userId: user.id,
    tenantId: membership.tenantId,
    branchId,
    branchIds,
    roles: Array.from(new Set(assignments.map((assignment) => assignment.role.name))),
    roleScopes,
    isSystemAdmin,
    permissions: Array.from(
      new Set(
        assignments.flatMap((assignment) =>
          assignment.role.permissions.map((rolePermission) => rolePermission.permission.key),
        ),
      ),
    ),
    modules: membership.tenant.modules.map((module) => module.moduleKey),
  };
}
