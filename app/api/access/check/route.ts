import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { fail, ok } from "@/lib/api/response";
import { requireBranchAccess } from "@/lib/auth/rbac";

const AccessCheckSchema = z.object({
  memberId: z.string().min(1),
  deviceCode: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "access",
      permission: "access.write",
    });
    const body = await request.json();
    const data = AccessCheckSchema.parse(body);

    // 1. Verify the access device
    const device = await prisma.accessDevice.findFirst({
      where: {
        tenantId: context.tenantId,
        code: data.deviceCode,
      },
    });

    if (!device) {
      return ok({
        allowed: false,
        reason: "DEVICE_NOT_FOUND",
        message: "El dispositivo de acceso no está registrado.",
      });
    }

    if (device.status !== "ONLINE") {
      return ok({
        allowed: false,
        reason: "DEVICE_OFFLINE",
        message: "El dispositivo se encuentra fuera de línea.",
      });
    }
    requireBranchAccess(context, device.branchId);

    // 2. Verify the member
    const member = await prisma.member.findFirst({
      where: {
        tenantId: context.tenantId,
        id: data.memberId,
        branchId: device.branchId,
      },
    });

    if (!member) {
      return ok({
        allowed: false,
        reason: "MEMBER_NOT_FOUND",
        message: "El miembro no se encuentra registrado.",
      });
    }

    if (member.status !== "ACTIVE") {
      return ok({
        allowed: false,
        reason: "MEMBER_INACTIVE",
        message: "La cuenta del miembro se encuentra inactiva.",
      });
    }

    // 3. Verify member has an active, valid subscription
    const now = new Date();
    const activeSub = await prisma.subscription.findFirst({
      where: {
        tenantId: context.tenantId,
        memberId: member.id,
        status: "ACTIVE",
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      include: {
        plan: true,
      },
    });

    const memberName = `${member.firstName} ${member.lastName}`;

    if (!activeSub) {
      // Create outbox event log for access denied
      await prisma.outboxEvent.create({
        data: {
          tenantId: context.tenantId,
          type: "member.access.denied",
          aggregateType: "member",
          aggregateId: member.id,
          payload: {
            memberId: member.id,
            memberName,
            deviceCode: device.code,
            deviceName: device.name,
            allowed: false,
            reason: "NO_ACTIVE_SUBSCRIPTION",
            timestamp: now.toISOString(),
          },
          status: "PENDING",
        },
      });

      return ok({
        allowed: false,
        reason: "NO_ACTIVE_SUBSCRIPTION",
        message: "Acceso denegado. Sin membresía activa ni corriente de pago.",
      });
    }

    // Access Allowed
    await prisma.outboxEvent.create({
      data: {
        tenantId: context.tenantId,
        type: "member.access.allowed",
        aggregateType: "member",
        aggregateId: member.id,
        payload: {
          memberId: member.id,
          memberName,
          deviceCode: device.code,
          deviceName: device.name,
          planName: activeSub.plan.name,
          allowed: true,
          timestamp: now.toISOString(),
        },
        status: "PENDING",
      },
    });

    return ok({
      allowed: true,
      memberName,
      planName: activeSub.plan.name,
      message: "Acceso autorizado.",
    });
  } catch (error) {
    return fail(error);
  }
}
