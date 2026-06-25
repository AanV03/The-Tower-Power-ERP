import { SettlementStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { created, fail, ok } from "@/lib/api/response";

const CalculateQuerySchema = z.object({
  specialistId: z.string().min(1),
  periodStart: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periodEnd: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

const CreateSettlementSchema = z.object({
  specialistId: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  status: z.enum(["DRAFT", "APPROVED", "PAID"]).default("DRAFT"),
  notes: z.string().optional(),
});

export const runtime = "nodejs";

// Helper function to calculate settlement figures on the server
async function computeSettlement(
  tenantId: string,
  specialistId: string,
  start: Date,
  end: Date
) {
  // 1. Fetch specialist and contract
  const specialist = await prisma.specialist.findFirst({
    where: { id: specialistId, tenantId },
    include: {
      contracts: {
        where: {
          status: "ACTIVE",
          startDate: { lte: end },
          OR: [
            { endDate: null },
            { endDate: { gte: start } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!specialist) {
    throw new Error("SPECIALIST_NOT_FOUND");
  }

  const contract = specialist.contracts[0];
  const model = contract?.model ?? "UNASSIGNED";

  // 2. Fetch completed sessions in the range that are NOT already in another settlement
  const sessions = await prisma.specialistSession.findMany({
    where: {
      tenantId,
      specialistId,
      status: "COMPLETED",
      scheduledAt: {
        gte: start,
        lte: end,
      },
      settlementItems: {
        none: {}, // not included in any settlement items
      },
    },
    include: {
      service: true,
    },
  });

  // 3. Compute sums
  const grossAmount = sessions.reduce((sum, s) => sum + Number(s.price), 0);
  let rentAmount = 0;
  let commissionAmount = 0;
  let netPayout = 0;

  if (model === "FIXED_RENT") {
    rentAmount = contract?.fixedRentAmount ? Number(contract.fixedRentAmount) : 0;
    netPayout = Math.max(0, grossAmount - rentAmount);
  } else if (model === "COMMISSION") {
    const rate = contract?.commissionRate ? Number(contract.commissionRate) : 0;
    commissionAmount = grossAmount * (rate / 100);
    netPayout = commissionAmount;
  } else if (model === "HYBRID") {
    rentAmount = contract?.fixedRentAmount ? Number(contract.fixedRentAmount) : 0;
    const rate = contract?.commissionRate ? Number(contract.commissionRate) : 0;
    commissionAmount = grossAmount * (rate / 100);
    netPayout = Math.max(0, commissionAmount - rentAmount);
  } else {
    // UNASSIGNED
    netPayout = grossAmount;
  }

  return {
    specialist,
    contract,
    model,
    sessions,
    grossAmount,
    rentAmount,
    commissionAmount,
    netPayout,
  };
}

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const { searchParams } = new URL(request.url);

    const parsed = CalculateQuerySchema.safeParse({
      specialistId: searchParams.get("specialistId") || undefined,
      periodStart: searchParams.get("periodStart") || undefined,
      periodEnd: searchParams.get("periodEnd") || undefined,
    });

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "INVALID_PARAMS", message: "Parámetros de consulta inválidos." },
        { status: 400 }
      );
    }

    const { specialistId, periodStart, periodEnd } = parsed.data;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);

    const calc = await computeSettlement(context.tenantId, specialistId, start, end);

    return ok({
      specialistId,
      model: calc.model,
      grossAmount: calc.grossAmount,
      rentAmount: calc.rentAmount,
      commissionAmount: calc.commissionAmount,
      netPayout: calc.netPayout,
      sessionsCount: calc.sessions.length,
      sessions: calc.sessions.map((s) => ({
        id: s.id,
        serviceName: s.service.name,
        price: s.price.toString(),
        scheduledAt: s.scheduledAt,
      })),
    });
  } catch (error: any) {
    if (error.message === "SPECIALIST_NOT_FOUND") {
      return Response.json(
        { ok: false, error: "SPECIALIST_NOT_FOUND", message: "Especialista no encontrado." },
        { status: 404 }
      );
    }
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "specialists" });
    const data = CreateSettlementSchema.parse(await request.json());

    const start = new Date(data.periodStart);
    const end = new Date(data.periodEnd);
    end.setHours(23, 59, 59, 999);

    const calc = await computeSettlement(context.tenantId, data.specialistId, start, end);

    if (calc.sessions.length === 0 && calc.rentAmount === 0) {
      return Response.json(
        {
          ok: false,
          error: "NO_ITEMS_TO_SETTLE",
          message: "No hay sesiones ni cargos de renta para liquidar en este periodo.",
        },
        { status: 400 }
      );
    }

    // Persist settlement in transaction
    const settlement = await prisma.$transaction(async (tx) => {
      // 1. Create settlement
      const sett = await tx.specialistSettlement.create({
        data: {
          tenantId: context.tenantId,
          specialistId: data.specialistId,
          periodStart: start,
          periodEnd: end,
          grossAmount: new Prisma.Decimal(calc.grossAmount),
          rentAmount: new Prisma.Decimal(calc.rentAmount),
          commissionAmount: new Prisma.Decimal(calc.commissionAmount),
          netPayout: new Prisma.Decimal(calc.netPayout),
          status: data.status as SettlementStatus,
        },
      });

      // 2. Create items for each session
      for (const session of calc.sessions) {
        await tx.specialistSettlementItem.create({
          data: {
            tenantId: context.tenantId,
            settlementId: sett.id,
            sessionId: session.id,
            concept: `Sesión: ${session.service.name}`,
            amount: session.price,
          },
        });
      }

      // 3. Create fixed rent item if applicable
      if (calc.rentAmount > 0) {
        await tx.specialistSettlementItem.create({
          data: {
            tenantId: context.tenantId,
            settlementId: sett.id,
            concept: "Deducción de Renta Fija",
            amount: new Prisma.Decimal(-calc.rentAmount),
          },
        });
      }

      // 4. Create commission item if applicable
      if (calc.commissionAmount > 0) {
        await tx.specialistSettlementItem.create({
          data: {
            tenantId: context.tenantId,
            settlementId: sett.id,
            concept: `Comisión ganada (${calc.contract?.commissionRate?.toString() || "0"}%)`,
            amount: new Prisma.Decimal(calc.commissionAmount),
          },
        });
      }

      return sett;
    });

    return created(settlement);
  } catch (error: any) {
    if (error.message === "SPECIALIST_NOT_FOUND") {
      return Response.json(
        { ok: false, error: "SPECIALIST_NOT_FOUND", message: "Especialista no encontrado." },
        { status: 404 }
      );
    }
    return fail(error);
  }
}
