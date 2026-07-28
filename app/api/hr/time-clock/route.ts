import { AttendanceSource } from "@prisma/client";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

const ClockActionSchema = z.enum(["CLOCK_IN", "CLOCK_OUT"]);

const TimeClockSchema = z.object({
  employeeId: z.string().min(1),
  branchId: z.string().optional(),
  action: ClockActionSchema,
  source: z.enum(AttendanceSource).default(AttendanceSource.APP),
  notes: z.string().trim().max(240).optional(),
});

function parseDate(value: string | null) {
  return value ? new Date(value) : undefined;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", permission: "hr.read" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const branchId = searchParams.get("branchId") ?? context.branchId;

    if (branchId && context.branchId && branchId !== context.branchId) {
      throw new ApiError("The current user cannot access this branch.", 403, "BRANCH_ACCESS_DENIED");
    }

    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));
    const status = searchParams.get("status");
    const where = {
      tenantId: context.tenantId,
      ...(branchId ? { branchId } : {}),
      ...(searchParams.get("employeeId") ? { employeeId: searchParams.get("employeeId") ?? undefined } : {}),
      ...(status === "OPEN" ? { clockOut: null } : {}),
      ...(status === "CLOSED" ? { clockOut: { not: null } } : {}),
      ...(from || to ? { clockIn: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.timeClock.findMany({
        where,
        include: { employee: true, branch: true },
        orderBy: { clockIn: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.timeClock.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", permission: "hr.attendance.write" });
    const data = TimeClockSchema.parse(await request.json());
    const now = new Date();

    const clock = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findFirst({
        where: {
          id: data.employeeId,
          tenantId: context.tenantId,
          ...(context.branchId ? { branchId: context.branchId } : {}),
        },
        include: { branch: true },
      });

      if (!employee) {
        throw new ApiError("Employee was not found in this tenant.", 404, "EMPLOYEE_NOT_FOUND");
      }

      const branchId = data.branchId ?? employee.branchId;
      if (branchId !== employee.branchId) {
        throw new ApiError("The selected branch does not match the employee branch.", 400, "EMPLOYEE_BRANCH_MISMATCH");
      }

      const openClockWhere = {
        tenantId: context.tenantId,
        employeeId: employee.id,
        clockOut: null,
      };

      const openClock = await tx.timeClock.findFirst({
        where: openClockWhere,
        orderBy: { clockIn: "desc" },
      });

      if (data.action === "CLOCK_IN") {
        if (openClock) {
          await tx.timeClock.updateMany({
            where: openClockWhere,
            data: {
              clockOut: now,
              ...(data.notes ? { notes: data.notes } : {}),
            },
          });
        }

        return tx.timeClock.create({
          data: {
            tenantId: context.tenantId,
            employeeId: employee.id,
            branchId,
            clockIn: now,
            clockOut: null,
            source: data.source,
            notes: data.notes,
          },
          include: { employee: true, branch: true },
        });
      }

      if (!openClock) {
        throw new ApiError("No hay turno abierto para cerrar.", 400, "CLOCK_NOT_OPEN");
      }

      const closeResult = await tx.timeClock.updateMany({
        where: {
          id: openClock.id,
          tenantId: context.tenantId,
          employeeId: employee.id,
          clockOut: null,
        },
        data: {
          clockOut: now,
          ...(data.notes ? { notes: data.notes } : {}),
        },
      });

      if (closeResult.count === 0) {
        throw new ApiError("The open time clock was already closed.", 409, "CLOCK_ALREADY_CLOSED");
      }

      return tx.timeClock.findFirstOrThrow({
        where: { id: openClock.id, tenantId: context.tenantId, employeeId: employee.id },
        include: { employee: true, branch: true },
      });
    });

    return created(clock);
  } catch (error) {
    return fail(error);
  }
}
