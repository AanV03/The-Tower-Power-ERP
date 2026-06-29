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
    prisma.accessDevice.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.findMany({
      where: { tenantId: context.tenantId, status: "ACTIVE" },
      orderBy: { firstName: "asc" },
    }),
    prisma.branch.findMany({
      where: { tenantId: context.tenantId, status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    prisma.outboxEvent.findMany({
      where: {
        tenantId: context.tenantId,
        type: { in: ["member.access.allowed", "member.access.denied"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const serializedDevices = devices.map((device) => ({
    id: device.id,
    name: device.name,
    code: device.code,
    type: device.type,
    status: device.status,
    branchId: device.branchId,
  }));

  const serializedMembers = members.map((member) => ({
    id: member.id,
    name: `${member.firstName} ${member.lastName}`,
    email: member.email ?? "",
    status: member.status,
  }));

  const serializedBranches = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
  }));

  const serializedLogs = recentLogs.map((log) => {
    const payload = (log.payload as Record<string, unknown>) || {};

    return {
      id: log.id,
      type: log.type,
      allowed: Boolean(payload.allowed ?? log.type === "member.access.allowed"),
      memberName: typeof payload.memberName === "string" ? payload.memberName : "Miembro Desconocido",
      memberId: typeof payload.memberId === "string" ? payload.memberId : "",
      deviceName: typeof payload.deviceName === "string" ? payload.deviceName : "Dispositivo",
      deviceCode: typeof payload.deviceCode === "string" ? payload.deviceCode : "",
      planName: typeof payload.planName === "string" ? payload.planName : null,
      reason: typeof payload.reason === "string" ? payload.reason : null,
      timestamp: typeof payload.timestamp === "string" ? payload.timestamp : log.createdAt.toISOString(),
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