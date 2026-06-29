import { Prisma, SettlementStatus, SpecialistContractModel } from "@prisma/client";

import { ApiError } from "@/lib/api/response";
import { DEFAULT_TIME_ZONE, getDayBoundsForTimeZone } from "@/lib/date/timezone";

const ZERO = new Prisma.Decimal(0);
const HUNDRED = new Prisma.Decimal(100);
const LOCKED_SETTLEMENT_STATUSES = [SettlementStatus.APPROVED, SettlementStatus.PAID] as const;

type SettlementInput = {
  tenantId: string;
  specialistId: string;
  periodStart: Date;
  periodEnd: Date;
  status?: SettlementStatus;
};

type TransitionSettlementInput = {
  tenantId: string;
  settlementId: string;
  status: SettlementStatus;
};

function money(value: Prisma.Decimal | number | string | null | undefined) {
  return new Prisma.Decimal(value ?? 0).toDecimalPlaces(2);
}

function sumMoney(values: Prisma.Decimal[]) {
  return values.reduce((sum, value) => sum.plus(value), ZERO).toDecimalPlaces(2);
}

function allocateEvenly(total: Prisma.Decimal, count: number) {
  if (count <= 0) return [];

  const totalCents = money(total).mul(100).toDecimalPlaces(0).toNumber();
  const baseCents = Math.trunc(totalCents / count);
  const remainder = totalCents % count;

  return Array.from({ length: count }, (_, index) =>
    money((baseCents + (index < remainder ? 1 : 0)) / 100),
  );
}

