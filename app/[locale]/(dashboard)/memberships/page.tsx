import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import { MembershipsClient } from "@/components/modules/memberships/memberships-client";

export default async function MembershipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "memberships" });

  const [members, plans, subscriptions, accessDevices, branches] = await Promise.all([
    prisma.member.findMany({
      where: { tenantId: context.tenantId },
      include: { branch: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membershipPlan.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findMany({
      where: { tenantId: context.tenantId },
      include: { member: true, plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.accessDevice.findMany({
      where: {
        tenantId: context.tenantId,
        branchId: context.branchId ?? undefined,
        status: "ONLINE",
      },
    }),
    prisma.branch.findMany({
      where: { tenantId: context.tenantId },
    }),
  ]);

  // Serialize Prisma Decimals and Dates for safe client hydration
  const serializedMembers = members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    name: `${m.firstName} ${m.lastName}`,
    email: m.email ?? "",
    phone: m.phone ?? "",
    birthDate: m.birthDate ? m.birthDate.toISOString() : null,
    status: m.status,
    branchId: m.branchId,
    branchName: m.branch.name,
  }));

  const serializedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toNumber(),
    billingPeriod: p.billingPeriod,
    status: p.status,
  }));

  const serializedSubscriptions = subscriptions.map((s) => ({
    id: s.id,
    memberId: s.memberId,
    memberName: `${s.member.firstName} ${s.member.lastName}`,
    planId: s.planId,
    planName: s.plan.name,
    status: s.status,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate ? s.endDate.toISOString() : null,
    autoRenew: s.autoRenew,
  }));

  const serializedDevices = accessDevices.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    status: d.status,
  }));

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <MembershipsClient
      locale={locale as Locale}
      initialMembers={serializedMembers}
      initialPlans={serializedPlans}
      initialSubscriptions={serializedSubscriptions}
      devices={serializedDevices}
      branches={serializedBranches}
    />
  );
}
