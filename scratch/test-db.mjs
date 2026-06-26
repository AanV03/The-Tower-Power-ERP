import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const branches = await prisma.branch.findMany({});
  console.log("All branches in DB:", branches);

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, tenantId: true, branchId: true }
  });
  console.log("All users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
