import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateWarehouseSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().trim().min(2).max(120),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "inventory", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = scopedBranchWhere(context, searchParams.get("branchId"));

    const [items, total] = await Promise.all([
      prisma.warehouse.findMany({ where, include: { branch: true }, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.warehouse.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "inventory", method: "POST" });
    const data = CreateWarehouseSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const warehouse = await prisma.warehouse.create({
      data: { tenantId: context.tenantId, branchId, name: data.name },
    });

    return created(warehouse);
  } catch (error) {
    return fail(error);
  }
}
