import { ClassBookingStatus } from "@prisma/client";

import { ApiError } from "@/lib/api/response";
import {
  MemberGroup,
  MemberPointsLedger,
  MemberProgress,
} from "@/lib/db/mongo-models";
import { connectMongo } from "@/lib/db/mongodb";
import { withTenantTransaction } from "@/lib/db/prisma";
import {
  getPortalContext,
  withPortalContext,
} from "@/lib/portal/context";
import type {
  PortalClass,
  PortalLeaderboardEntry,
  PortalProgress,
  PortalSettings,
  PortalTeam,
  PortalWorkout,
} from "@/lib/portal/types";
import type {
  PortalProgressInput,
  PortalSettingsInput,
} from "@/lib/portal/schemas";

const ACTIVE_BOOKING_STATUSES: ClassBookingStatus[] = [
  ClassBookingStatus.PENDING,
  ClassBookingStatus.CONFIRMED,
];

type ProgressDocument = {
  measurements?: Array<{
    measuredAt: Date;
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
  }>;
};

type GroupDocument = {
  _id: { toString(): string };
  name: string;
  description?: string;
  memberIds?: string[];
};

type PointsTotal = {
  _id: string;
  points: number;
};

function emptyProgress(): PortalProgress {
  return {
    weight: null,
    bodyFat: null,
    muscleMass: null,
    points: 0,
    level: "Sin rango",
    nextLevelPoints: 500,
    history: [],
  };
}

async function readProgress(
  tenantId: string,
  memberId: string,
): Promise<PortalProgress> {
  if (!process.env.MONGODB_URI) return emptyProgress();

  await connectMongo();
  const [document, pointsResult] = await Promise.all([
    MemberProgress.findOne({ tenantId, memberId }).lean().exec(),
    MemberPointsLedger.aggregate<{ total: number }>([
      { $match: { tenantId, memberId } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]),
  ]);
  const progress = document as ProgressDocument | null;
  const measurements = [...(progress?.measurements ?? [])].sort(
    (left, right) =>
      new Date(left.measuredAt).getTime() -
      new Date(right.measuredAt).getTime(),
  );
  const latest = measurements.at(-1);
  const points = pointsResult[0]?.total ?? 0;
  const levelNumber = Math.floor(points / 500) + 1;

  return {
    weight: latest?.weight ?? null,
    bodyFat: latest?.bodyFat ?? null,
    muscleMass: latest?.muscleMass ?? null,
    points,
    level: points > 0 ? `Nivel ${levelNumber}` : "Sin rango",
    nextLevelPoints: levelNumber * 500,
    history: measurements.map((measurement) => ({
      date: new Date(measurement.measuredAt).toISOString(),
      weight: measurement.weight ?? null,
      bodyFat: measurement.bodyFat ?? null,
      muscleMass: measurement.muscleMass ?? null,
    })),
  };
}

export function getPortalWorkouts(tenantSlug: string) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    const plans = await tx.workoutPlan.findMany({
      where: {
        tenantId: context.tenantId,
        memberId: context.memberId,
      },
      include: {
        exercises: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return plans.map<PortalWorkout>((plan) => ({
      id: plan.id,
      day: plan.schedule ?? "Plan activo",
      name: plan.name,
      description: plan.description,
      exercises: plan.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.exerciseName,
        series: exercise.series,
        reps: exercise.reps,
        weight: exercise.weight,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
      })),
    }));
  });
}

export function getPortalSchedule(tenantSlug: string) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    const sessions = await tx.classSession.findMany({
      where: {
        tenantId: context.tenantId,
        branchId: context.branchId,
        endTime: { gte: new Date() },
      },
      include: {
        bookings: {
          where: {
            memberId: context.memberId,
          },
          select: { status: true },
        },
        _count: {
          select: {
            bookings: {
              where: { status: { in: ACTIVE_BOOKING_STATUSES } },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
      take: 50,
    });

    return sessions.map<PortalClass>((session) => ({
      id: session.id,
      name: session.name,
      trainer: session.trainer,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      capacity: session.capacity,
      booked: session._count.bookings,
      bookingStatus: session.bookings[0]?.status ?? null,
    }));
  });
}

export function getPortalProfile(tenantSlug: string) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    const subscription = await tx.subscription.findFirst({
      where: {
        tenantId: context.tenantId,
        memberId: context.memberId,
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (subscription && subscription.plan.tenantId !== context.tenantId) {
      throw new ApiError(
        "La suscripcion contiene una referencia cross-tenant invalida.",
        500,
        "TENANT_INTEGRITY_ERROR",
      );
    }

    return {
      id: context.memberId,
      name: `${context.member.firstName} ${context.member.lastName}`.trim(),
      initials:
        `${context.member.firstName[0] ?? ""}${context.member.lastName[0] ?? ""}`.toUpperCase(),
      email: context.member.email ?? context.user.email,
      phone: context.member.phone ?? context.user.phone,
      memberSince: context.member.createdAt.toISOString(),
      subscription: subscription
        ? {
            planName: subscription.plan.name,
            status: subscription.status,
            price: subscription.plan.price.toString(),
            currency: subscription.plan.currency,
            nextBillingDate: subscription.nextBillingDate?.toISOString() ?? null,
            autoRenew: subscription.autoRenew,
          }
        : null,
    };
  });
}

export function getPortalSettings(tenantSlug: string) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    const settings = await tx.memberPortalSetting.findUnique({
      where: {
        tenantId_membershipId: {
          tenantId: context.tenantId,
          membershipId: context.membershipId,
        },
      },
    });

    return {
      pushNotifications: settings?.pushNotifications ?? true,
      reminders: settings?.reminders ?? true,
      darkMode: settings?.darkMode ?? true,
    } satisfies PortalSettings;
  });
}

