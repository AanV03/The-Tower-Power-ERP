import { AccessScannerClient } from "@/components/modules/access/access-scanner-client";
import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";

export default async function AccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "access" });

  const devices = await prisma.accessDevice.findMany({
    where: {
      tenantId: context.tenantId,
      branchId: context.branchId ?? undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AccessScannerClient
      locale={locale as Locale}
      devices={devices.map((device) => ({
        id: device.id,
        name: device.name,
        code: device.code,
        type: device.type,
        status: device.status,
      }))}
    />
  );
}
