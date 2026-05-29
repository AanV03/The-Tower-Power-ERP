import { InvoiceStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const PurchaseItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().trim().min(1).max(240),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

const CreatePurchaseInvoiceSchema = z.object({
  branchId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.enum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  currency: z.string().trim().length(3).default("MXN"),
  dueDate: z.string().datetime().optional(),
  issuedAt: z.string().datetime().optional(),
  items: z.array(PurchaseItemSchema).min(1),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "purchases" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      type: "PAYABLE" as const,
      ...(searchParams.get("status") ? { status: searchParams.get("status") as InvoiceStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { items: true, supplier: true, payments: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.invoice.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "purchases" });
    const data = CreatePurchaseInvoiceSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);
    const normalizedItems = data.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      const tax = subtotal * (item.taxRate / 100);
      return { ...item, total: subtotal + tax };
    });
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const total = normalizedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = total - subtotal;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: context.tenantId,
        branchId,
        supplierId: data.supplierId,
        type: "PAYABLE",
        status: data.status,
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
        currency: data.currency.toUpperCase(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
        items: {
          create: normalizedItems.map((item) => ({
            tenantId: context.tenantId,
            productId: item.productId,
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            taxRate: new Prisma.Decimal(item.taxRate),
            total: new Prisma.Decimal(item.total),
          })),
        },
      },
      include: { items: true },
    });

    return created(invoice);
  } catch (error) {
    return fail(error);
  }
}
