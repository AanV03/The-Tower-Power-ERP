import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OperationsPage } from "@/components/landing/operations-page";
import { getDictionary, isLocale } from "@/lib/i18n";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const copy = getDictionary(locale).landing.operationsPage; return { title: copy.metadataTitle, description: copy.metadataDescription }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <OperationsPage locale={locale} />; }
