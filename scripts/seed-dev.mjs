import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

export const DEFAULT_SUPERADMIN_EMAIL = "superadmin@gerpy.local";
export const DEFAULT_SUPERADMIN_PASSWORD = "GerpyDemo!2026";

const MODULES = [
  "DASHBOARD",
  "POS",
  "ACCESS",
  "CATALOG",
  "PURCHASES",
  "WAREHOUSE",
  "INVENTORY",
  "FINANCE",
  "ACCOUNTING",
  "HR",
  "PAYROLL",
  "SPECIALISTS",
  "MARKETING",
  "ANALYTICS",
  "ADMIN",
  "INTEGRATIONS",
  "MAINTENANCE",
];

const PERMISSIONS = [
  "dashboard.read",
  "pos.manage",
  "access.manage",
  "catalog.manage",
  "purchases.manage",
  "warehouse.manage",
  "inventory.manage",
  "finance.manage",
  "accounting.manage",
  "hr.manage",
  "payroll.manage",
  "specialists.manage",
  "marketing.manage",
  "analytics.manage",
  "admin.manage",
  "integrations.manage",
  "maintenance.manage",
];

export function buildSeedConfig(env = process.env) {
  return {
    superadmin: {
      name: "Gerpy Superadmin",
      email: DEFAULT_SUPERADMIN_EMAIL,
      password: env.SEED_SUPERADMIN_PASSWORD || DEFAULT_SUPERADMIN_PASSWORD,
    },
    tenant: {
      name: "Gerpy Demo Gym",
      legalName: "Gerpy Demo Gym S.A. de C.V.",
      taxId: "GDE260101DEMO",
    },
    branch: {
      name: "Sucursal Centro",
      code: "CENTRO",
      timezone: "America/Mexico_City",
      address: {
        city: "Ciudad de Mexico",
        country: "MX",
        line1: "Av. Demo 123",
      },
    },
    modules: MODULES,
    permissions: PERMISSIONS,
  };
}

export function assertCanRunDevSeed(env = process.env) {
  if (env.NODE_ENV === "production" || env.VERCEL_ENV === "production") {
    throw new Error("SEED_REFUSED_PRODUCTION: dev seed cannot run in production.");
  }
}

function parseEnvText(text) {
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const values = parseEnvText(readFileSync(envPath, "utf8"));
  for (const [key, value] of Object.entries(values)) {
    process.env[key] ??= value;
  }
}

function createPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the development seed.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

function decimal(value) {
  return new Prisma.Decimal(value);
}

async function upsertSaasPlan(tx) {
  return tx.saasPlan.upsert({
    where: { name: "Demo Premium" },
    update: {
      description: "Demo premium plan with all ERP modules enabled.",
      price: decimal(0),
      limits: { branches: 3, users: 25, modules: MODULES },
    },
    create: {
      name: "Demo Premium",
      description: "Demo premium plan with all ERP modules enabled.",
      price: decimal(0),
      currency: "MXN",
      interval: "MONTHLY",
      limits: { branches: 3, users: 25, modules: MODULES },
    },
  });
}

async function upsertTenantCore(tx, config) {
  const plan = await upsertSaasPlan(tx);

  const existingTenant = await tx.tenant.findFirst({
    where: { name: config.tenant.name },
    select: { id: true },
  });

  const tenant = existingTenant
    ? await tx.tenant.update({
        where: { id: existingTenant.id },
        data: {
          legalName: config.tenant.legalName,
          taxId: config.tenant.taxId,
          status: "ACTIVE",
          planId: plan.id,
        },
      })
    : await tx.tenant.create({
        data: {
          name: config.tenant.name,
          legalName: config.tenant.legalName,
          taxId: config.tenant.taxId,
          status: "ACTIVE",
          planId: plan.id,
        },
      });

  const branch = await tx.branch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: config.branch.code } },
    update: {
      name: config.branch.name,
      timezone: config.branch.timezone,
      status: "ACTIVE",
      address: config.branch.address,
    },
    create: {
      tenantId: tenant.id,
      name: config.branch.name,
      code: config.branch.code,
      timezone: config.branch.timezone,
      status: "ACTIVE",
      address: config.branch.address,
    },
  });

  await tx.tenantModule.createMany({
    data: config.modules.map((moduleKey) => ({
      tenantId: tenant.id,
      moduleKey,
      enabled: true,
    })),
    skipDuplicates: true,
  });

  await Promise.all(
    config.modules.map((moduleKey) =>
      tx.tenantModule.update({
        where: { tenantId_moduleKey: { tenantId: tenant.id, moduleKey } },
        data: { enabled: true },
      }),
    ),
  );

  return { tenant, branch };
}

