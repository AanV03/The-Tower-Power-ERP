import { InventoryMovementType, Prisma } from "@prisma/client";

import { ApiError } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import type { CreateSaleDTO } from "../schemas/pos.schema";

type NormalizedSaleItem = {
  productId: string;
  quantity: Prisma.Decimal;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  total: Prisma.Decimal;
};

function toMoney(amount: Prisma.Decimal) {
  return amount.toDecimalPlaces(2);
}

function normalizeItems(items: CreateSaleDTO["items"]) {
  const quantities = new Map<string, number>();

  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
}

export class PosService {
  static async executeSale(
    tenantId: string,
    _branchId: string | null,
    cashierId: string,
    payload: CreateSaleDTO,
  ) {
    const normalizedItems = normalizeItems(payload.items);

    return prisma.$transaction(async (tx) => {
      const cashSession = await tx.cashSession.findFirst({
        where: {
          id: payload.cashSessionId,
          tenantId,
          openedByUserId: cashierId,
          status: "OPEN",
        },
        include: {
          register: {
            select: { branchId: true },
          },
        },
      });

      if (!cashSession) {
        throw new ApiError(
          "La sesion de caja no esta abierta o no pertenece al usuario actual.",
          404,
          "CASH_SESSION_NOT_FOUND",
        );
      }

      if (payload.memberId) {
        const member = await tx.member.findFirst({
          where: {
            id: payload.memberId,
            tenantId,
          },
          select: { id: true },
        });

        if (!member) {
          throw new ApiError("El miembro seleccionado no pertenece a este tenant.", 400, "MEMBER_NOT_FOUND");
        }
      }

      const saleBranchId = cashSession.register.branchId;
      const warehouse = await tx.warehouse.findFirst({
        where: {
          tenantId,
          branchId: saleBranchId,
        },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      if (!warehouse) {
        throw new ApiError("No hay un almacen asociado a la sucursal de la caja.", 400, "WAREHOUSE_NOT_FOUND");
      }

      const productIds = normalizedItems.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          tenantId,
          id: { in: productIds },
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          price: true,
          taxRate: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new ApiError("Uno o mas productos no existen o estan inactivos.", 400, "PRODUCT_NOT_FOUND");
      }

      const productById = new Map(products.map((product) => [product.id, product]));
      const saleItems: NormalizedSaleItem[] = normalizedItems.map((item) => {
        const product = productById.get(item.productId);

        if (!product) {
          throw new ApiError("Uno o mas productos no existen o estan inactivos.", 400, "PRODUCT_NOT_FOUND");
        }

        const quantity = new Prisma.Decimal(item.quantity);
        const total = toMoney(product.price.mul(quantity));

        return {
          productId: product.id,
          quantity,
          unitPrice: product.price,
          taxRate: product.taxRate,
          total,
        };
      });

      const subtotal = toMoney(saleItems.reduce((acc, item) => acc.plus(item.total), new Prisma.Decimal(0)));
      const tax = toMoney(
        saleItems.reduce(
          (acc, item) => acc.plus(item.total.mul(item.taxRate).div(100)),
          new Prisma.Decimal(0),
        ),
      );
      const total = toMoney(subtotal.plus(tax));
      const now = new Date();

      const sale = await tx.sale.create({
        data: {
          tenantId,
          branchId: saleBranchId,
          cashSessionId: payload.cashSessionId,
          memberId: payload.memberId,
          status: "PAID",
          subtotal,
          tax,
          total,
          paidAt: now,
          items: {
            create: saleItems.map((item) => ({
              tenantId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
        },
      });

      for (const item of saleItems) {
        const inventoryUpdate = await tx.inventoryItem.updateMany({
          where: {
            tenantId,
            warehouseId: warehouse.id,
            productId: item.productId,
            quantityOnHand: { gte: item.quantity },
          },
          data: {
            quantityOnHand: { decrement: item.quantity },
          },
        });

        if (inventoryUpdate.count === 0) {
          const productName = productById.get(item.productId)?.name ?? "producto";
          throw new ApiError(`Stock insuficiente para ${productName}.`, 409, "INSUFFICIENT_STOCK");
        }

        await tx.inventoryMovement.create({
          data: {
            tenantId,
            warehouseId: warehouse.id,
            productId: item.productId,
            type: InventoryMovementType.SALE,
            quantity: item.quantity,
            unitCost: item.unitPrice,
            sourceType: "sale",
            sourceId: sale.id,
          },
        });
      }

      await tx.payment.create({
        data: {
          tenantId,
          branchId: saleBranchId,
          saleId: sale.id,
          memberId: payload.memberId,
          amount: total,
          currency: "MXN",
          method: payload.paymentMethod,
          status: "SUCCEEDED",
          paidAt: now,
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          type: "pos.sale.completed",
          aggregateType: "sale",
          aggregateId: sale.id,
          payload: {
            saleId: sale.id,
            total: total.toNumber(),
            method: payload.paymentMethod,
            cashierId,
          },
          status: "PENDING",
        },
      });

      return {
        ...sale,
        subtotal: subtotal.toNumber(),
        tax: tax.toNumber(),
        total: total.toNumber(),
        items: sale.items.map((item) => ({
          ...item,
          quantity: item.quantity.toNumber(),
          unitPrice: item.unitPrice.toNumber(),
          total: item.total.toNumber(),
        })),
      };
    });
  }
}
