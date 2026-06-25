import { SpecialistSessionStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { created, fail } from "@/lib/api/response";

const CreateSessionSchema = z.object({
  specialistId: z.string().min(1),
  serviceId: z.string().min(1),
  memberId: z.string().min(1),
  branchId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  price: z.coerce.number().nonnegative(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]).default("SCHEDULED"),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const data = CreateSessionSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    // 1. Verify specialist exists in the tenant
    const specialist = await prisma.specialist.findFirst({
      where: { id: data.specialistId, tenantId: context.tenantId },
    });
    if (!specialist) {
      return Response.json(
        { ok: false, error: "SPECIALIST_NOT_FOUND", message: "Especialista no encontrado." },
        { status: 404 }
      );
    }

    // 2. Verify service exists and belongs to the specialist
    const service = await prisma.specialistService.findFirst({
      where: { id: data.serviceId, specialistId: data.specialistId, tenantId: context.tenantId },
    });
    if (!service) {
      return Response.json(
        { ok: false, error: "SERVICE_NOT_FOUND", message: "Servicio no encontrado para este especialista." },
        { status: 404 }
      );
    }

    // 3. Verify member exists in the tenant
    const member = await prisma.member.findFirst({
      where: { id: data.memberId, tenantId: context.tenantId },
    });
    if (!member) {
      return Response.json(
        { ok: false, error: "MEMBER_NOT_FOUND", message: "Miembro no encontrado." },
        { status: 404 }
      );
    }

    // 4. Construct scheduledAt Date
    const scheduledAt = new Date(`${data.date}T${data.time}:00`);
    if (isNaN(scheduledAt.getTime())) {
      return Response.json(
        { ok: false, error: "INVALID_DATETIME", message: "La fecha u hora combinadas son inválidas." },
        { status: 400 }
      );
    }

    // 5. Create the session
    const session = await prisma.specialistSession.create({
      data: {
        tenantId: context.tenantId,
        specialistId: data.specialistId,
        memberId: data.memberId,
        serviceId: data.serviceId,
        branchId,
        status: data.status as SpecialistSessionStatus,
        scheduledAt,
        completedAt: data.status === "COMPLETED" ? new Date() : null,
        price: new Prisma.Decimal(data.price),
      },
      include: {
        specialist: true,
        service: true,
        member: true,
        branch: true,
      },
    });

    return created(session);
  } catch (error) {
    return fail(error);
  }
}
