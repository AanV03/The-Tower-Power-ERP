import { BranchStatus, EmploymentContractType, Prisma } from "@prisma/client";
import { z } from "zod";

import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { normalizeEmail } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const UpdateEmployeeSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().email().transform(normalizeEmail).nullable().optional(),
  ),
  phone: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(40).nullable().optional(),
  ),
  positionName: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().min(2).max(120).nullable().optional(),
  ),
  status: z.enum(BranchStatus).optional(),
  contractType: z.enum(EmploymentContractType).optional(),
  salary: z.coerce.number().nonnegative().optional(),
  hourlyRate: z.coerce.number().nonnegative().optional(),
});

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const { employeeId } = await params;
    const data = UpdateEmployeeSchema.parse(await request.json());

    const employee = await prisma.$transaction(async (tx) => {
      const existing = await tx.employee.findFirst({
        where: {
          id: employeeId,
          tenantId: context.tenantId,
          ...(context.branchId ? { branchId: context.branchId } : {}),
        },
      });

      if (!existing) {
        throw new ApiError("Employee was not found in this tenant.", 404, "EMPLOYEE_NOT_FOUND");
      }

      const positionId =
        data.positionName === undefined
          ? undefined
          : data.positionName === null
            ? null
            : (
                await tx.position.upsert({
                  where: {
                    tenantId_name: {
                      tenantId: context.tenantId,
                      name: data.positionName,
                    },
                  },
                  create: {
                    tenantId: context.tenantId,
                    name: data.positionName,
                  },
                  update: {},
                })
              ).id;

      const updated = await tx.employee.update({
        where: { id: existing.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          positionId,
          status: data.status,
        },
      });

      if (data.contractType) {
        await tx.employeeContract.updateMany({
          where: {
            tenantId: context.tenantId,
            employeeId: existing.id,
            endDate: null,
          },
          data: { endDate: new Date() },
        });

        await tx.employeeContract.create({
          data: {
            tenantId: context.tenantId,
            employeeId: existing.id,
            type: data.contractType,
            salary: data.salary === undefined ? undefined : new Prisma.Decimal(data.salary),
            hourlyRate: data.hourlyRate === undefined ? undefined : new Prisma.Decimal(data.hourlyRate),
            startDate: new Date(),
          },
        });
      }

      return tx.employee.findUniqueOrThrow({
        where: { id: updated.id },
        include: { branch: true, position: true, contracts: true },
      });
    });

    return ok(employee);
  } catch (error) {
    return fail(error);
  }
}
