import { JournalEntryStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import { parsePagination } from "@/lib/api/pagination";
import { ApiError, created, fail, ok } from "@/lib/api/response";
import { isBalancedJournal } from "@/lib/accounting/payroll-posting";
import { assertTenantReferenceIds } from "@/lib/api/tenant-reference";

const JournalLineSchema = z.object({
  accountId: z.string(),
  debit: z.coerce.number().nonnegative().default(0),
  credit: z.coerce.number().nonnegative().default(0),
});

const CreateJournalEntrySchema = z.object({
  sourceType: z.string().trim().min(1).max(80),
  sourceId: z.string().trim().min(1).max(120),
  entryDate: z.string().datetime(),
  description: z.string().trim().max(240).optional(),
  status: z.enum(JournalEntryStatus).default(JournalEntryStatus.DRAFT),
  lines: z.array(JournalLineSchema).min(2),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireApiContext({ moduleId: "accounting", permission: "accounting.read" });
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const where = {
      tenantId: context.tenantId,
      ...(searchParams.get("status") ? { status: searchParams.get("status") as JournalEntryStatus } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: { lines: { include: { account: true } } },
        orderBy: { entryDate: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return ok({ items, total, pagination });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = CreateJournalEntrySchema.parse(await request.json());
    const context = await requireApiContext({
      moduleId: "accounting",
      permission: data.status === "POSTED" ? "accounting.post" : "accounting.journal.write",
    });

    if (data.sourceType.toUpperCase() === "PAYROLL") {
      throw new ApiError(
        "PAYROLL journal entries must be created by the payroll payment workflow.",
        409,
        "RESERVED_JOURNAL_SOURCE",
      );
    }

    if (!isBalancedJournal(data.lines)) {
      throw new ApiError("Journal entry must be balanced before it can be saved.", 400, "JOURNAL_NOT_BALANCED");
    }

    const entry = await prisma.$transaction(async (tx) => {
      await assertTenantReferenceIds(
        "Chart account",
        data.lines.map((line) => line.accountId),
        (ids) =>
          tx.chartAccount.findMany({
            where: { tenantId: context.tenantId, id: { in: ids } },
            select: { id: true },
          }),
      );

      return tx.journalEntry.create({
        data: {
          tenantId: context.tenantId,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          entryDate: new Date(data.entryDate),
          description: data.description,
          status: data.status,
          lines: {
            create: data.lines.map((line) => ({
              tenantId: context.tenantId,
              accountId: line.accountId,
              debit: new Prisma.Decimal(line.debit),
              credit: new Prisma.Decimal(line.credit),
            })),
          },
        },
        include: { lines: true },
      });
    });

    return created(entry);
  } catch (error) {
    return fail(error);
  }
}
