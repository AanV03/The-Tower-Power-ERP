import { BillingPeriod, SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { assertTenantReferenceIds } from "@/lib/api/tenant-reference";

const CreateSubscriptionSchema = z.object({
  memberId: z.string().min(1),
  planId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  autoRenew: z.boolean().default(true),
});

const UpdateSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
  action: z.enum(["pause", "cancel", "reactivate"]),
  reason: z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const runtime = "nodejs";

function calculateEndDate(startDate: Date, period: BillingPeriod): Date {
  const date = new Date(startDate.getTime());
  if (period === BillingPeriod.MONTHLY) {
    date.setMonth(date.getMonth() + 1);
  } else if (period === BillingPeriod.QUARTERLY) {
    date.setMonth(date.getMonth() + 3);
  } else if (period === BillingPeriod.ANNUAL) {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date;
}

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "memberships",
      permission: "memberships.read",
    });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const memberId = searchParams.get("memberId") || undefined;
    const status = searchParams.get("status") as SubscriptionStatus | null;

    const where = {
      tenantId: context.tenantId,
      ...(context.branchId
        ? { member: { branchId: context.branchId } }
        : {}),
      ...(memberId ? { memberId } : {}),
      ...(status ? { status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { member: true, plan: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.subscription.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "memberships",
      permission: "memberships.write",
    });
    const body = await request.json();
    const data = CreateSubscriptionSchema.parse(body);

    // Fetch the membership plan details
    const plan = await prisma.membershipPlan.findFirst({
      where: {
        id: data.planId,
        tenantId: context.tenantId,
      },
    });

    if (!plan) {
      return Response.json(
        { ok: false, error: "PLAN_NOT_FOUND", message: "Plan de membresía no encontrado." },
        { status: 404 }
      );
    }

    await assertTenantReferenceIds("Member", [data.memberId], (ids) =>
      prisma.member.findMany({
        where: {
          tenantId: context.tenantId,
          id: { in: ids },
          ...(context.branchId ? { branchId: context.branchId } : {}),
        },
        select: { id: true },
      }),
    );

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = calculateEndDate(startDate, plan.billingPeriod);
    const externalReference = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: context.tenantId,
        memberId: data.memberId,
        planId: data.planId,
        status: "ACTIVE",
        externalReference,
        startDate,
        endDate,
        nextBillingDate: endDate,
        autoRenew: data.autoRenew,
      },
      include: {
        member: true,
        plan: true,
      },
    });

    return created(subscription);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "memberships",
      permission: "memberships.write",
    });
    const body = await request.json();
    const data = UpdateSubscriptionSchema.parse(body);

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: data.subscriptionId,
        tenantId: context.tenantId,
        ...(context.branchId
          ? { member: { branchId: context.branchId } }
          : {}),
      },
    });

    if (!subscription) {
      return Response.json(
        { ok: false, error: "SUBSCRIPTION_NOT_FOUND", message: "Suscripción no encontrada." },
        { status: 404 }
      );
    }

    const updatedSubscription = await prisma.$transaction(async (tx) => {
      if (data.action === "pause") {
        const pauseStart = data.startDate ? new Date(data.startDate) : new Date();
        const pauseEnd = data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await tx.subscriptionPause.create({
          data: {
            tenantId: context.tenantId,
            subscriptionId: subscription.id,
            startDate: pauseStart,
            endDate: pauseEnd,
            reason: data.reason || "Pausa operativa",
            approvedByUserId: context.userId,
          },
        });

        return await tx.subscription.update({
          where: { id: subscription.id, tenantId: context.tenantId },
          data: { status: "PAUSED" },
          include: { member: true, plan: true },
        });
      }

      if (data.action === "cancel") {
        await tx.subscriptionCancellation.create({
          data: {
            tenantId: context.tenantId,
            subscriptionId: subscription.id,
            reason: data.reason || "Cancelación a petición del cliente",
            cancelledByUserId: context.userId,
            cancelledAt: new Date(),
          },
        });

        return await tx.subscription.update({
          where: { id: subscription.id, tenantId: context.tenantId },
          data: { status: "CANCELLED" },
          include: { member: true, plan: true },
        });
      }

      if (data.action === "reactivate") {
        return await tx.subscription.update({
          where: { id: subscription.id, tenantId: context.tenantId },
          data: { status: "ACTIVE" },
          include: { member: true, plan: true },
        });
      }

      throw new Error("Acción de suscripción inválida");
    });

    return ok(updatedSubscription);
  } catch (error) {
    return fail(error);
  }
}
