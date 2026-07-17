import { NextResponse } from "next/server";

import { requireApiContext } from "@/lib/api/context";
import { fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const roles = await prisma.role.findMany({
      where: {
        tenantId: context.tenantId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return ok(roles);
  } catch (error) {
    return fail(error);
  }
}
