import { AccountType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { created, fail, ok } from "@/lib/api/response";

const CreateAccountSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(160),
  type: z.enum(AccountType),
  parentId: z.string().optional(),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "accounting", permission: "accounting.read" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("type") ? { type: searchParams.get("type") as AccountType } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.chartAccount.findMany({
        where,
        include: { parent: true, children: true },
        orderBy: { code: "asc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.chartAccount.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "accounting", permission: "accounting.account.write" });
    const data = CreateAccountSchema.parse(await request.json());

    const account = await prisma.chartAccount.create({
      data: {
        tenantId: context.tenantId,
        code: data.code,
        name: data.name,
        type: data.type,
        parentId: data.parentId,
      },
    });

    return created(account);
  } catch (error) {
    return fail(error);
  }
}
