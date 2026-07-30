import { ApiError } from "@/lib/api/response";

type TenantRecord = {
  id: string;
};

export async function assertTenantReferenceIds(
  entity: string,
  values: Array<string | null | undefined>,
  load: (ids: string[]) => Promise<TenantRecord[]>,
) {
  const ids = Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );

  if (ids.length === 0) return;

  const records = await load(ids);
  const foundIds = new Set(records.map((record) => record.id));
  if (ids.some((id) => !foundIds.has(id))) {
    throw new ApiError(
      `${entity} reference is invalid for the authenticated tenant.`,
      400,
      "TENANT_REFERENCE_INVALID",
    );
  }
}
