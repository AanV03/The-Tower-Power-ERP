import { PrismaPg } from "@prisma/adapter-pg";
import {
  BillingPeriod,
  BranchStatus,
  MembershipStatus,
  Prisma,
  PrismaClient,
  RoleScope,
  SubscriptionStatus,
  UserStatus,
} from "@prisma/client";

import { hashPassword, normalizeEmail } from "../lib/auth/password";

const OWNER_EMAIL = "owner@gerpy.com";
const OWNER_PASSWORD = "Password123!";
const DEMO_TENANT_SLUG = "gerpy-demo";
const DEMO_SEED_CONFIRMATION = OWNER_EMAIL;

const connectionString = process.env.DEMO_DATABASE_URL;

if (!connectionString) {
  throw new Error("DEMO_DATABASE_URL is required.");
}

if (process.env.VERCEL === "1") {
  throw new Error("DEMO_SEED_LOCAL_ONLY: this script cannot run in Vercel.");
}

if (
  process.env.ALLOW_PRODUCTION_DEMO_SEED !== DEMO_SEED_CONFIRMATION
) {
  throw new Error(
    `Set ALLOW_PRODUCTION_DEMO_SEED=${DEMO_SEED_CONFIRMATION} to confirm the target account.`,
  );
}

process.env.DATABASE_URL ??= connectionString;

const {
  DEFAULT_OWNER_PERMISSIONS,
  enableDefaultTenantModules,
  permissionDefinition,
} = await import("../lib/auth/tenant-context");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type Tx = Prisma.TransactionClient;

type DemoProduct = {
  sku: string;
  name: string;
  category: string;
  price: string;
  cost: string;
  taxRate: string;
  stock: string;
  reorderPoint: string;
};

const PRODUCTS: DemoProduct[] = [
  { sku: "WHEY-CHOC-2KG", name: "Proteina Whey Chocolate 2 kg", category: "Suplementos", price: "1299.00", cost: "850.00", taxRate: "16.00", stock: "18", reorderPoint: "6" },
  { sku: "CREA-MONO-300G", name: "Creatina Monohidratada 300 g", category: "Suplementos", price: "499.00", cost: "280.00", taxRate: "16.00", stock: "24", reorderPoint: "8" },
  { sku: "BCAA-400G", name: "BCAA Frutos Rojos 400 g", category: "Suplementos", price: "549.00", cost: "310.00", taxRate: "16.00", stock: "16", reorderPoint: "5" },
  { sku: "BAR-PROT-CHOCO", name: "Barra de Proteina Chocolate", category: "Suplementos", price: "55.00", cost: "25.00", taxRate: "16.00", stock: "80", reorderPoint: "20" },
  { sku: "WATER-1L", name: "Agua Natural 1 L", category: "Bebidas", price: "28.00", cost: "10.00", taxRate: "0.00", stock: "120", reorderPoint: "30" },
  { sku: "ISO-SPORT-600ML", name: "Bebida Isotonica 600 ml", category: "Bebidas", price: "38.00", cost: "16.00", taxRate: "16.00", stock: "72", reorderPoint: "18" },
  { sku: "TOWEL-MICRO-BLK", name: "Toalla de Microfibra Negra", category: "Accesorios", price: "219.00", cost: "95.00", taxRate: "16.00", stock: "35", reorderPoint: "10" },
  { sku: "SHAKER-700ML", name: "Shaker Deportivo 700 ml", category: "Accesorios", price: "149.00", cost: "55.00", taxRate: "16.00", stock: "48", reorderPoint: "12" },
  { sku: "BAND-RES-MED", name: "Banda de Resistencia Media", category: "Equipo", price: "189.00", cost: "80.00", taxRate: "16.00", stock: "30", reorderPoint: "8" },
  { sku: "GLOVES-TRAIN-M", name: "Guantes de Entrenamiento Medianos", category: "Equipo", price: "349.00", cost: "170.00", taxRate: "16.00", stock: "14", reorderPoint: "5" },
  { sku: "YOGA-MAT-6MM", name: "Tapete de Yoga 6 mm", category: "Equipo", price: "499.00", cost: "250.00", taxRate: "16.00", stock: "20", reorderPoint: "6" },
  { sku: "ROPE-SPEED", name: "Cuerda de Velocidad Ajustable", category: "Equipo", price: "279.00", cost: "120.00", taxRate: "16.00", stock: "25", reorderPoint: "7" },
];