function normalizePeriodBounds(periodStart: Date, periodEnd: Date, timeZone: string) {
  const start = getDayBoundsForTimeZone(periodStart, timeZone).start;
  const endExclusive = getDayBoundsForTimeZone(periodEnd, timeZone).end;

  if (endExclusive <= start) {
    throw new ApiError("Period end must be greater than or equal to period start.", 400, "INVALID_PERIOD");
  }

  return {
    periodStart: start,
    periodEnd: new Date(endExclusive.getTime() - 1),
    periodEndExclusive: endExclusive,
  };
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
  if (input.status === SettlementStatus.PAID) {
    throw new ApiError("Settlements must be approved before they can be marked as paid.", 409, "INVALID_SETTLEMENT_TRANSITION");
  }

  const specialist = await tx.specialist.findFirst({
    where: {
      id: input.specialistId,
      tenantId: input.tenantId,
    },
    include: {
      branch: {
        select: { timezone: true },
      },
    },
  });

  if (!specialist) {
    throw new ApiError("Specialist was not found in this tenant.", 404, "SPECIALIST_NOT_FOUND");
  }

  const timeZone = specialist.branch?.timezone ?? DEFAULT_TIME_ZONE;
  const { periodStart, periodEnd, periodEndExclusive } = normalizePeriodBounds(
    input.periodStart,
    input.periodEnd,
    timeZone,
  );

  const contract = await tx.specialistContract.findFirst({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      status: "ACTIVE",
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
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
      periodStart,
      periodEnd,
      status: { in: [...LOCKED_SETTLEMENT_STATUSES] },
    },
  });

  if (lockedSettlement) {
    throw new ApiError("This settlement period is already locked.", 409, "SETTLEMENT_LOCKED");
  }

  const existingDraft = await tx.specialistSettlement.findFirst({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      periodStart,
      periodEnd,
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
    await tx.specialistSettlement.deleteMany({
      where: { id: existingDraft.id, tenantId: input.tenantId },
    });
  }

  const sessions = await tx.specialistSession.findMany({
    where: {
      tenantId: input.tenantId,
      specialistId: input.specialistId,
      status: "COMPLETED",
      OR: [
        { completedAt: { gte: periodStart, lt: periodEndExclusive } },
        {
          completedAt: null,
          scheduledAt: { gte: periodStart, lt: periodEndExclusive },
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
        settlement: { status: { in: [...LOCKED_SETTLEMENT_STATUSES] } },
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
      periodStart,
      periodEnd,
      grossAmount,
      rentAmount,
      commissionAmount,
      netPayout,
      status: input.status ?? SettlementStatus.DRAFT,
    },
  });

  const rateFraction = commissionRate.div(HUNDRED);
  const rentAllocations = allocateEvenly(rentAmount, sessions.length);
  const commissionAllocations = sessions.map((session) =>
    contract.model === SpecialistContractModel.FIXED_RENT
      ? ZERO
      : money(money(session.price).mul(rateFraction)),
  );
  const commissionDelta = commissionAmount.minus(sumMoney(commissionAllocations));
  if (commissionAllocations.length > 0 && !commissionDelta.isZero()) {
    const lastIndex = commissionAllocations.length - 1;
    commissionAllocations[lastIndex] = money(commissionAllocations[lastIndex].plus(commissionDelta));
  }

  for (const [index, session] of sessions.entries()) {
    const sessionGross = money(session.price);
    const sessionCommission = commissionAllocations[index] ?? ZERO;
    const sessionRentProration = rentAllocations[index] ?? ZERO;
    const sessionPayoutBasis =
      contract.model === SpecialistContractModel.FIXED_RENT
        ? sessionGross
        : sessionCommission;
    const sessionNet = money(sessionPayoutBasis.minus(sessionRentProration));

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
        rentProration: sessionRentProration,
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
        rentProration: sessionRentProration,
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
        amount: sessionPayoutBasis,
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

  return tx.specialistSettlement.findFirstOrThrow({
    where: { id: settlement.id, tenantId: input.tenantId },
    include: {
      specialist: true,
      items: true,
      commissions: true,
    },
  });
}

function canTransitionSettlementStatus(from: SettlementStatus, to: SettlementStatus) {
  if (from === to) return true;
  if (from === SettlementStatus.DRAFT) {
    return to === SettlementStatus.APPROVED;
  }
  if (from === SettlementStatus.APPROVED) {
    return to === SettlementStatus.PAID;
  }

  return false;
}

export async function transitionSpecialistSettlementStatus(
  tx: Prisma.TransactionClient,
  input: TransitionSettlementInput,
) {
  const settlement = await tx.specialistSettlement.findFirst({
    where: {
      id: input.settlementId,
      tenantId: input.tenantId,
    },
    include: {
      specialist: {
        select: { branchId: true },
      },
      commissions: {
        select: { id: true, sessionId: true },
      },
      items: {
        select: { id: true, sessionId: true },
      },
    },
  });

  if (!settlement) {
    throw new ApiError("Settlement was not found in this tenant.", 404, "SETTLEMENT_NOT_FOUND");
  }

  if (!canTransitionSettlementStatus(settlement.status, input.status)) {
    throw new ApiError("Invalid settlement status transition.", 409, "INVALID_SETTLEMENT_TRANSITION");
  }

  if (input.status !== SettlementStatus.DRAFT) {
    const sessionIds = Array.from(
      new Set(
        [
          ...settlement.commissions.map((commission) => commission.sessionId),
          ...settlement.items.map((item) => item.sessionId),
        ].filter((sessionId): sessionId is string => Boolean(sessionId)),
      ),
    );

    if (sessionIds.length > 0) {
      const duplicateLockedCommission = await tx.specialistCommission.findFirst({
        where: {
          tenantId: input.tenantId,
          sessionId: { in: sessionIds },
          settlementId: { not: settlement.id },
          settlement: { status: { in: [...LOCKED_SETTLEMENT_STATUSES] } },
        },
      });

      if (duplicateLockedCommission) {
        throw new ApiError("At least one session is already assigned to another locked settlement.", 409, "SESSION_ALREADY_SETTLED");
      }

      await tx.specialistCommission.updateMany({
        where: {
          tenantId: input.tenantId,
          sessionId: { in: sessionIds },
        },
        data: {
          settlementId: settlement.id,
          calculatedAt: new Date(),
        },
      });
    }
  }

  return tx.specialistSettlement.update({
    where: { id: settlement.id },
    data: { status: input.status },
    include: {
      specialist: true,
      items: true,
      commissions: true,
    },
  });
}
