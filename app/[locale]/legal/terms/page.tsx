import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/landing/legal-page";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Terms of Service | Gerpy ERP",
  description: "Standard service terms for using the Gerpy ERP platform.",
};

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <LegalPage
      locale={locale as Locale}
      eyebrow="// LEGAL"
      title="Terms of Service"
      updatedAt="July 11, 2026"
      intro="These Terms of Service describe the baseline rules for accessing and using Gerpy ERP websites, applications, and platform services."
      sections={[
        {
          title: "Use of the service",
          copy: "You are responsible for using Gerpy ERP lawfully, maintaining accurate account information, and ensuring that authorized users follow these terms.",
        },
        {
          title: "Accounts and access",
          copy: "Account owners control user invitations, roles, branch access, and workspace settings. You are responsible for protecting credentials and reporting unauthorized access.",
        },
        {
          title: "Customer data",
          copy: "You retain ownership of your customer data. Gerpy ERP processes customer data to provide the service, support requested workflows, and maintain platform security.",
        },
        {
          title: "Payments and plans",
          copy: "Paid plans, billing cycles, renewal terms, taxes, and cancellation rules are presented during purchase or in an applicable order form.",
        },
        {
          title: "Service changes",
          copy: "We may update features, improve workflows, or change these terms over time. Material changes will be communicated through reasonable service channels.",
        },
      ]}
    />
  );
}
