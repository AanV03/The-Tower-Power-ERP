import { prisma } from '@/lib/db/prisma';
import { CreateSaleDTO } from '../schemas/pos.schema';

export class PosService {
  static async executeSale(
    tenantId: string,
    branchId: string,
    cashierId: string,
    payload: CreateSaleDTO
  ) {
    const subtotal = payload.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.16; // IVA
    const total = subtotal + tax;

    return await prisma.$transaction(async (tx) => {
      
      const sale = await tx.sale.create({
        data: {
          tenantId,
          branchId,
          cashSessionId: payload.cashSessionId,
          memberId: payload.memberId,
          status: 'PAID', 
          subtotal,
          tax,
          total,
          paidAt: new Date(),
          items: {
            create: payload.items.map(item => ({
              tenantId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            }))
          }
        }
      });

      await tx.payment.create({
        data: {
          tenantId,
          branchId,
          amount: total,
          currency: 'MXN',
          method: payload.paymentMethod,
          status: 'SUCCEEDED',           
          paidAt: new Date(),
          memberId: payload.memberId,
        }
      });

      for (const item of payload.items) {
        const inventoryUpdate = await tx.inventoryItem.updateMany({
          where: {
            tenantId,
            warehouseId: branchId,
            productId: item.productId,
            quantityOnHand: { gte: item.quantity } 
          },
          data: {
            quantityOnHand: { decrement: item.quantity }
          }
        });

       
        if (inventoryUpdate.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK_${item.productId}`); 
        }

       
        await tx.inventoryMovement.create({
          data: {
            tenantId,
            warehouseId: branchId,
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            unitCost: item.unitPrice,
            sourceType: 'sale',
            sourceId: sale.id,
          }
        });
      }

      
      await tx.outboxEvent.create({
        data: {
          tenantId,
          type: 'pos.sale.completed',
          aggregateType: 'sale',
          aggregateId: sale.id,
          payload: { saleId: sale.id, total, method: payload.paymentMethod, cashierId },
          status: 'PENDING'
        }
      });

      return sale;
    });
  }
}