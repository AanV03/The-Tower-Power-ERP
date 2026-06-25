import { AttendanceSource } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { created, fail, ok } from "@/lib/api/response";

const AttendanceSchema = z.object({
  employeeId: z.string().min(1),
  action: z.enum(["clock-in", "clock-out"]),
  branchId: z.string().optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const data = AttendanceSchema.parse(await request.json());

    // 1. Verify employee exists and belongs to the tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        tenantId: context.tenantId,
      },
    });

    if (!employee) {
      return Response.json(
        { ok: false, error: "EMPLOYEE_NOT_FOUND", message: "Empleado no encontrado." },
        { status: 404 }
      );
    }

    const branchId = await resolveWritableBranchId(context, data.branchId || employee.branchId);

    if (data.action === "clock-in") {
      // Check if there is already an open session
      const openRecord = await prisma.attendanceRecord.findFirst({
        where: {
          tenantId: context.tenantId,
          employeeId: data.employeeId,
          clockOut: null,
        },
      });

      if (openRecord) {
        return Response.json(
          {
            ok: false,
            error: "ATTENDANCE_ALREADY_OPEN",
            message: "El colaborador ya cuenta con una entrada activa.",
          },
          { status: 400 }
        );
      }

      const record = await prisma.attendanceRecord.create({
        data: {
          tenantId: context.tenantId,
          employeeId: data.employeeId,
          branchId,
          clockIn: new Date(),
          source: AttendanceSource.MANUAL,
        },
        include: {
          employee: true,
          branch: true,
        },
      });

      return created(record);
    } else {
      // action === "clock-out"
      const openRecord = await prisma.attendanceRecord.findFirst({
        where: {
          tenantId: context.tenantId,
          employeeId: data.employeeId,
          clockOut: null,
        },
        orderBy: {
          clockIn: "desc",
        },
      });

      if (!openRecord) {
        return Response.json(
          {
            ok: false,
            error: "NO_OPEN_ATTENDANCE",
            message: "No se encontró ninguna entrada activa para cerrar.",
          },
          { status: 400 }
        );
      }

      const record = await prisma.attendanceRecord.update({
        where: {
          id: openRecord.id,
        },
        data: {
          clockOut: new Date(),
        },
        include: {
          employee: true,
          branch: true,
        },
      });

      return ok(record);
    }
  } catch (error) {
    return fail(error);
  }
}
