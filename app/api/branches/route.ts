import { BranchStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { created, fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";

const CreateBranchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(32),
  timezone: z.string().trim().min(1).default("America/Mexico_City"),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
  address: z.record(z.string(), z.unknown()).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "admin" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);

    const [items, total] = await Promise.all([
      prisma.branch.findMany({
        where: { tenantId: context.tenantId },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.branch.count({ where: { tenantId: context.tenantId } }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "admin" });
    const data = CreateBranchSchema.parse(await request.json());

    const branch = await prisma.branch.create({
      data: {
        tenantId: context.tenantId,
        name: data.name,
        code: data.code.toUpperCase(),
        timezone: data.timezone,
        status: data.status,
        address: data.address as Prisma.InputJsonValue | undefined,
      },
    });

    return created(branch);
  } catch (error) {
    return fail(error);
  }
}
