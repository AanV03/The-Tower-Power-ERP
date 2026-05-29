import { Prisma, SaleStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const SaleItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

const CreateSaleSchema = z.object({
  branchId: z.string().optional(),
  cashSessionId: z.string(),
  memberId: z.string().optional(),
  status: z.enum(SaleStatus).default(SaleStatus.PAID),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  paidAt: z.string().datetime().optional(),
  items: z.array(SaleItemSchema).min(1),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as SaleStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { items: { include: { product: true } }, payments: true, member: true, cashSession: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.sale.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });
    const data = CreateSaleSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (data.taxRate / 100);
    const total = subtotal + tax;

    const sale = await prisma.sale.create({
      data: {
        tenantId: context.tenantId,
        branchId,
        cashSessionId: data.cashSessionId,
        memberId: data.memberId,
        status: data.status,
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        items: {
          create: data.items.map((item) => ({
            tenantId: context.tenantId,
            productId: item.productId,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.quantity * item.unitPrice),
          })),
        },
      },
      include: { items: true },
    });

    return created(sale);
  } catch (error) {
    return fail(error);
  }
}
