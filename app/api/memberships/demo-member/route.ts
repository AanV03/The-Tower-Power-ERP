import { BillingPeriod, BranchStatus, MemberStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { created, fail } from "@/lib/api/response";
import { normalizeEmail } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const DemoMemberSchema = z.object({
  branchId: z.string().trim().min(1).optional(),
  firstName: z.string().trim().min(1).max(80).default("Demo"),
  lastName: z.string().trim().min(1).max(80).default("Access"),
  email: z.string().email().transform(normalizeEmail).optional(),
  phone: z.string().trim().max(40).optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "memberships", method: "POST" });
    const body = await request.json().catch(() => ({}));
    const data = DemoMemberSchema.parse(body);
    const branchId = await resolveWritableBranchId(context, data.branchId);
    const now = new Date();
    const endDate = new Date(now.getTime());
    endDate.setMonth(endDate.getMonth() + 1);
    const stamp = Date.now().toString(36).toUpperCase();
    const email = data.email ?? `demo.${stamp.toLowerCase()}@gerpy.local`;

    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.membershipPlan.upsert({
        where: {
          tenantId_name: {
            tenantId: context.tenantId,
            name: "Demo Acceso Total",
          },
        },
        create: {
          tenantId: context.tenantId,
          name: "Demo Acceso Total",
          billingPeriod: BillingPeriod.MONTHLY,
          price: new Prisma.Decimal(0),
          currency: "MXN",
          status: BranchStatus.ACTIVE,
        },
        update: {
          status: BranchStatus.ACTIVE,
        },
      });

      const member = await tx.member.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          firstName: data.firstName,
          lastName: data.lastName,
          email,
          phone: data.phone,
          status: MemberStatus.ACTIVE,
        },
        include: {
          branch: true,
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          tenantId: context.tenantId,
          memberId: member.id,
          planId: plan.id,
          status: "ACTIVE",
          externalReference: `demo_${stamp}_${Math.random().toString(36).slice(2, 8)}`,
          startDate: now,
          endDate,
          nextBillingDate: endDate,
          autoRenew: true,
        },
        include: {
          member: true,
          plan: true,
        },
      });

      return { member, plan, subscription };
    });

    return created(result);
  } catch (error) {
    return fail(error);
  }
}
