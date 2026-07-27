import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create PrismaClient.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type TenantTransactionClient = Prisma.TransactionClient;

export async function withTenantTransaction<T>(
  tenantId: string,
  operation: (tx: TenantTransactionClient) => Promise<T>,
): Promise<T> {
  const normalizedTenantId = tenantId.trim();

  if (!normalizedTenantId) {
    throw new Error("TENANT_ID_REQUIRED");
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE authenticated");

      const [setting] = await tx.$queryRaw<Array<{ tenantId: string | null }>>`
        SELECT set_config(
          'app.current_tenant_id',
          ${normalizedTenantId},
          true
        ) AS "tenantId"
      `;

      if (setting?.tenantId !== normalizedTenantId) {
        throw new Error("TENANT_CONTEXT_NOT_SET");
      }

      return operation(tx);
    },
    {
      maxWait: 10_000,
      timeout: 30_000,
    },
  );
}
