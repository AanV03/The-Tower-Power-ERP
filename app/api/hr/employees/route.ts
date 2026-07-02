import { BranchStatus, EmploymentContractType, Prisma } from "@prisma/client";
import { z } from "zod";

import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { normalizeEmail } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const CreateEmployeeSchema = z.object({
  branchId: z.string().optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().email().transform(normalizeEmail).optional(),
  ),
  phone: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().max(40).optional(),
  ),
  positionId: z.string().optional(),
  positionName: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(2).max(120).optional(),
  ),
  status: z.enum(BranchStatus).default(BranchStatus.ACTIVE),
  hireDate: z.string().datetime().optional(),
  contractType: z.enum(EmploymentContractType).optional(),
  salary: z.coerce.number().nonnegative().optional(),
  hourlyRate: z.coerce.number().nonnegative().optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", method: "GET" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      ...scopedBranchWhere(context, searchParams.get("branchId")),
      ...(searchParams.get("status") ? { status: searchParams.get("status") as BranchStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: { branch: true, position: true, user: true, contracts: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.employee.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr", method: "POST" });
    const data = CreateEmployeeSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const employee = await prisma.$transaction(async (tx) => {
      const positionId =
        data.positionId ??
        (data.positionName
          ? (
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
            ).id
          : undefined);

      const createdEmployee = await tx.employee.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          positionId,
          status: data.status,
          hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        },
      });

      if (data.contractType) {
        await tx.employeeContract.create({
          data: {
            tenantId: context.tenantId,
            employeeId: createdEmployee.id,
            type: data.contractType,
            salary: data.salary === undefined ? undefined : new Prisma.Decimal(data.salary),
            hourlyRate: data.hourlyRate === undefined ? undefined : new Prisma.Decimal(data.hourlyRate),
            startDate: data.hireDate ? new Date(data.hireDate) : new Date(),
          },
        });
      }

      return tx.employee.findFirstOrThrow({
        where: { id: createdEmployee.id, tenantId: context.tenantId },
        include: { branch: true, position: true, contracts: true },
      });
    });

    return created(employee);
  } catch (error) {
    return fail(error);
  }
}
