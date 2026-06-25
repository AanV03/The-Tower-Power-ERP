import { BranchStatus, EmploymentContractType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveWritableBranchId, scopedBranchWhere } from "@/lib/api/branch";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";
import { normalizeEmail } from "@/lib/auth/password";

const CreateEmployeeSchema = z.object({
  branchId: z.string().optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email().transform(normalizeEmail).or(z.literal("")).optional(),
  phone: z.string().trim().max(40).optional(),
  positionName: z.string().trim().optional(),
  contractType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  hireDate: z.string().datetime().optional(),
});

const UpdateEmployeeSchema = z.object({
  id: z.string().min(1),
  branchId: z.string().optional(),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: z.string().email().transform(normalizeEmail).or(z.literal("")).optional(),
  phone: z.string().trim().max(40).optional(),
  positionName: z.string().trim().optional(),
  contractType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  hireDate: z.string().datetime().optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
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
    const context = await requireApiContext({ moduleId: "hr" });
    const data = CreateEmployeeSchema.parse(await request.json());
    const branchId = await resolveWritableBranchId(context, data.branchId);

    const employee = await prisma.$transaction(async (tx) => {
      // 1. Resolve or create position if name provided
      let positionId: string | undefined = undefined;
      if (data.positionName) {
        const normalized = data.positionName.trim();
        let position = await tx.position.findFirst({
          where: {
            tenantId: context.tenantId,
            name: { equals: normalized, mode: "insensitive" },
          },
        });
        if (!position) {
          position = await tx.position.create({
            data: {
              tenantId: context.tenantId,
              name: normalized,
            },
          });
        }
        positionId = position.id;
      }

      // 2. Create employee
      const emp = await tx.employee.create({
        data: {
          tenantId: context.tenantId,
          branchId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone || null,
          positionId,
          status: data.status as BranchStatus,
          hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        },
      });

      // 3. Create initial contract if contractType provided
      if (data.contractType) {
        await tx.employeeContract.create({
          data: {
            tenantId: context.tenantId,
            employeeId: emp.id,
            type: data.contractType as EmploymentContractType,
            startDate: new Date(),
          },
        });
      }

      return emp;
    });

    return created(employee);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "hr" });
    const data = UpdateEmployeeSchema.parse(await request.json());

    const employee = await prisma.$transaction(async (tx) => {
      // Check if employee exists
      const existing = await tx.employee.findFirst({
        where: { id: data.id, tenantId: context.tenantId },
        include: { contracts: { orderBy: { startDate: "desc" } } },
      });

      if (!existing) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      // 1. Resolve or update position
      let positionId: string | null | undefined = undefined;
      if (data.positionName !== undefined) {
        if (data.positionName === "") {
          positionId = null;
        } else {
          const normalized = data.positionName.trim();
          let position = await tx.position.findFirst({
            where: {
              tenantId: context.tenantId,
              name: { equals: normalized, mode: "insensitive" },
            },
          });
          if (!position) {
            position = await tx.position.create({
              data: {
                tenantId: context.tenantId,
                name: normalized,
              },
            });
          }
          positionId = position.id;
        }
      }

      // 2. Update employee
      const updated = await tx.employee.update({
        where: { id: data.id },
        data: {
          firstName: data.firstName !== undefined ? data.firstName : undefined,
          lastName: data.lastName !== undefined ? data.lastName : undefined,
          email: data.email !== undefined ? (data.email || null) : undefined,
          phone: data.phone !== undefined ? (data.phone || null) : undefined,
          status: data.status !== undefined ? (data.status as BranchStatus) : undefined,
          hireDate: data.hireDate !== undefined ? (data.hireDate ? new Date(data.hireDate) : null) : undefined,
          positionId: positionId !== undefined ? positionId : undefined,
          branchId: data.branchId !== undefined ? await resolveWritableBranchId(context, data.branchId) : undefined,
        },
      });

      // 3. Update contract if contractType provided
      if (data.contractType !== undefined) {
        const activeContract = existing.contracts.find(c => c.endDate === null || c.endDate > new Date());
        if (!activeContract || activeContract.type !== data.contractType) {
          // Deactivate old contracts
          await tx.employeeContract.updateMany({
            where: { employeeId: data.id, tenantId: context.tenantId, endDate: null },
            data: { endDate: new Date() },
          });

          // Create new contract
          await tx.employeeContract.create({
            data: {
              tenantId: context.tenantId,
              employeeId: data.id,
              type: data.contractType as EmploymentContractType,
              startDate: new Date(),
            },
          });
        }
      }

      return updated;
    });

    return ok(employee);
  } catch (error) {
    if (error instanceof Error && error.message === "EMPLOYEE_NOT_FOUND") {
      return Response.json(
        { ok: false, error: "EMPLOYEE_NOT_FOUND", message: "Empleado no encontrado." },
        { status: 404 }
      );
    }
    return fail(error);
  }
}
