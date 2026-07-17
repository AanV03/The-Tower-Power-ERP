import { randomUUID } from "node:crypto";
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
    DEFAULT_PERMISSIONS.map((key) =>
      tx.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: `Allows ${key}.` },
      }),
    ),
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
      tenantId: tenant.id,
      branchId: branch.id,
      name: input.name ?? undefined,
      email: input.email ? normalizeEmail(input.email) : undefined,
      status: UserStatus.ACTIVE,
    },
  });

  await tx.userRole.create({
    data: {
      id: randomUUID(),
      userId: input.userId,
      roleId: role.id,
      branchId: branch.id,
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
      select: { id: true, tenantId: true },
    });

    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.tenantId) return null;

    return bootstrapTenantForUser(tx, input);
  });
}

export async function getTenantContext(userId: string): Promise<TenantContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tenantId: true,
      branchId: true,
      roles: {
        select: {
          role: {
            select: {
              name: true,
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
  });

  if (!user?.tenantId) return null;

  return {
    userId: user.id,
    tenantId: user.tenantId,
    branchId: user.branchId,
    roles: user.roles.map((userRole) => userRole.role.name),
    permissions: Array.from(
      new Set(
        user.roles.flatMap((userRole) =>
          userRole.role.permissions.map((rolePermission) => rolePermission.permission.key),
        ),
      ),
    ),
    modules: user.tenant?.modules.map((module) => module.moduleKey) ?? [],
  };
}
