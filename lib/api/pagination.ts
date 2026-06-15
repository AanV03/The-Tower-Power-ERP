import { Prisma } from "@prisma/client";

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePagination(params: URLSearchParams): Pagination {
  const page = parsePositiveInt(params.get("page"), 1);
  const pageSize = Math.min(parsePositiveInt(params.get("pageSize"), 25), 100);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function formatCurrency(value: number | string | Prisma.Decimal | null | undefined, currency = "MXN") {
  const amount = value instanceof Prisma.Decimal ? value.toNumber() : Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
