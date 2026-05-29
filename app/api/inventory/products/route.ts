import { BranchStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateProductSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(160),
  categoryId: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "inventory" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("status") ? { status: searchParams.get("status") as BranchStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, inventoryItems: { include: { warehouse: true } } },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.product.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "inventory" });
    const data = CreateProductSchema.parse(await request.json());

    const product = await prisma.product.create({
      data: {
        tenantId: context.tenantId,
        sku: data.sku,
        name: data.name,
        categoryId: data.categoryId,
        price: new Prisma.Decimal(data.price),
        cost: new Prisma.Decimal(data.cost),
        taxRate: new Prisma.Decimal(data.taxRate),
        status: data.status,
      },
    });

    return created(product);
  } catch (error) {
    return fail(error);
  }
}
