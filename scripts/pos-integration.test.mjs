import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, resolve as resolvePath } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";

function loadDotEnv(filePath = ".env") {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function resolveLocalSpecifier(specifier, parentURL) {
  if (!parentURL?.startsWith("file:")) return null;

  const target = resolvePath(dirname(fileURLToPath(parentURL)), specifier);
  const candidates = [
    `${target}.ts`,
    `${target}.tsx`,
    `${target}.js`,
    resolvePath(target, "index.ts"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  return null;
}

function resolveAliasSpecifier(specifier) {
  const target = resolvePath(process.cwd(), specifier.slice(2));
  const candidates = [
    `${target}.ts`,
    `${target}.tsx`,
    `${target}.js`,
    resolvePath(target, "index.ts"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  return null;
}

loadDotEnv();

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }

    if (specifier.startsWith("@/")) {
      const url = resolveAliasSpecifier(specifier);
      if (url) return { url, shortCircuit: true };
    }

    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const url = resolveLocalSpecifier(specifier, context.parentURL);
      if (url) return { url, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});

test(
  "POS checkout creates a paid sale and decrements inventory atomically",
  { skip: process.env.DATABASE_URL ? false : "DATABASE_URL is required for POS integration tests." },
  async () => {
    const [{ PosService }, { prisma }] = await Promise.all([
      import("../modules/pos/services/pos.service.ts"),
      import("../lib/db/prisma.ts"),
    ]);

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    let tenantId = null;

    try {
      const tenant = await prisma.tenant.create({
        data: {
          name: `POS Integration ${suffix}`,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      tenantId = tenant.id;

      const branch = await prisma.branch.create({
        data: {
          tenantId,
          name: "Sucursal POS Test",
          code: `POS-${suffix}`,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      const cashier = await prisma.user.create({
        data: {
          tenantId,
          branchId: branch.id,
          name: "POS Test Cashier",
          email: `pos-${suffix}@gerpy.test`,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      const warehouse = await prisma.warehouse.create({
        data: {
          tenantId,
          branchId: branch.id,
          name: "Almacen Principal POS Test",
        },
        select: { id: true },
      });

      const product = await prisma.product.create({
        data: {
          tenantId,
          sku: `SKU-${suffix}`,
          name: "Producto POS Test",
          price: "100.00",
          cost: "60.00",
          taxRate: "16.00",
          status: "ACTIVE",
        },
        select: { id: true },
      });

      await prisma.inventoryItem.create({
        data: {
          tenantId,
          warehouseId: warehouse.id,
          productId: product.id,
          quantityOnHand: "10.00",
          quantityReserved: "0.00",
          reorderPoint: "1.00",
        },
      });

      const register = await prisma.posRegister.create({
        data: {
          tenantId,
          branchId: branch.id,
          name: "Caja POS Test",
          status: "ACTIVE",
        },
        select: { id: true },
      });

      const cashSession = await prisma.cashSession.create({
        data: {
          tenantId,
          registerId: register.id,
          openedByUserId: cashier.id,
          openingAmount: "500.00",
          status: "OPEN",
        },
        select: { id: true },
      });

      const sale = await PosService.executeSale(tenantId, branch.id, cashier.id, {
        cashSessionId: cashSession.id,
        paymentMethod: "CASH",
        items: [
          {
            productId: product.id,
            quantity: 3,
            unitPrice: 100,
          },
        ],
      });

      assert.ok(sale.id, "executeSale should return the created sale id");

      const persistedSale = await prisma.sale.findFirst({
        where: {
          id: sale.id,
          tenantId,
        },
        include: {
          items: true,
          payments: true,
        },
      });

      assert.ok(persistedSale, "sale should be persisted");
      assert.equal(persistedSale.status, "PAID");
      assert.equal(persistedSale.items.length, 1);
      assert.equal(persistedSale.items[0].quantity.toNumber(), 3);
      assert.equal(persistedSale.payments.length, 1);
      assert.equal(persistedSale.payments[0].amount.toNumber(), 348);

      const updatedInventory = await prisma.inventoryItem.findUnique({
        where: {
          tenantId_warehouseId_productId: {
            tenantId,
            warehouseId: warehouse.id,
            productId: product.id,
          },
        },
      });

      assert.ok(updatedInventory, "inventory item should still exist");
      assert.equal(updatedInventory.quantityOnHand.toNumber(), 7);
    } finally {
      if (tenantId) {
        await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => undefined);
      }

      await prisma.$disconnect();
    }
  },
);
