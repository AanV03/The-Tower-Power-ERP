import { BranchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  parentId: z.string().optional(),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "catalog", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = { tenantId: context.tenantId };

    const [items, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        include: { parent: true, children: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.productCategory.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "catalog", method: "POST" });
    const data = CreateCategorySchema.parse(await request.json());

    const category = await prisma.productCategory.create({
      data: {
        tenantId: context.tenantId,
        name: data.name,
        parentId: data.parentId,
        status: data.status,
      },
    });

    return created(category);
  } catch (error) {
    return fail(error);
  }
}