async function upsertSuperAdmin(tx, config, tenantId, branchId) {
  const passwordHash = await bcrypt.hash(config.superadmin.password, 12);

  const user = await tx.user.upsert({
    where: { email: config.superadmin.email },
    update: {
      tenantId,
      branchId,
      name: config.superadmin.name,
      passwordHash,
      status: "ACTIVE",
    },
    create: {
      tenantId,
      branchId,
      name: config.superadmin.name,
      email: config.superadmin.email,
      passwordHash,
      status: "ACTIVE",
    },
  });

  const role = await tx.role.upsert({
    where: { tenantId_name: { tenantId, name: "Super Admin" } },
    update: {
      scope: "TENANT",
      description: "Full access role for development seed.",
    },
    create: {
      tenantId,
      name: "Super Admin",
      scope: "TENANT",
      description: "Full access role for development seed.",
    },
  });

  const permissions = await Promise.all(
    config.permissions.map((key) =>
      tx.permission.upsert({
        where: { key },
        update: { description: `Allows ${key}.` },
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

  await tx.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: { branchId },
    create: { userId: user.id, roleId: role.id, branchId },
  });

  return user;
}

async function seedCatalog(tx, tenantId, branchId) {
  const supplements = await tx.productCategory.upsert({
    where: { tenantId_name: { tenantId, name: "Suplementos" } },
    update: { status: "ACTIVE" },
    create: { tenantId, name: "Suplementos", status: "ACTIVE" },
  });

  const apparel = await tx.productCategory.upsert({
    where: { tenantId_name: { tenantId, name: "Apparel" } },
    update: { status: "ACTIVE" },
    create: { tenantId, name: "Apparel", status: "ACTIVE" },
  });

  const whey = await tx.product.upsert({
    where: { tenantId_sku: { tenantId, sku: "WHEY-VAIN-2KG" } },
    update: {
      name: "Proteina Whey Vainilla 2kg",
      categoryId: supplements.id,
      price: decimal(1290),
      cost: decimal(820),
      taxRate: decimal(16),
      status: "ACTIVE",
    },
    create: {
      tenantId,
      sku: "WHEY-VAIN-2KG",
      name: "Proteina Whey Vainilla 2kg",
      categoryId: supplements.id,
      price: decimal(1290),
      cost: decimal(820),
      taxRate: decimal(16),
      status: "ACTIVE",
    },
  });

  const towel = await tx.product.upsert({
    where: { tenantId_sku: { tenantId, sku: "TOWEL-PRO" } },
    update: {
      name: "Toalla Premium Gerpy",
      categoryId: apparel.id,
      price: decimal(249),
      cost: decimal(95),
      taxRate: decimal(16),
      status: "ACTIVE",
    },
    create: {
      tenantId,
      sku: "TOWEL-PRO",
      name: "Toalla Premium Gerpy",
      categoryId: apparel.id,
      price: decimal(249),
      cost: decimal(95),
      taxRate: decimal(16),
      status: "ACTIVE",
    },
  });

  const warehouse = await tx.warehouse.upsert({
    where: { tenantId_branchId_name: { tenantId, branchId, name: "Almacen Principal" } },
    update: {},
    create: { tenantId, branchId, name: "Almacen Principal" },
  });

  await Promise.all(
    [
      { productId: whey.id, quantityOnHand: 24, reorderPoint: 8 },
      { productId: towel.id, quantityOnHand: 64, reorderPoint: 12 },
    ].map((item) =>
      tx.inventoryItem.upsert({
        where: {
          tenantId_warehouseId_productId: {
            tenantId,
            warehouseId: warehouse.id,
            productId: item.productId,
          },
        },
        update: {
          quantityOnHand: decimal(item.quantityOnHand),
          reorderPoint: decimal(item.reorderPoint),
        },
        create: {
          tenantId,
          warehouseId: warehouse.id,
          productId: item.productId,
          quantityOnHand: decimal(item.quantityOnHand),
          quantityReserved: decimal(0),
          reorderPoint: decimal(item.reorderPoint),
        },
      }),
    ),
  );

  return { whey, towel, warehouse };
}

async function seedOperations(tx, tenantId, branchId, products) {
  const member = await tx.member.upsert({
    where: { tenantId_email: { tenantId, email: "miembro.demo@gerpy.local" } },
    update: {
      branchId,
      firstName: "Alex",
      lastName: "Demo",
      status: "ACTIVE",
    },
    create: {
      tenantId,
      branchId,
      firstName: "Alex",
      lastName: "Demo",
      email: "miembro.demo@gerpy.local",
      phone: "+52 55 0000 0000",
      status: "ACTIVE",
    },
  });

  const plan = await tx.membershipPlan.upsert({
    where: { tenantId_name: { tenantId, name: "Premium Mensual" } },
    update: {
      billingPeriod: "MONTHLY",
      price: decimal(1290),
      status: "ACTIVE",
    },
    create: {
      tenantId,
      name: "Premium Mensual",
      billingPeriod: "MONTHLY",
      price: decimal(1290),
      currency: "MXN",
      accessRules: { visits: "unlimited", classes: true },
      status: "ACTIVE",
    },
  });

  await tx.subscription.upsert({
    where: { tenantId_externalReference: { tenantId, externalReference: "demo-subscription-001" } },
    update: {
      memberId: member.id,
      planId: plan.id,
      status: "ACTIVE",
      autoRenew: true,
    },
    create: {
      tenantId,
      memberId: member.id,
      planId: plan.id,
      status: "ACTIVE",
      externalReference: "demo-subscription-001",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-06-01T00:00:00.000Z"),
      autoRenew: true,
    },
  });

  await tx.accessDevice.upsert({
    where: { tenantId_code: { tenantId, code: "TURN-CENTRO-01" } },
    update: { branchId, status: "ONLINE" },
    create: {
      tenantId,
      branchId,
      name: "Torniquete Centro 01",
      code: "TURN-CENTRO-01",
      type: "TURNSTILE",
      status: "ONLINE",
      metadata: { zone: "Recepcion" },
    },
  });

  const register = await tx.posRegister.upsert({
    where: { tenantId_branchId_name: { tenantId, branchId, name: "Caja Principal" } },
    update: { status: "ACTIVE" },
    create: { tenantId, branchId, name: "Caja Principal", status: "ACTIVE" },
  });

  const openingUser = await tx.user.findFirstOrThrow({ where: { tenantId } });
  const existingCashSession = await tx.cashSession.findFirst({
    where: { tenantId, registerId: register.id, status: "OPEN" },
    orderBy: { openedAt: "asc" },
  });
  const cashSession =
    existingCashSession ??
    (await tx.cashSession.create({
      data: {
        tenantId,
        registerId: register.id,
        openedByUserId: openingUser.id,
        openingAmount: decimal(1500),
        status: "OPEN",
      },
    }));

  const subtotal = 1290;
  const tax = subtotal * 0.16;
  let sale = await tx.sale.findFirst({
    where: { tenantId, branchId, memberId: member.id, status: "PAID" },
    orderBy: { createdAt: "asc" },
  });

  if (!sale) {
    sale = await tx.sale.create({
      data: {
        tenantId,
        branchId,
        cashSessionId: cashSession.id,
        memberId: member.id,
        status: "PAID",
        subtotal: decimal(subtotal),
        tax: decimal(tax),
        total: decimal(subtotal + tax),
        paidAt: new Date(),
        items: {
          create: [{
            tenantId,
            productId: products.whey.id,
            quantity: decimal(1),
            unitPrice: decimal(subtotal),
            total: decimal(subtotal),
          }],
        },
      },
    });
  }

  const existingPayment = await tx.payment.findFirst({
    where: { tenantId, saleId: sale.id, status: "SUCCEEDED" },
  });

  if (!existingPayment) {
    await tx.payment.create({
      data: {
        tenantId,
        branchId,
        memberId: member.id,
        saleId: sale.id,
        amount: decimal(subtotal + tax),
        method: "CARD",
        status: "SUCCEEDED",
        paidAt: new Date(),
      },
    });
  }

  return { member };
}

async function seedFinanceAndPeople(tx, tenantId, branchId) {
  const existingSupplier = await tx.supplier.findFirst({
    where: { tenantId, name: "Proveedor Demo Suplementos" },
  });
  const supplier = existingSupplier
    ? await tx.supplier.update({
        where: { id: existingSupplier.id },
        data: {
          taxId: "SUP260101DEMO",
          email: "proveedor.demo@gerpy.local",
          status: "ACTIVE",
        },
      })
    : await tx.supplier.create({
      data: {
      tenantId,
      name: "Proveedor Demo Suplementos",
      taxId: "SUP260101DEMO",
      email: "proveedor.demo@gerpy.local",
      status: "ACTIVE",
    },
  });

  const existingPurchaseInvoice = await tx.invoice.findFirst({
    where: { tenantId, branchId, supplierId: supplier.id, type: "PAYABLE" },
  });

  if (!existingPurchaseInvoice) {
    await tx.invoice.create({
      data: {
        tenantId,
        branchId,
        supplierId: supplier.id,
        type: "PAYABLE",
        status: "ISSUED",
        subtotal: decimal(82000),
        tax: decimal(13120),
        total: decimal(95120),
        currency: "MXN",
        dueDate: new Date("2026-06-30T00:00:00.000Z"),
        issuedAt: new Date(),
        items: {
          create: [{
            tenantId,
            description: "Compra demo de proteina al mayoreo",
            quantity: decimal(100),
            unitPrice: decimal(820),
            taxRate: decimal(16),
            total: decimal(95120),
          }],
        },
      },
    });
  }

  const accounts = [
    ["1000", "Bancos", "ASSET"],
    ["4000", "Ingresos por ventas", "INCOME"],
    ["5000", "Costo de ventas", "EXPENSE"],
  ];

  for (const [code, name, type] of accounts) {
    await tx.chartAccount.upsert({
      where: { tenantId_code: { tenantId, code } },
      update: { name, type },
      create: { tenantId, code, name, type },
    });
  }

  const position = await tx.position.upsert({
    where: { tenantId_name: { tenantId, name: "Gerente de Sucursal" } },
    update: { department: "Operacion" },
    create: { tenantId, name: "Gerente de Sucursal", department: "Operacion" },
  });

  const employee = await tx.employee.upsert({
    where: { tenantId_email: { tenantId, email: "gerente.demo@gerpy.local" } },
    update: {
      branchId,
      firstName: "Mariana",
      lastName: "Gerente",
      positionId: position.id,
      status: "ACTIVE",
    },
    create: {
      tenantId,
      branchId,
      firstName: "Mariana",
      lastName: "Gerente",
      email: "gerente.demo@gerpy.local",
      phone: "+52 55 1111 1111",
      positionId: position.id,
      status: "ACTIVE",
      hireDate: new Date("2026-01-15T00:00:00.000Z"),
    },
  });

  const existingContract = await tx.employeeContract.findFirst({
    where: { tenantId, employeeId: employee.id, type: "FULL_TIME" },
  });

  if (existingContract) {
    await tx.employeeContract.update({
      where: { id: existingContract.id },
      data: { salary: decimal(28000), startDate: new Date("2026-01-15T00:00:00.000Z") },
    });
  } else {
    await tx.employeeContract.create({
      data: {
        tenantId,
        employeeId: employee.id,
        type: "FULL_TIME",
        salary: decimal(28000),
        startDate: new Date("2026-01-15T00:00:00.000Z"),
      },
    });
  }

  const payrollPeriod = await tx.payrollPeriod.upsert({
    where: {
      tenantId_startDate_endDate: {
        tenantId,
        startDate: new Date("2026-05-01T00:00:00.000Z"),
        endDate: new Date("2026-05-15T00:00:00.000Z"),
      },
    },
    update: { status: "DRAFT" },
    create: {
      tenantId,
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      endDate: new Date("2026-05-15T00:00:00.000Z"),
      status: "DRAFT",
    },
  });

  await tx.payrollItem.upsert({
    where: {
      tenantId_payrollPeriodId_employeeId: {
        tenantId,
        payrollPeriodId: payrollPeriod.id,
        employeeId: employee.id,
      },
    },
    update: {
      baseAmount: decimal(14000),
      overtimeAmount: decimal(1200),
      commissionAmount: decimal(800),
      deductions: decimal(1600),
      netAmount: decimal(14400),
    },
    create: {
      tenantId,
      payrollPeriodId: payrollPeriod.id,
      employeeId: employee.id,
      baseAmount: decimal(14000),
      overtimeAmount: decimal(1200),
      commissionAmount: decimal(800),
      deductions: decimal(1600),
      netAmount: decimal(14400),
    },
  });
}

async function seedMongo(config, tenantId, branchId, userId) {
  if (!process.env.MONGODB_URI) return;

  const maintenanceTicketSchema = new Schema(
    {
      tenantId: { type: String, required: true, index: true },
      branchId: { type: String, required: true, index: true },
      assetId: { type: String },
      assetName: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      status: { type: String, required: true, default: "OPEN" },
      priority: { type: String, required: true, default: "MEDIUM" },
      reportedByUserId: { type: String, required: true },
      createdAt: { type: Date, default: Date.now, immutable: true },
      updatedAt: { type: Date, default: Date.now },
    },
    { collection: "maintenance_tickets" },
  );

  maintenanceTicketSchema.index({ tenantId: 1, branchId: 1, status: 1, priority: 1 });
  maintenanceTicketSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
  maintenanceTicketSchema.index({ tenantId: 1, assetId: 1, createdAt: -1 });

  const brandingSchema = new Schema({}, { strict: false, collection: "tenant_branding_configs" });
  const analyticsSchema = new Schema({}, { strict: false, collection: "analytics_snapshots" });

  const MaintenanceTicket =
    mongoose.models.SeedMaintenanceTicket ??
    mongoose.model("SeedMaintenanceTicket", maintenanceTicketSchema);
  const TenantBrandingConfig =
    mongoose.models.SeedTenantBrandingConfig ??
    mongoose.model("SeedTenantBrandingConfig", brandingSchema);
  const AnalyticsSnapshot =
    mongoose.models.SeedAnalyticsSnapshot ??
    mongoose.model("SeedAnalyticsSnapshot", analyticsSchema);

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

  try {
    await TenantBrandingConfig.updateOne(
      { tenantId },
      {
        $set: {
          tenantId,
          version: 1,
          theme: {
            sidebarBg: "#023047",
            topbarBg: "#023047",
            accent: "#fb8500",
          },
          modules: Object.fromEntries(config.modules.map((moduleKey) => [moduleKey, true])),
          updatedBy: userId,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    await AnalyticsSnapshot.updateOne(
      { tenantId, "scope.type": "TENANT", "period.granularity": "MONTH", "period.date": "2026-05" },
      {
        $set: {
          tenantId,
          scope: { type: "TENANT" },
          period: { granularity: "MONTH", date: "2026-05" },
          metrics: { retentionRate: 92, churnRate: 8, revenue: 58400 },
          generatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    await MaintenanceTicket.updateOne(
      { tenantId, branchId, assetId: "TREADMILL-01", status: { $ne: "RESOLVED" } },
      {
        $set: {
          tenantId,
          branchId,
          assetId: "TREADMILL-01",
          assetName: "Caminadora 01",
          title: "Ruido en banda principal",
          description: "Ticket demo para validar el modulo de mantenimiento.",
          status: "OPEN",
          priority: "HIGH",
          reportedByUserId: userId,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  } finally {
    await mongoose.disconnect();
  }
}

export async function runSeed() {
  loadLocalEnv();
  assertCanRunDevSeed(process.env);

  const config = buildSeedConfig(process.env);
  const prisma = createPrisma();

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const { tenant, branch } = await upsertTenantCore(tx, config);
        const user = await upsertSuperAdmin(tx, config, tenant.id, branch.id);
        const products = await seedCatalog(tx, tenant.id, branch.id);
        await seedOperations(tx, tenant.id, branch.id, products);
        await seedFinanceAndPeople(tx, tenant.id, branch.id);
        return { tenant, branch, user };
      },
      { timeout: 30_000 },
    );

    await seedMongo(config, result.tenant.id, result.branch.id, result.user.id);

    return {
      email: config.superadmin.email,
      password: config.superadmin.password,
      tenant: result.tenant.name,
      branch: result.branch.name,
      modules: config.modules.length,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function runCli() {
  const result = await runSeed();
  console.log("Development seed complete.");
  console.log(`Tenant: ${result.tenant}`);
  console.log(`Branch: ${result.branch}`);
  console.log(`Modules enabled: ${result.modules}`);
  console.log(`Login email: ${result.email}`);
  console.log(`Login password: ${result.password}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
