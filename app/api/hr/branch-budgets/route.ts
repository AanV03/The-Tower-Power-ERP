import { Prisma } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const BranchBudgetSchema = z.object({
  branchId: z.string().optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  payrollBudget: z.coerce.number().nonnegative(),
  specialistBudget: z.coerce.number().nonnegative().default(0),
  operationsBudget: z.coerce.number().nonnegative().default(0),
  notes: z.string().trim().max(240).optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = scopedBranchWhere(context, searchParams.get("branchId"));

    const [items, total] = await Promise.all([
      prisma.branchBudget.findMany({
        where,
        include: { branch: true },
        orderBy: { periodStart: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.branchBudget.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", method: "POST" });
    const data = BranchBudgetSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    const budget = await prisma.branchBudget.upsert({
      where: {
        tenantId_branchId_periodStart_periodEnd: {
          tenantId: context.tenantId,
          branchId,
          periodStart,
          periodEnd,
        },
      },
      create: {
        tenantId: context.tenantId,
        branchId,
        periodStart,
        periodEnd,
        payrollBudget: new Prisma.Decimal(data.payrollBudget),
        specialistBudget: new Prisma.Decimal(data.specialistBudget),
        operationsBudget: new Prisma.Decimal(data.operationsBudget),
        notes: data.notes,
      },
      update: {
        payrollBudget: new Prisma.Decimal(data.payrollBudget),
        specialistBudget: new Prisma.Decimal(data.specialistBudget),
        operationsBudget: new Prisma.Decimal(data.operationsBudget),
        notes: data.notes,
      },
      include: { branch: true },
    });

    return created(budget);
  } catch (error) {
    return fail(error);
  }
}