const EMPLOYEES = [
  { firstName: "Ana", lastName: "Torres", email: "ana.torres@gerpy.demo", phone: "+52 55 4100 1001", position: "Recepcionista", department: "Operaciones", hireDate: "2025-02-10" },
  { firstName: "Carlos", lastName: "Mendoza", email: "carlos.mendoza@gerpy.demo", phone: "+52 55 4100 1002", position: "Entrenador", department: "Fitness", hireDate: "2024-09-16" },
  { firstName: "Fernanda", lastName: "Ruiz", email: "fernanda.ruiz@gerpy.demo", phone: "+52 55 4100 1003", position: "Gerente", department: "Administracion", hireDate: "2024-01-08" },
  { firstName: "Diego", lastName: "Salas", email: "diego.salas@gerpy.demo", phone: "+52 55 4100 1004", position: "Nutriologo", department: "Bienestar", hireDate: "2025-05-05" },
  { firstName: "Lucia", lastName: "Navarro", email: "lucia.navarro@gerpy.demo", phone: "+52 55 4100 1005", position: "Mantenimiento", department: "Operaciones", hireDate: "2025-07-21" },
] as const;

const MEMBERSHIP_PLANS = [
  { name: "Basico", price: "599.00", description: "Acceso al area de gimnasio en horario regular.", classesPerMonth: 0, guestPasses: 0 },
  { name: "Pro", price: "899.00", description: "Acceso ilimitado y cuatro clases grupales al mes.", classesPerMonth: 4, guestPasses: 1 },
  { name: "VIP", price: "1299.00", description: "Acceso ilimitado, clases sin limite y beneficios premium.", classesPerMonth: -1, guestPasses: 4 },
] as const;

const MEMBERS = [
  { firstName: "Sofia", lastName: "Martinez", email: "sofia.martinez@gerpy.demo", phone: "+52 55 4200 2001", birthDate: "1997-04-12", plan: "VIP" },
  { firstName: "Jorge", lastName: "Ramirez", email: "jorge.ramirez@gerpy.demo", phone: "+52 55 4200 2002", birthDate: "1991-11-23", plan: "Pro" },
  { firstName: "Valeria", lastName: "Castro", email: "valeria.castro@gerpy.demo", phone: "+52 55 4200 2003", birthDate: "2000-07-08", plan: "Basico" },
  { firstName: "Miguel", lastName: "Herrera", email: "miguel.herrera@gerpy.demo", phone: "+52 55 4200 2004", birthDate: "1988-02-19", plan: "Pro" },
  { firstName: "Camila", lastName: "Ortega", email: "camila.ortega@gerpy.demo", phone: "+52 55 4200 2005", birthDate: "1995-09-30", plan: "VIP" },
] as const;

function decimal(value: string | number) {
  return new Prisma.Decimal(value);
}

function jsonRecord(value: Prisma.JsonValue | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Prisma.JsonObject;
}

async function ensureSaasPlan(tx: Tx) {
  return tx.saasPlan.upsert({
    where: { name: "Demo Premium" },
    update: {
      description: "Plan para demostraciones con todos los modulos habilitados.",
      price: decimal(0),
    },
    create: {
      name: "Demo Premium",
      description: "Plan para demostraciones con todos los modulos habilitados.",
      price: decimal(0),
      currency: "MXN",
      interval: "MONTHLY",
      limits: { branches: 3, users: 25, demo: true },
    },
  });
}

async function ensureOwnerRole(
  tx: Tx,
  tenantId: string,
  membershipId: string,
) {
  const existingRole = await tx.role.findFirst({
    where: {
      tenantId,
      name: { in: ["Owner", "OWNER"] },
    },
    orderBy: { createdAt: "asc" },
  });
  const role = existingRole
    ? await tx.role.update({
        where: { id: existingRole.id },
        data: {
          scope: RoleScope.TENANT,
          description: "Propietario del tenant con acceso completo.",
        },
      })
    : await tx.role.create({
        data: {
          tenantId,
          name: "Owner",
          scope: RoleScope.TENANT,
          description: "Propietario del tenant con acceso completo.",
        },
      });

  const permissions = [];
  for (const key of DEFAULT_OWNER_PERMISSIONS) {
    const definition = permissionDefinition(key);
    permissions.push(
      await tx.permission.upsert({
        where: { key },
        update: definition,
        create: {
          ...definition,
          description: `Allows ${key}.`,
        },
      }),
    );
  }

  await tx.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  const currentAssignment = await tx.roleAssignment.findFirst({
    where: {
      tenantId,
      membershipId,
      roleId: role.id,
      branchId: null,
    },
    select: { id: true },
  });

  if (currentAssignment) {
    await tx.roleAssignment.update({
      where: { id: currentAssignment.id },
      data: { validUntil: null, revokedAt: null },
    });
  } else {
    await tx.roleAssignment.create({
      data: {
        tenantId,
        membershipId,
        roleId: role.id,
        assignedByMembershipId: membershipId,
      },
    });
  }

  return role;
}

