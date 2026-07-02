import { BillingPeriod, BranchStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { created, fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";

const CreatePlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  billingPeriod: z.enum(BillingPeriod),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().length(3).default("MXN"),
  accessRules: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "memberships", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);

    const [items, total] = await Promise.all([
      prisma.membershipPlan.findMany({
        where: { tenantId: context.tenantId },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.membershipPlan.count({ where: { tenantId: context.tenantId } }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "memberships", method: "POST" });
    const data = CreatePlanSchema.parse(await request.json());

    const plan = await prisma.membershipPlan.create({
      data: {
        tenantId: context.tenantId,
        name: data.name,
        billingPeriod: data.billingPeriod,
        price: new Prisma.Decimal(data.price),
        currency: data.currency.toUpperCase(),
        accessRules: data.accessRules as Prisma.InputJsonValue | undefined,
        status: data.status,
      },
    });

    return created(plan);
  } catch (error) {
    return fail(error);
  }
}