export function updatePortalSettings(
  tenantSlug: string,
  input: PortalSettingsInput,
) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    const settings = await tx.memberPortalSetting.upsert({
      where: {
        tenantId_membershipId: {
          tenantId: context.tenantId,
          membershipId: context.membershipId,
        },
      },
      create: {
        tenantId: context.tenantId,
        membershipId: context.membershipId,
        ...input,
      },
      update: input,
    });

    return {
      pushNotifications: settings.pushNotifications,
      reminders: settings.reminders,
      darkMode: settings.darkMode,
    } satisfies PortalSettings;
  });
}

export function createPortalBooking(
  tenantSlug: string,
  classSessionId: string,
) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(
        hashtext(${`${context.tenantId}:${classSessionId}`})
      )
    `;

    const session = await tx.classSession.findUnique({
      where: {
        tenantId_id: {
          tenantId: context.tenantId,
          id: classSessionId,
        },
      },
    });

    if (
      !session ||
      session.branchId !== context.branchId ||
      session.endTime <= new Date()
    ) {
      throw new ApiError("Clase no disponible.", 404, "CLASS_NOT_AVAILABLE");
    }

    const existing = await tx.classBooking.findUnique({
      where: {
        tenantId_classSessionId_memberId: {
          tenantId: context.tenantId,
          classSessionId,
          memberId: context.memberId,
        },
      },
    });

    if (existing && ACTIVE_BOOKING_STATUSES.includes(existing.status)) {
      return { booking: existing, idempotent: true };
    }

    const occupied = await tx.classBooking.count({
      where: {
        tenantId: context.tenantId,
        classSessionId,
        status: { in: ACTIVE_BOOKING_STATUSES },
      },
    });
    if (occupied >= session.capacity) {
      throw new ApiError("La clase no tiene cupo.", 409, "CLASS_FULL");
    }

    const booking = existing
      ? await tx.classBooking.update({
          where: { id: existing.id },
          data: { status: ClassBookingStatus.CONFIRMED },
        })
      : await tx.classBooking.create({
          data: {
            tenantId: context.tenantId,
            classSessionId,
            memberId: context.memberId,
            status: ClassBookingStatus.CONFIRMED,
          },
        });

    return { booking, idempotent: false };
  });
}

export function cancelPortalBooking(
  tenantSlug: string,
  classSessionId: string,
) {
  return withPortalContext(tenantSlug, async (tx, context) => {
    const booking = await tx.classBooking.findUnique({
      where: {
        tenantId_classSessionId_memberId: {
          tenantId: context.tenantId,
          classSessionId,
          memberId: context.memberId,
        },
      },
    });

    if (!booking) {
      throw new ApiError("Reserva no encontrada.", 404, "BOOKING_NOT_FOUND");
    }

    return tx.classBooking.update({
      where: { id: booking.id },
      data: { status: ClassBookingStatus.CANCELLED },
    });
  });
}

export async function getPortalProgress(tenantSlug: string) {
  const context = await getPortalContext(tenantSlug);
  return readProgress(context.tenantId, context.memberId);
}

export async function savePortalProgress(
  tenantSlug: string,
  input: PortalProgressInput,
) {
  const context = await getPortalContext(tenantSlug);
  if (!process.env.MONGODB_URI) {
    throw new ApiError(
      "El almacenamiento de progreso no esta configurado.",
      503,
      "MONGO_UNAVAILABLE",
    );
  }

  await connectMongo();
  await MemberProgress.updateOne(
    { tenantId: context.tenantId, memberId: context.memberId },
    {
      $push: {
        measurements: {
          $each: [{
            measuredAt: input.measuredAt ?? new Date(),
            weight: input.weight,
            bodyFat: input.bodyFat,
            muscleMass: input.muscleMass,
          }],
          $slice: -365,
        },
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, runValidators: true },
  );

  return readProgress(context.tenantId, context.memberId);
}

export async function getPortalHome(tenantSlug: string) {
  const sqlData = await withPortalContext(
    tenantSlug,
    async (tx, context) => {
      const workout = await tx.workoutPlan.findFirst({
        where: {
          tenantId: context.tenantId,
          memberId: context.memberId,
        },
        select: { name: true },
        orderBy: { createdAt: "asc" },
      });
      const unreadNotifications = await tx.notificationRecipient.count({
        where: {
          tenantId: context.tenantId,
          userId: context.userId,
          deleted: false,
          read: false,
        },
      });

      return {
        context,
        workoutName: workout?.name ?? null,
        unreadNotifications,
      };
    },
  );
  const progress = await readProgress(
    sqlData.context.tenantId,
    sqlData.context.memberId,
  );

  return { ...sqlData, progress };
}

export async function getPortalSocial(tenantSlug: string) {
  const context = await getPortalContext(tenantSlug);
  if (!process.env.MONGODB_URI) {
    return {
      available: false,
      teams: [] as PortalTeam[],
      leaderboard: [] as PortalLeaderboardEntry[],
    };
  }

  await connectMongo();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const [groupDocuments, pointTotals] = await Promise.all([
    MemberGroup.find({ tenantId: context.tenantId }).lean().exec(),
    MemberPointsLedger.aggregate<PointsTotal>([
      {
        $match: {
          tenantId: context.tenantId,
          occurredAt: { $gte: monthStart },
        },
      },
      { $group: { _id: "$memberId", points: { $sum: "$points" } } },
      { $sort: { points: -1 } },
      { $limit: 50 },
    ]),
  ]);
  const groups = groupDocuments as unknown as GroupDocument[];
  const pointsByMember = new Map(
    pointTotals.map((entry) => [entry._id, entry.points]),
  );
  const memberIds = pointTotals.map((entry) => entry._id);
  const memberNames = memberIds.length
    ? await withTenantTransaction(context.tenantId, (tx) =>
        tx.member.findMany({
          where: {
            tenantId: context.tenantId,
            id: { in: memberIds },
          },
          select: { id: true, firstName: true, lastName: true },
        }),
      )
    : [];
  const namesByMember = new Map(
    memberNames.map((member) => [
      member.id,
      `${member.firstName} ${member.lastName}`.trim(),
    ]),
  );
  const rankedGroups = groups
    .map((group) => {
      const members = group.memberIds ?? [];
      return {
        group,
        monthlyXP: members.reduce(
          (total, memberId) => total + (pointsByMember.get(memberId) ?? 0),
          0,
        ),
      };
    })
    .sort((left, right) => right.monthlyXP - left.monthlyXP);

  return {
    available: true,
    teams: rankedGroups.map<PortalTeam>(({ group, monthlyXP }, index) => ({
      id: group._id.toString(),
      name: group.name,
      description: group.description ?? "",
      membersCount: group.memberIds?.length ?? 0,
      monthlyXP,
      rank: index + 1,
      joined: group.memberIds?.includes(context.memberId) ?? false,
    })),
    leaderboard: pointTotals.map<PortalLeaderboardEntry>((entry, index) => ({
      id: entry._id,
      name: namesByMember.get(entry._id) ?? "Socio",
      xp: entry.points,
      rank: index + 1,
      isCurrentMember: entry._id === context.memberId,
    })),
  };
}

export async function updatePortalTeamMembership(
  tenantSlug: string,
  teamId: string,
  joined: boolean,
) {
  const context = await getPortalContext(tenantSlug);
  if (!process.env.MONGODB_URI) {
    throw new ApiError(
      "La comunidad no esta configurada.",
      503,
      "MONGO_UNAVAILABLE",
    );
  }

  await connectMongo();
  const update = joined
    ? { $addToSet: { memberIds: context.memberId } }
    : { $pull: { memberIds: context.memberId } };
  const result = await MemberGroup.updateOne(
    { _id: teamId, tenantId: context.tenantId },
    update,
  );

  if (!result.matchedCount) {
    throw new ApiError("Equipo no encontrado.", 404, "TEAM_NOT_FOUND");
  }

  return { teamId, joined };
}
