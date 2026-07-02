import { AccessDeviceStatus, AccessDeviceType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateDeviceSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(80),
  type: z.enum(AccessDeviceType),
  status: z.enum(AccessDeviceStatus).default(AccessDeviceStatus.ONLINE),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "access", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = scopedBranchWhere(context, searchParams.get("branchId"));

    const [items, total] = await Promise.all([
      prisma.accessDevice.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.accessDevice.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "access", method: "POST" });
    const data = CreateDeviceSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const device = await prisma.accessDevice.create({
      data: {
        tenantId: context.tenantId,
        branchId,
        name: data.name,
        code: data.code,
        type: data.type,
        status: data.status,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return created(device);
  } catch (error) {
    return fail(error);
  }
}
