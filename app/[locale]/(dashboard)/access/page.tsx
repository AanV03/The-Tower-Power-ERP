import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import { AccessClient } from "@/components/modules/access/access-client";

export default async function AccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "access" });

  const [devices, members, branches, recentLogs] = await Promise.all([
    // 1. Fetch access devices
    prisma.accessDevice.findMany({
      where: {
        tenantId: context.tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    // 2. Fetch active members for the simulator lookup
    prisma.member.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        firstName: "asc",
      },
    }),
    // 3. Fetch branches for register dialog
    prisma.branch.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    // 4. Fetch recent outbox access logs (last 50)
    prisma.outboxEvent.findMany({
      where: {
        tenantId: context.tenantId,
        type: {
          in: ["member.access.allowed", "member.access.denied"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    }),
  ]);

  // Safe client serialization
  const serializedDevices = devices.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    type: d.type,
    status: d.status,
    branchId: d.branchId,
  }));

  const serializedMembers = members.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    email: m.email ?? "",
    status: m.status,
  }));

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  const serializedLogs = recentLogs.map((log) => {
    const payload = (log.payload as any) || {};
    return {
      id: log.id,
      type: log.type,
      allowed: payload.allowed ?? (log.type === "member.access.allowed"),
      memberName: payload.memberName ?? "Miembro Desconocido",
      memberId: payload.memberId ?? "",
      deviceName: payload.deviceName ?? "Dispositivo",
      deviceCode: payload.deviceCode ?? "",
      planName: payload.planName ?? null,
      reason: payload.reason ?? null,
      timestamp: payload.timestamp ?? log.createdAt.toISOString(),
    };
  });

  return (
    <AccessClient
      locale={locale as Locale}
      devices={serializedDevices}
      members={serializedMembers}
      branches={serializedBranches}
      recentLogs={serializedLogs}
    />
  );
}
