import { RegisterStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateRegisterSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  status: z.enum(RegisterStatus).default(RegisterStatus.ACTIVE),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = scopedBranchWhere(context, searchParams.get("branchId"));

    const [items, total] = await Promise.all([
      prisma.posRegister.findMany({ where, include: { branch: true, cashSessions: true }, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.take }),
      prisma.posRegister.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });
    const data = CreateRegisterSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const register = await prisma.posRegister.create({
      data: { tenantId: context.tenantId, branchId, name: data.name, status: data.status },
    });

    return created(register);
  } catch (error) {
    return fail(error);
  }
}
