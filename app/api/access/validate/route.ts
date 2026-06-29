import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { fail } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const AccessValidateSchema = z
  .object({
    memberId: z.string().trim().min(1).optional(),
    accessCode: z.string().trim().min(1).optional(),
    deviceCode: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.memberId || data.accessCode, {
    message: "Debe enviar memberId o accessCode.",
    path: ["accessCode"],
  });

export const runtime = "nodejs";

function denied(message = "Acceso Denegado", status = 403) {
  return NextResponse.json({ status: "DENIED", message }, { status });
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "access" });
    const data = AccessValidateSchema.parse(await request.json());
    const now = new Date();
    const identifier = data.memberId ?? data.accessCode ?? "UNKNOWN";

    const member = await prisma.member.findFirst({
      where: {
        tenantId: context.tenantId,
        OR: [
          ...(data.memberId ? [{ id: data.memberId }] : []),
          ...(data.accessCode
            ? [
                { id: data.accessCode },
                { email: data.accessCode.toLowerCase() },
                { phone: data.accessCode },
              ]
            : []),
        ],
      },
    });

    if (!member) {
      await prisma.outboxEvent.create({
        data: {
          tenantId: context.tenantId,
          type: "member.access.denied",
          aggregateType: "access",
          aggregateId: identifier,
          payload: {
            identifier,
            deviceCode: data.deviceCode,
            reason: "MEMBER_NOT_FOUND",
            timestamp: now.toISOString(),
          },
          status: "PENDING",
        },
      });

      return denied("Acceso Denegado: miembro no encontrado.", 400);
    }

    const memberName = `${member.firstName} ${member.lastName}`;

    if (member.status !== "ACTIVE") {
      await prisma.outboxEvent.create({
        data: {
          tenantId: context.tenantId,
          type: "member.access.denied",
          aggregateType: "member",
          aggregateId: member.id,
          payload: {
            memberId: member.id,
            memberName,
            deviceCode: data.deviceCode,
            reason: "MEMBER_INACTIVE",
            timestamp: now.toISOString(),
          },
          status: "PENDING",
        },
      });

      return denied("Acceso Denegado: miembro inactivo.");
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId: context.tenantId,
        memberId: member.id,
        status: "ACTIVE",
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!activeSubscription) {
      await prisma.outboxEvent.create({
        data: {
          tenantId: context.tenantId,
          type: "member.access.denied",
          aggregateType: "member",
          aggregateId: member.id,
          payload: {
            memberId: member.id,
            memberName,
            deviceCode: data.deviceCode,
            reason: "NO_ACTIVE_SUBSCRIPTION",
            timestamp: now.toISOString(),
          },
          status: "PENDING",
        },
      });

      return denied("Acceso Denegado: membresia no vigente.");
    }

    await prisma.outboxEvent.create({
      data: {
        tenantId: context.tenantId,
        type: "member.access.granted",
        aggregateType: "member",
        aggregateId: member.id,
        payload: {
          memberId: member.id,
          memberName,
          subscriptionId: activeSubscription.id,
          planName: activeSubscription.plan.name,
          deviceCode: data.deviceCode,
          timestamp: now.toISOString(),
        },
        status: "PENDING",
      },
    });

    return NextResponse.json({
      status: "GRANTED",
      message: "Acceso Permitido",
      member: {
        id: member.id,
        name: memberName,
        email: member.email,
      },
      planName: activeSubscription.plan.name,
    });
  } catch (error) {
    return fail(error);
  }
}
