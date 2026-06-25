import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import { PosClient } from "@/components/modules/pos/pos-client";

export default async function PosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "pos" });

  const [activeSession, registers, products, members] = await Promise.all([
    prisma.cashSession.findFirst({
      where: {
        tenantId: context.tenantId,
        openedByUserId: context.userId,
        status: "OPEN",
      },
      include: {
        register: true,
      },
    }),
    prisma.posRegister.findMany({
      where: {
        tenantId: context.tenantId,
        branchId: context.branchId ?? undefined,
        status: "ACTIVE",
      },
    }),
    prisma.product.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      include: {
        category: true,
        inventoryItems: {
          where: {
            warehouse: {
              branchId: context.branchId ?? undefined,
            },
          },
        },
      },
    }),
    prisma.member.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        firstName: "asc",
      },
    }),
  ]);

  // Convert Prisma.Decimal to standard numbers for safe client serialization
  const serializedProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    categoryName: p.category?.name ?? "General",
    price: p.price.toNumber(),
    taxRate: p.taxRate.toNumber(),
    stock: p.inventoryItems.reduce((acc, item) => acc + item.quantityOnHand.toNumber(), 0),
  }));

  const serializedMembers = members.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    email: m.email ?? "",
  }));

  const serializedActiveSession = activeSession ? {
    id: activeSession.id,
    registerName: activeSession.register.name,
    openingAmount: activeSession.openingAmount.toNumber(),
    openedAt: activeSession.openedAt.toISOString(),
  } : null;

  const serializedRegisters = registers.map((r) => ({
    id: r.id,
    name: r.name,
  }));

  return (
    <PosClient
      locale={locale as Locale}
      initialActiveSession={serializedActiveSession}
      registers={serializedRegisters}
      products={serializedProducts}
      members={serializedMembers}
    />
  );
}
