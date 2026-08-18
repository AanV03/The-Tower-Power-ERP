import { AttendanceSource } from "@prisma/client";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { withTenantTransaction } from "@/lib/db/prisma";

const AttendanceSchema = z.object({
  employeeId: z.string().min(1),
  action: z.enum(["clock-in", "clock-out"]),
  branchId: z.string().optional(),
});

export const runtime = "nodejs";

async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(
      "Request body must be valid JSON.",
      400,
      "INVALID_JSON",
    );
  }
}

function handleAttendanceError(error: unknown) {
  console.error("[HR_ATTENDANCE_POST_ERROR]", error);

  if (error instanceof ApiError || error instanceof ZodError) {
    return fail(error);
  }

  const message =
    error instanceof Error && error.message
      ? error.message
      : "Error interno";

  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", permission: "hr.attendance.write" });
    const data = AttendanceSchema.parse(await parseJsonBody(request));

    const record = await withTenantTransaction(
      context.tenantId,
      async (tx) => {
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtext(${`${context.tenantId}:${data.employeeId}:attendance`})
          )
        `;

        const employee = await tx.employee.findFirst({
          where: {
            id: data.employeeId,
            tenantId: context.tenantId,
          },
        });

        if (!employee) {
          throw new ApiError(
            "Empleado no encontrado.",
            404,
            "EMPLOYEE_NOT_FOUND",
          );
        }

        const branchId = await resolveWritableBranchId(
          context,
          data.branchId ?? employee.branchId,
        );
        if (branchId !== employee.branchId) {
          throw new ApiError(
            "The selected branch does not match the employee branch.",
            400,
            "EMPLOYEE_BRANCH_MISMATCH",
          );
        }

        const openRecord = await tx.attendanceRecord.findFirst({
          where: {
            tenantId: context.tenantId,
            employeeId: data.employeeId,
            clockOut: null,
          },
          orderBy: { clockIn: "desc" },
        });

        if (data.action === "clock-in") {
          if (openRecord) {
            throw new ApiError(
              "El colaborador ya cuenta con una entrada activa.",
              409,
              "ATTENDANCE_ALREADY_OPEN",
            );
          }

          return tx.attendanceRecord.create({
            data: {
              tenantId: context.tenantId,
              employeeId: data.employeeId,
              branchId,
              clockIn: new Date(),
              source: AttendanceSource.MANUAL,
            },
            include: { employee: true, branch: true },
          });
        }

        if (!openRecord) {
          throw new ApiError(
            "No se encontró ninguna entrada activa para cerrar.",
            400,
            "NO_OPEN_ATTENDANCE",
          );
        }

        const updated = await tx.attendanceRecord.updateMany({
          where: {
            id: openRecord.id,
            tenantId: context.tenantId,
            employeeId: data.employeeId,
            clockOut: null,
          },
          data: { clockOut: new Date() },
        });

        if (updated.count === 0) {
          throw new ApiError(
            "The open attendance record was already closed.",
            409,
            "ATTENDANCE_ALREADY_CLOSED",
          );
        }

        return tx.attendanceRecord.findFirstOrThrow({
          where: {
            id: openRecord.id,
            tenantId: context.tenantId,
            employeeId: data.employeeId,
          },
          include: { employee: true, branch: true },
        });
      },
    );

    return data.action === "clock-in" ? created(record) : ok(record);
  } catch (error) {
    return handleAttendanceError(error);
  }
}
