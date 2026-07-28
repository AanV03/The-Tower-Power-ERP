import { ModuleKey } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/api/response";
import { requireApiContext } from "@/lib/api/context";

const UpdateTenantSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  legalName: z.string().trim().max(180).nullable().optional(),
  taxId: z.string().trim().max(60).nullable().optional(),
  modules: z.record(z.string(), z.boolean()).optional(),
  brandColors: z.any().optional(),
  brandIdentity: z.any().optional(),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const context = await requireApiContext({ moduleId: "admin" });

    const tenantRecord = await prisma.tenant.findUniqueOrThrow({
      where: { id: context.tenantId },
      include: {
        plan: true,
        branches: { orderBy: { createdAt: "asc" } },
        modules: { orderBy: { moduleKey: "asc" } },
        memberships: {
          select: {
            defaultBranchId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    const { memberships, ...tenant } = tenantRecord;

    return ok({
      ...tenant,
      users: memberships.map(({ defaultBranchId, user }) => ({
        ...user,
        branchId: defaultBranchId,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "admin" });
    const data = UpdateTenantSchema.parse(await request.json());

    const validModuleEntries = Object.entries(data.modules ?? {}).filter(([moduleKey]) =>
      Object.values(ModuleKey).includes(moduleKey as ModuleKey),
    );

    const tenant = await prisma.$transaction(async (tx) => {
      if (validModuleEntries.length > 0) {
        await Promise.all(
          validModuleEntries.map(([moduleKey, enabled]) =>
            tx.tenantModule.upsert({
              where: {
                tenantId_moduleKey: {
                  tenantId: context.tenantId,
                  moduleKey: moduleKey as ModuleKey,
                },
              },
              update: { enabled },
              create: {
                tenantId: context.tenantId,
                moduleKey: moduleKey as ModuleKey,
                enabled,
              },
            }),
          ),
        );
      }

      return tx.tenant.update({
        where: { id: context.tenantId },
        data: {
          name: data.name,
          legalName: data.legalName,
          taxId: data.taxId,
          brandColors: data.brandColors ?? undefined,
          brandIdentity: data.brandIdentity ?? undefined,
        },
        include: {
          plan: true,
          branches: { orderBy: { createdAt: "asc" } },
          modules: { orderBy: { moduleKey: "asc" } },
        },
      });
    });

    return ok(tenant);
  } catch (error) {
    return fail(error);
  }
}
