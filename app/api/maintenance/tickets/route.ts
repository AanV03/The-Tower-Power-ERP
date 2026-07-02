import { z } from "zod";
import { assertMaintenanceBranchBelongsToTenant } from "@/lib/api/maintenance";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { connectMongo } from "@/lib/db/mongodb";
import { MaintenanceTicket } from "@/lib/db/mongo-models";
import { requireBranchAccess } from "@/lib/auth/rbac";

const CreateMaintenanceTicketSchema = z.object({
  branchId: z.string(),
  assetId: z.string().trim().max(120).optional(),
  assetName: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  assignedToUserId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "maintenance", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const branchId = searchParams.get("branchId") ?? context.branchId ?? undefined;
    if (branchId) requireBranchAccess(context, branchId);

    await connectMongo();
    const filter = {
      tenantId: context.tenantId,
      ...(branchId ? { branchId } : {}),
      ...(searchParams.get("status") ? { status: searchParams.get("status") } : {}),
      ...(searchParams.get("priority") ? { priority: searchParams.get("priority") } : {}),
    };

    const [items, total] = await Promise.all([
      MaintenanceTicket.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.take).lean(),
      MaintenanceTicket.countDocuments(filter),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "maintenance", method: "POST" });
    const data = CreateMaintenanceTicketSchema.parse(await request.json());
    requireBranchAccess(context, data.branchId);
    await assertMaintenanceBranchBelongsToTenant(prisma, context.tenantId, data.branchId);
    await connectMongo();

    const ticket = await MaintenanceTicket.create({
      tenantId: context.tenantId,
      branchId: data.branchId,
      assetId: data.assetId,
      assetName: data.assetName,
      title: data.title,
      description: data.description,
      priority: data.priority,
      reportedByUserId: context.userId,
      assignedToUserId: data.assignedToUserId,
      metadata: data.metadata,
      updatedAt: new Date(),
    });

    return created(ticket.toObject());
  } catch (error) {
    return fail(error);
  }
}
