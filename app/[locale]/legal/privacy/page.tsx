import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/landing/legal-page";
import { getDictionary, isLocale } from "@/lib/i18n";

type LegalPageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LegalPageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const document = getDictionary(locale).legal.privacy;
  return { title: `${document.title} | Gerpy ERP`, description: document.metadataDescription };
}

export default async function PrivacyPolicyPage({ params }: LegalPageParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const legal = getDictionary(locale).legal;
  return <LegalPage locale={locale} document={legal.privacy} lastUpdatedLabel={legal.common.lastUpdated} />;
}
