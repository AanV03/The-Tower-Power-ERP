import { Prisma, SettlementStatus, SpecialistContractModel } from "@prisma/client";

import { ApiError } from "@/lib/api/response";

const ZERO = new Prisma.Decimal(0);
const HUNDRED = new Prisma.Decimal(100);

type SettlementInput = {
  tenantId: string;
  specialistId: string;
  periodStart: Date;
  periodEnd: Date;
  status?: SettlementStatus;
};

function money(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0).toDecimalPlaces(2);
}

function calculateSettlementAmounts(
  model: SpecialistContractModel,
  grossAmount: Prisma.Decimal,
  fixedRentAmount: Prisma.Decimal,
  commissionRate: Prisma.Decimal,
) {
  const commissionAmount =
    model === SpecialistContractModel.FIXED_RENT
      ? ZERO
      : grossAmount.mul(commissionRate.div(HUNDRED));
  const rentAmount =
    model === SpecialistContractModel.COMMISSION ? ZERO : fixedRentAmount;
  const netPayout =
    model === SpecialistContractModel.FIXED_RENT
      ? grossAmount.minus(rentAmount)
      : commissionAmount.minus(rentAmount);

  return {
    commissionAmount: money(commissionAmount),
    rentAmount: money(rentAmount),
    netPayout: money(netPayout),
  };
}

export async function createSpecialistSettlement(
  tx: Prisma.TransactionClient,
  input: SettlementInput,
) {
  const specialist = await tx.specialist.findFirst({
    where: {
      id: input.specialistId,
      tenantId: input.tenantId,
    },
  });

  if (!specialist) {
    throw new ApiError("Specialist was not found in this tenant.", 404, "SPECIALIST_NOT_FOUND");
  }

  const contract = await tx.specialistContract.findFirst({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      status: "ACTIVE",
      startDate: { lte: input.periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: input.periodStart } }],
    },
    orderBy: { startDate: "desc" },
  });

  if (!contract) {
    throw new ApiError("Specialist does not have an active contract for this period.", 400, "CONTRACT_REQUIRED");
  }

  if (
    contract.model !== SpecialistContractModel.FIXED_RENT &&
    contract.commissionRate === null
  ) {
    throw new ApiError("Commission contracts require a percentage rate.", 400, "COMMISSION_RATE_REQUIRED");
  }

  if (
    contract.model !== SpecialistContractModel.COMMISSION &&
    contract.fixedRentAmount === null
  ) {
    throw new ApiError("Fixed-rent contracts require a rent amount.", 400, "FIXED_RENT_REQUIRED");
  }

  const lockedSettlement = await tx.specialistSettlement.findFirst({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      status: { in: [SettlementStatus.APPROVED, SettlementStatus.PAID] },
    },
  });

  if (lockedSettlement) {
    throw new ApiError("This settlement period is already locked.", 409, "SETTLEMENT_LOCKED");
  }

  const existingDraft = await tx.specialistSettlement.findFirst({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      status: SettlementStatus.DRAFT,
    },
  });

  if (existingDraft) {
    await tx.specialistSettlementItem.deleteMany({
      where: { tenantId: input.tenantId, settlementId: existingDraft.id },
    });
    await tx.specialistCommission.deleteMany({
      where: { tenantId: input.tenantId, settlementId: existingDraft.id },
    });
    await tx.specialistSettlement.delete({ where: { id: existingDraft.id } });
  }

  const sessions = await tx.specialistSession.findMany({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      status: "COMPLETED",
      OR: [
        { completedAt: { gte: input.periodStart, lte: input.periodEnd } },
        {
          completedAt: null,
          scheduledAt: { gte: input.periodStart, lte: input.periodEnd },
        },
      ],
    },
    include: { service: true },
    orderBy: { scheduledAt: "asc" },
  });

  if (sessions.length > 0) {
    const assignedLockedCommission = await tx.specialistCommission.findFirst({
      where: {
        tenantId: input.tenantId,
        sessionId: { in: sessions.map((session) => session.id) },
        settlement: { status: { in: [SettlementStatus.APPROVED, SettlementStatus.PAID] } },
      },
    });

    if (assignedLockedCommission) {
      throw new ApiError("At least one session is already assigned to a locked settlement.", 409, "SESSION_ALREADY_SETTLED");
    }
  }

  const grossAmount = money(
    sessions.reduce((sum, session) => sum.plus(session.price), ZERO),
  );
  const fixedRentAmount = money(contract.fixedRentAmount);
  const commissionRate = money(contract.commissionRate);
  const { commissionAmount, rentAmount, netPayout } = calculateSettlementAmounts(
    contract.model,
    grossAmount,
    fixedRentAmount,
    commissionRate,
  );

  const settlement = await tx.specialistSettlement.create({
    data: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      grossAmount,
      rentAmount,
      commissionAmount,
      netPayout,
      status: input.status ?? SettlementStatus.DRAFT,
    },
  });

  const rentProration = sessions.length > 0 ? rentAmount.div(sessions.length) : ZERO;
  const rateFraction = commissionRate.div(HUNDRED);

  for (const session of sessions) {
    const sessionGross = money(session.price);
    const sessionCommission =
      contract.model === SpecialistContractModel.FIXED_RENT
        ? ZERO
        : money(sessionGross.mul(rateFraction));
    const sessionNet =
      contract.model === SpecialistContractModel.FIXED_RENT
        ? money(sessionGross.minus(rentProration))
        : money(sessionCommission.minus(rentProration));

    await tx.specialistCommission.upsert({
      where: {
        tenantId_sessionId: {
          tenantId: input.tenantId,
          sessionId: session.id,
        },
      },
      update: {
        contractId: contract.id,
        settlementId: settlement.id,
        grossAmount: sessionGross,
        commissionRate: contract.model === SpecialistContractModel.FIXED_RENT ? null : commissionRate,
        rentProration: money(rentProration),
        commissionAmount: sessionCommission,
        netAmount: sessionNet,
        calculatedAt: new Date(),
      },
      create: {
        tenantId: input.tenantId,
        specialistId: input.specialistId,
        contractId: contract.id,
        sessionId: session.id,
        settlementId: settlement.id,
        grossAmount: sessionGross,
        commissionRate: contract.model === SpecialistContractModel.FIXED_RENT ? null : commissionRate,
        rentProration: money(rentProration),
        commissionAmount: sessionCommission,
        netAmount: sessionNet,
      },
    });

    await tx.specialistSettlementItem.create({
      data: {
        tenantId: input.tenantId,
        settlementId: settlement.id,
        sessionId: session.id,
        concept: `${session.service.name} (${contract.model})`,
        amount: sessionNet,
      },
    });
  }

  if (!rentAmount.isZero()) {
    await tx.specialistSettlementItem.create({
      data: {
        tenantId: input.tenantId,
        settlementId: settlement.id,
        concept: "Flat rent fee",
        amount: money(rentAmount.negated()),
      },
    });
  }

  return tx.specialistSettlement.findUniqueOrThrow({
    where: { id: settlement.id },
    include: {
      specialist: true,
      items: true,
      commissions: true,
    },
  });
}
