import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { created, fail, ok } from "@/lib/api/response";

const OpenSessionSchema = z.object({
  registerId: z.string().min(1),
  openingAmount: z.coerce.number().nonnegative("El monto de apertura no puede ser negativo"),
});

const CloseSessionSchema = z.object({
  cashSessionId: z.string().min(1),
  closingAmount: z.coerce.number().nonnegative("El monto de cierre no puede ser negativo"),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });

    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId: context.tenantId,
        openedByUserId: context.userId,
        status: "OPEN",
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
    const context = await requireApiContext({ moduleId: "pos" });
    const body = await request.json();
    const data = OpenSessionSchema.parse(body);

    // Check if there is already an open session for this user
    const existingSession = await prisma.cashSession.findFirst({
      where: {
        tenantId: context.tenantId,
        openedByUserId: context.userId,
        status: "OPEN",
      },
    });

    if (existingSession) {
      return Response.json(
        { ok: false, error: "SESSION_ALREADY_OPEN", message: "Ya tienes una sesión de caja abierta." },
        { status: 400 }
      );
    }

    const session = await prisma.cashSession.create({
      data: {
        tenantId: context.tenantId,
        registerId: data.registerId,
        openedByUserId: context.userId,
        openingAmount: new Prisma.Decimal(data.openingAmount),
        status: "OPEN",
      },
      include: {
        register: true,
      },
    });

    return created(session);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "pos" });
    const body = await request.json();
    const data = CloseSessionSchema.parse(body);

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
    });

    return ok(session);
  } catch (error) {
    return fail(error);
  }
}
