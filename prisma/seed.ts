import "dotenv/config";

import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { ModuleKey, Prisma, PrismaClient, RoleScope, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to run prisma seed.");
}

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
  throw new Error("Refusing to reset production data without ALLOW_PRODUCTION_SEED=true.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_PASSWORD = "Password123!";
const ORPHAN_EMAIL = "huerfano@gerpy.com";

const MODULE_IDS = [
  "dashboard",
  "memberships",
  "access",
  "finance",
  "pos",
  "inventory",
  "hr",
  "marketing",
  "specialists",
  "admin",
  "catalog",
  "purchases",
  "warehouse",
  "accounting",
  "payroll",
  "analytics",
  "integrations",
  "maintenance",
] as const;

const GRANULAR_LEVELS = ["read", "write", "approve", "admin"] as const;
const BUSINESS_PERMISSIONS = [
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
] as const;

function granularPermissions(moduleIds: readonly (typeof MODULE_IDS)[number][]) {
  return moduleIds.flatMap((moduleId) => GRANULAR_LEVELS.map((level) => `${moduleId}.${level}`));
}

function managePermissions(moduleIds: readonly (typeof MODULE_IDS)[number][]) {
  return moduleIds.filter((moduleId) => moduleId !== "dashboard").map((moduleId) => `${moduleId}.manage`);
}

function withDashboardRead(permissions: readonly string[]) {
  return Array.from(new Set(["dashboard.read", ...permissions]));
}

const ALL_PERMISSIONS = withDashboardRead([
  ...granularPermissions(MODULE_IDS),
  ...managePermissions(MODULE_IDS),
  ...BUSINESS_PERMISSIONS,
]);

const ROLE_DEFINITIONS = [
  {
    name: "Super Admin",
    scope: RoleScope.SYSTEM,
    description: "Acceso total al sistema para pruebas RBAC.",
    permissions: ALL_PERMISSIONS,
  },
  {
    name: "Owner",
    scope: RoleScope.TENANT,
    description: "Propietario del tenant con acceso operativo completo.",
    permissions: ALL_PERMISSIONS,
  },
  {
    name: "Cajero",
    scope: RoleScope.BRANCH,
    description: "Operador de caja, catálogo, inventario y accesos.",
    permissions: withDashboardRead([
      ...granularPermissions(["pos", "catalog", "inventory", "warehouse", "memberships", "access"]),
      ...managePermissions(["pos", "catalog", "inventory", "warehouse", "memberships", "access"]),
    ]),
  },
  {
    name: "Auditor",
    scope: RoleScope.TENANT,
    description: "Usuario de auditoría financiera y operativa.",
    permissions: withDashboardRead([
      "finance.read",
      "accounting.read",
      "payroll.read",
      "analytics.read",
      "inventory.read",
      "integrations.read",
    ]),
  },
  {
    name: "Entrenador",
    scope: RoleScope.BRANCH,
    description: "Usuario operativo para miembros, RH y especialistas.",
    permissions: withDashboardRead([
      "memberships.read",
      "access.read",
      "hr.read",
      "hr.attendance.write",
      "specialists.read",
    ]),
  },
] as const;

type SeedUserDefinition = {
  email: string;
  name: string;
  role: string;
};

const USER_DEFINITIONS: SeedUserDefinition[] = [
  {
    email: "superadmin@gerpy.com",
    name: "Super Admin Gerpy",
    role: "Super Admin",
  },
  {
    email: "owner@gerpy.com",
    name: "Owner Demo",
    role: "Owner",
  },
  {
    email: "cajero@gerpy.com",
    name: "Cajero Demo",
    role: "Cajero",
  },
  {
    email: "auditor@gerpy.com",
    name: "Auditor Demo",
    role: "Auditor",
  },
  {
    email: "entrenador@gerpy.com",
    name: "Entrenador Demo",
    role: "Entrenador",
  },
  {
    email: ORPHAN_EMAIL,
    name: "Usuario Huerfano Demo",
    role: "Ninguno",
  },
];

type PrismaTransactionClient = Prisma.TransactionClient;

async function cleanDatabase(tx: PrismaTransactionClient) {
  await tx.tenant.deleteMany();

  await tx.userRole.deleteMany();
  await tx.rolePermission.deleteMany();
  await tx.account.deleteMany();
  await tx.session.deleteMany();
  await tx.verificationToken.deleteMany();
  await tx.user.deleteMany();
  await tx.role.deleteMany();
  await tx.permission.deleteMany();
  await tx.saasPlan.deleteMany();
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.$transaction(async (tx) => {
    await cleanDatabase(tx);

    const plan = await tx.saasPlan.create({
      data: {
        name: "Demo Pro",
        description: "Plan demo para presentaciones RBAC y onboarding.",
        price: "0.00",
        currency: "MXN",
        interval: "MONTHLY",
        limits: {
          branches: 1,
          users: USER_DEFINITIONS.length,
          modules: Object.values(ModuleKey),
        },
      },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: "Gimnasio Gerpy Matriz",
        legalName: "Gimnasio Gerpy Matriz S.A. de C.V.",
        status: "ACTIVE",
        planId: plan.id,
      },
    });

    const branch = await tx.branch.create({
      data: {
        tenantId: tenant.id,
        name: "Sucursal Matriz",
        code: "MATRIZ",
        timezone: "America/Mexico_City",
        status: "ACTIVE",
      },
    });

    await tx.tenantModule.createMany({
      data: Object.values(ModuleKey).map((moduleKey) => ({
        tenantId: tenant.id,
        moduleKey,
        enabled: true,
      })),
      skipDuplicates: true,
    });

    await tx.permission.createMany({
      data: ALL_PERMISSIONS.map((key) => ({
        key,
        description: `Permite ${key}.`,
      })),
      skipDuplicates: true,
    });

    const permissions = await tx.permission.findMany({
      where: {
        key: {
          in: ALL_PERMISSIONS,
        },
      },
    });
    const permissionByKey = new Map(permissions.map((permission) => [permission.key, permission.id]));
    const roleByName = new Map<string, string>();

    for (const roleDefinition of ROLE_DEFINITIONS) {
      const role = await tx.role.create({
        data: {
          tenantId: roleDefinition.scope === RoleScope.SYSTEM ? null : tenant.id,
          name: roleDefinition.name,
          scope: roleDefinition.scope,
          description: roleDefinition.description,
        },
      });

      roleByName.set(role.name, role.id);

      await tx.rolePermission.createMany({
        data: roleDefinition.permissions.map((permissionKey) => {
          const permissionId = permissionByKey.get(permissionKey);

          if (!permissionId) {
            throw new Error(`Missing permission during seed: ${permissionKey}`);
          }

          return {
            roleId: role.id,
            permissionId,
          };
        }),
        skipDuplicates: true,
      });
    }

    for (const userDefinition of USER_DEFINITIONS) {
      const isOrphan = userDefinition.email === ORPHAN_EMAIL;

      const user = await tx.user.create({
        data: {
          tenantId: isOrphan ? null : tenant.id,
          branchId: isOrphan ? null : branch.id,
          name: userDefinition.name,
          email: userDefinition.email,
          passwordHash,
          status: UserStatus.ACTIVE,
          twoFactorEnabled: false,
        },
      });

      if (isOrphan || userDefinition.role === "Ninguno") {
        continue;
      }

      const roleId = roleByName.get(userDefinition.role);

      if (!roleId) {
        throw new Error(`Missing role during seed: ${userDefinition.role}`);
      }

      await tx.userRole.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          roleId,
          branchId: branch.id,
          createdAt: new Date(),
        },
      });
    }

    console.log("Seed RBAC + onboarding completado.");
    console.log(`Tenant: ${tenant.name}`);
    console.log(`Branch: ${branch.name}`);
    console.log(`Password demo para todos los usuarios: ${DEMO_PASSWORD}`);
    console.log(`Usuario huerfano: ${ORPHAN_EMAIL}`);
  });
}

main()
  .catch((error) => {
    console.error("Seed RBAC + onboarding fallo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