async function ensureDemoIdentity(tx: Tx, passwordHash: string) {
  const email = normalizeEmail(OWNER_EMAIL);
  const user = await tx.user.upsert({
    where: { email },
    update: {
      name: "Owner Gerpy Demo",
      passwordHash,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Owner Gerpy Demo",
      email,
      passwordHash,
      status: UserStatus.ACTIVE,
    },
  });
  const existingMemberships = await tx.tenantMembership.findMany({
    where: { userId: user.id },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });
  const selectedMembership =
    existingMemberships.find(
      (membership) => membership.tenant.slug === DEMO_TENANT_SLUG,
    ) ??
    existingMemberships.find(
      (membership) => membership.status === MembershipStatus.ACTIVE,
    ) ??
    existingMemberships[0];
  const demoPlan = await ensureSaasPlan(tx);
  let tenant = selectedMembership?.tenant;

  if (!tenant) {
    tenant = await tx.tenant.upsert({
      where: { slug: DEMO_TENANT_SLUG },
      update: { status: "ACTIVE" },
      create: {
        slug: DEMO_TENANT_SLUG,
        name: "Gerpy Demo Fitness",
        legalName: "Gerpy Demo Fitness S.A. de C.V.",
        taxId: "GDF260101AB1",
        status: "ACTIVE",
        planId: demoPlan.id,
        brandIdentity: {
          demo: true,
          adminOnboardingCompleted: true,
          adminOnboardingVersion: 1,
        },
      },
    });
  } else {
    const identity = jsonRecord(tenant.brandIdentity);
    tenant = await tx.tenant.update({
      where: { id: tenant.id },
      data: {
        status: "ACTIVE",
        planId: tenant.planId ?? demoPlan.id,
        brandIdentity: {
          ...identity,
          demoSeeded: true,
        },
      },
    });
  }

  let branch = selectedMembership?.defaultBranchId
    ? await tx.branch.findFirst({
        where: {
          id: selectedMembership.defaultBranchId,
          tenantId: tenant.id,
        },
      })
    : null;

  branch ??= await tx.branch.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "asc" },
  });
  branch ??= await tx.branch.create({
    data: {
      tenantId: tenant.id,
      name: "Sucursal Demo Centro",
      code: "DEMO-MAIN",
      timezone: "America/Mexico_City",
      status: BranchStatus.ACTIVE,
      address: {
        line1: "Av. Reforma 123",
        city: "Ciudad de Mexico",
        country: "MX",
      },
    },
  });

  const membership = await tx.tenantMembership.upsert({
    where: {
      tenantId_userId: { tenantId: tenant.id, userId: user.id },
    },
    update: {
      defaultBranchId: branch.id,
      status: MembershipStatus.ACTIVE,
      joinedAt: selectedMembership?.joinedAt ?? new Date(),
    },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      defaultBranchId: branch.id,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  await tx.branchMembership.upsert({
    where: {
      tenantId_membershipId_branchId: {
        tenantId: tenant.id,
        membershipId: membership.id,
        branchId: branch.id,
      },
    },
    update: { validUntil: null, revokedAt: null },
    create: {
      tenantId: tenant.id,
      membershipId: membership.id,
      branchId: branch.id,
    },
  });

  await enableDefaultTenantModules(tx, tenant.id);
  await ensureOwnerRole(tx, tenant.id, membership.id);

  return { user, tenant, branch, membership };
}

async function seedEmployees(tx: Tx, tenantId: string, branchId: string) {
  for (const employee of EMPLOYEES) {
    const position = await tx.position.upsert({
      where: {
        tenantId_name: { tenantId, name: employee.position },
      },
      update: { department: employee.department },
      create: {
        tenantId,
        name: employee.position,
        department: employee.department,
      },
    });

    await tx.employee.upsert({
      where: {
        tenantId_email: { tenantId, email: employee.email },
      },
      update: {
        branchId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        positionId: position.id,
        status: BranchStatus.ACTIVE,
        hireDate: new Date(`${employee.hireDate}T12:00:00.000Z`),
      },
      create: {
        tenantId,
        branchId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        positionId: position.id,
        status: BranchStatus.ACTIVE,
        hireDate: new Date(`${employee.hireDate}T12:00:00.000Z`),
      },
    });
  }
}

async function seedInventory(tx: Tx, tenantId: string, branchId: string) {
  const categoryIds = new Map<string, string>();
  for (const name of new Set(PRODUCTS.map((product) => product.category))) {
    const category = await tx.productCategory.upsert({
      where: { tenantId_name: { tenantId, name } },
      update: { status: BranchStatus.ACTIVE },
      create: { tenantId, name, status: BranchStatus.ACTIVE },
    });
    categoryIds.set(name, category.id);
  }

  const warehouse = await tx.warehouse.upsert({
    where: {
      tenantId_branchId_name: {
        tenantId,
        branchId,
        name: "Almacen Principal",
      },
    },
    update: {},
    create: { tenantId, branchId, name: "Almacen Principal" },
  });

  for (const item of PRODUCTS) {
    const product = await tx.product.upsert({
      where: { tenantId_sku: { tenantId, sku: item.sku } },
      update: {
        name: item.name,
        categoryId: categoryIds.get(item.category),
        price: decimal(item.price),
        cost: decimal(item.cost),
        taxRate: decimal(item.taxRate),
        status: BranchStatus.ACTIVE,
      },
      create: {
        tenantId,
        sku: item.sku,
        name: item.name,
        categoryId: categoryIds.get(item.category),
        price: decimal(item.price),
        cost: decimal(item.cost),
        taxRate: decimal(item.taxRate),
        status: BranchStatus.ACTIVE,
      },
    });

    await tx.inventoryItem.upsert({
      where: {
        tenantId_warehouseId_productId: {
          tenantId,
          warehouseId: warehouse.id,
          productId: product.id,
        },
      },
      update: {
        quantityOnHand: decimal(item.stock),
        quantityReserved: decimal(0),
        reorderPoint: decimal(item.reorderPoint),
      },
      create: {
        tenantId,
        warehouseId: warehouse.id,
        productId: product.id,
        quantityOnHand: decimal(item.stock),
        quantityReserved: decimal(0),
        reorderPoint: decimal(item.reorderPoint),
      },
    });
  }
}

async function seedMembers(tx: Tx, tenantId: string, branchId: string) {
  const planIds = new Map<string, string>();
  for (const plan of MEMBERSHIP_PLANS) {
    const membershipPlan = await tx.membershipPlan.upsert({
      where: { tenantId_name: { tenantId, name: plan.name } },
      update: {
        billingPeriod: BillingPeriod.MONTHLY,
        price: decimal(plan.price),
        currency: "MXN",
        accessRules: {
          description: plan.description,
          classesPerMonth: plan.classesPerMonth,
          guestPasses: plan.guestPasses,
        },
        status: BranchStatus.ACTIVE,
      },
      create: {
        tenantId,
        name: plan.name,
        billingPeriod: BillingPeriod.MONTHLY,
        price: decimal(plan.price),
        currency: "MXN",
        accessRules: {
          description: plan.description,
          classesPerMonth: plan.classesPerMonth,
          guestPasses: plan.guestPasses,
        },
        status: BranchStatus.ACTIVE,
      },
    });
    planIds.set(plan.name, membershipPlan.id);
  }

  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextBillingDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  for (const client of MEMBERS) {
    const member = await tx.member.upsert({
      where: { tenantId_email: { tenantId, email: client.email } },
      update: {
        branchId,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        birthDate: new Date(`${client.birthDate}T12:00:00.000Z`),
        status: "ACTIVE",
      },
      create: {
        tenantId,
        branchId,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        birthDate: new Date(`${client.birthDate}T12:00:00.000Z`),
        status: "ACTIVE",
      },
    });
    const planId = planIds.get(client.plan);
    if (!planId) throw new Error(`Missing membership plan: ${client.plan}`);

    await tx.subscription.upsert({
      where: {
        tenantId_externalReference: {
          tenantId,
          externalReference: `demo-${client.email}`,
        },
      },
      update: {
        memberId: member.id,
        planId,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        nextBillingDate,
        autoRenew: true,
      },
      create: {
        tenantId,
        memberId: member.id,
        planId,
        status: SubscriptionStatus.ACTIVE,
        externalReference: `demo-${client.email}`,
        startDate,
        nextBillingDate,
        autoRenew: true,
      },
    });
  }
}

async function main() {
  const passwordHash = await hashPassword(OWNER_PASSWORD);
  const result = await prisma.$transaction(
    async (tx) => {
      const identity = await ensureDemoIdentity(tx, passwordHash);
      await seedEmployees(tx, identity.tenant.id, identity.branch.id);
      await seedInventory(tx, identity.tenant.id, identity.branch.id);
      await seedMembers(tx, identity.tenant.id, identity.branch.id);

      const [employees, products, plans, members, modules] =
        await Promise.all([
          tx.employee.count({ where: { tenantId: identity.tenant.id } }),
          tx.product.count({ where: { tenantId: identity.tenant.id } }),
          tx.membershipPlan.count({ where: { tenantId: identity.tenant.id } }),
          tx.member.count({ where: { tenantId: identity.tenant.id } }),
          tx.tenantModule.count({
            where: { tenantId: identity.tenant.id, enabled: true },
          }),
        ]);

      return {
        tenantId: identity.tenant.id,
        tenantName: identity.tenant.name,
        branchName: identity.branch.name,
        employees,
        products,
        plans,
        members,
        modules,
      };
    },
    { maxWait: 10_000, timeout: 120_000 },
  );

  console.log("Demo seed completed successfully.");
  console.table(result);
  console.log(`Login: ${OWNER_EMAIL}`);
  console.log(`Password: ${OWNER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
