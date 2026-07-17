import { requireApiContext } from "@/lib/api/context";
import { ApiError, fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ journalEntryId: string }> },
) {
  try {
    const context = await requireApiContext({ moduleId: "accounting", permission: "accounting.void" });
    const { journalEntryId } = await params;

    const result = await prisma.journalEntry.updateMany({
      where: {
        id: journalEntryId,
        tenantId: context.tenantId,
        status: "POSTED",
      },
      data: { status: "VOID" },
    });

    if (result.count === 0) {
      throw new ApiError("Only posted journal entries can be voided.", 409, "JOURNAL_ENTRY_NOT_POSTED");
    }

    const entry = await prisma.journalEntry.findFirstOrThrow({
      where: { id: journalEntryId, tenantId: context.tenantId },
      include: { lines: true },
    });

    return ok(entry);
  } catch (error) {
    return fail(error);
  }
}
