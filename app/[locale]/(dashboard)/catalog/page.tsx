import { prisma } from "@/lib/db/prisma";
import { requireApiContext } from "@/lib/api/context";
import type { Locale } from "@/lib/i18n";
import { CatalogClient } from "@/components/catalog/catalog-client";

export const runtime = "nodejs";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "catalog" });
  const tenantId = context.tenantId;

  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: { tenantId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productCategory.findMany({
      where: { tenantId },
      include: { parent: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const products = dbProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.category?.name || "Sin categoría",
    price: Number(p.price.toString()),
    cost: Number(p.cost.toString()),
    taxRate: Number(p.taxRate.toString()),
    imageUrl: p.imageUrl,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));

  const categories = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentId,
    parentName: c.parent?.name || "",
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <CatalogClient
      initialProducts={products}
      initialCategories={categories}
      locale={locale as Locale}
    />
  );
}
