import { Prisma } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const OpenSessionSchema = z.object({
  registerId: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.string().min(1).optional(),
  ),
  branchId: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.string().min(1).optional(),
  ),
  openingAmount: z.coerce.number().nonnegative("El monto de apertura no puede ser negativo"),
});

const CloseSessionSchema = z.object({
  cashSessionId: z.string().min(1),
  closingAmount: z.coerce.number().nonnegative("El monto de cierre no puede ser negativo"),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const context = await requireApiContext({ moduleId: "pos", method: "GET" });

    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId: context.tenantId,
        openedByUserId: context.userId,
        status: "OPEN",
        ...(context.branchId ? { register: { branchId: context.branchId } } : {}),
      },
      include: {
        register: true,
      },
    });

    return ok(activeSession);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos", method: "POST" });
    const data = OpenSessionSchema.parse(await request.json());
    const fallbackBranchId = data.registerId
      ? undefined
      : await resolveWritableBranchId(context, data.branchId);

    const sessionResult = await prisma.$transaction(async (tx) => {
      const existingSession = await tx.cashSession.findFirst({
        where: {
          tenantId: context.tenantId,
          openedByUserId: context.userId,
          status: "OPEN",
          ...(context.branchId ? { register: { branchId: context.branchId } } : {}),
        },
        include: {
          register: true,
        },
      });

      if (existingSession) {
        return { session: existingSession, created: false };
      }

      let registerId = data.registerId;

      if (registerId) {
        const register = await tx.posRegister.findFirst({
          where: {
            id: registerId,
            tenantId: context.tenantId,
            status: "ACTIVE",
            ...(context.branchId ? { branchId: context.branchId } : {}),
          },
        });

        if (!register) {
          throw new ApiError(
            "La caja seleccionada no existe o no pertenece a la sucursal activa.",
            400,
            "REGISTER_NOT_FOUND",
          );
        }
      } else {
        if (!fallbackBranchId) {
          throw new ApiError("Se requiere una sucursal activa para generar la caja principal.", 400, "BRANCH_REQUIRED");
        }

        const fallbackRegister = await tx.posRegister.upsert({
          where: {
            tenantId_branchId_name: {
              tenantId: context.tenantId,
              branchId: fallbackBranchId,
              name: "Caja Principal - Generada",
            },
          },
          create: {
            tenantId: context.tenantId,
            branchId: fallbackBranchId,
            name: "Caja Principal - Generada",
            status: "ACTIVE",
          },
          update: {
            status: "ACTIVE",
          },
        });

        registerId = fallbackRegister.id;
      }

      const session = await tx.cashSession.create({
        data: {
          tenantId: context.tenantId,
          registerId,
          openedByUserId: context.userId,
          openingAmount: new Prisma.Decimal(data.openingAmount),
          status: "OPEN",
        },
        include: {
          register: true,
        },
      });

      return { session, created: true };
    });

    return sessionResult.created ? created(sessionResult.session) : ok(sessionResult.session);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos", method: "PATCH" });
    const data = CloseSessionSchema.parse(await request.json());

    const session = await prisma.cashSession.update({
      where: {
        id: data.cashSessionId,
        tenantId: context.tenantId,
        openedByUserId: context.userId,
        status: "OPEN",
      },
      data: {
        status: "CLOSED",
        closingAmount: new Prisma.Decimal(data.closingAmount),
        closedAt: new Date(),
        closedByUserId: context.userId,
      },
      include: {
        register: true,
      },
    });

    return ok(session);
  } catch (error) {
    return fail(error);
  }
}
