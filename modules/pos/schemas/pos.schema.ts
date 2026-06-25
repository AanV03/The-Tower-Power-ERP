import { z } from 'zod';

export const createSaleSchema = z.object({
  cashSessionId: z.string().min(1, { message: "ID de sesión de caja inválido" }),
  memberId: z.string().min(1).optional(), // Puede ser un cliente casual sin membresia
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']),
  items: z.array(
    z.object({
      productId: z.string().min(1, { message: "ID de producto inválido" }),
      quantity: z.number().int().positive("La cantidad debe ser mayor a cero"),
      unitPrice: z.number().positive("El precio debe ser mayor a cero"),
    })
  ).min(1, "La venta debe tener al menos un producto"),
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;