import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModulePageTemplate } from "@/components/landing/module-page-template";
import { getModuleBySlug, modules } from "@/lib/modules";
import { isLocale, locales } from "@/lib/i18n";

type ModuleRouteParams = {
  locale: string;
  slug: string;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    modules.map((module) => ({
      locale,
      slug: module.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ModuleRouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const moduleItem = getModuleBySlug(slug);

  if (!moduleItem) {
    return {
      title: "Module not found | Gerpy ERP",
    };
  }

  return {
    title: `${moduleItem.label} | Gerpy ERP`,
    description: moduleItem.description,
  };
}

export default async function PublicModulePage({
  params,
}: {
  params: Promise<ModuleRouteParams>;
}) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const moduleItem = getModuleBySlug(slug);

  if (!moduleItem) {
    notFound();
  }

  return <ModulePageTemplate module={moduleItem} />;
}
