import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { assertTenantReferenceIds } from "@/lib/api/tenant-reference";

const CreatePaymentSchema = z.object({
  branchId: z.string().optional(),
  invoiceId: z.string().optional(),
  memberId: z.string().optional(),
  subscriptionId: z.string().optional(),
  saleId: z.string().optional(),
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).default("MXN"),
  method: z.enum(PaymentMethod),
  status: z.enum(PaymentStatus).default(PaymentStatus.SUCCEEDED),
  provider: z.string().trim().max(80).optional(),
  externalReference: z.string().trim().max(180).optional(),
  paidAt: z.string().datetime().optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "finance",
      permission: "finance.read",
    });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as PaymentStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { invoice: true, member: true, sale: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.payment.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({
      moduleId: "finance",
      permission: "finance.write",
    });
    const data = CreatePaymentSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const payment = await prisma.$transaction(async (tx) => {
      await Promise.all([
        assertTenantReferenceIds("Invoice", [data.invoiceId], (ids) =>
          tx.invoice.findMany({
            where: { tenantId: context.tenantId, branchId, id: { in: ids } },
            select: { id: true },
          }),
        ),
        assertTenantReferenceIds("Member", [data.memberId], (ids) =>
          tx.member.findMany({
            where: { tenantId: context.tenantId, branchId, id: { in: ids } },
            select: { id: true },
          }),
        ),
        assertTenantReferenceIds("Subscription", [data.subscriptionId], (ids) =>
          tx.subscription.findMany({
            where: {
              tenantId: context.tenantId,
              id: { in: ids },
              member: { branchId },
            },
            select: { id: true },
          }),
        ),
        assertTenantReferenceIds("Sale", [data.saleId], (ids) =>
          tx.sale.findMany({
            where: { tenantId: context.tenantId, branchId, id: { in: ids } },
            select: { id: true },
          }),
        ),
      ]);

      return tx.payment.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          invoiceId: data.invoiceId,
          memberId: data.memberId,
          subscriptionId: data.subscriptionId,
          saleId: data.saleId,
          amount: new Prisma.Decimal(data.amount),
          currency: data.currency.toUpperCase(),
          method: data.method,
          status: data.status,
          provider: data.provider,
          externalReference: data.externalReference,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        },
      });
    });

    return created(payment);
  } catch (error) {
    return fail(error);
  }
}
