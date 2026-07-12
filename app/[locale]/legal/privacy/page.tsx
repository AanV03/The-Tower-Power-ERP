import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/landing/legal-page";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Privacy Policy | Gerpy ERP",
  description: "Privacy practices for the Gerpy ERP public website and platform.",
};

export default async function PrivacyPolicyPage({
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
      title="Privacy Policy"
      updatedAt="July 11, 2026"
      intro="This Privacy Policy explains how Gerpy ERP handles information for visitors, account owners, gym teams, and operational users."
      sections={[
        {
          title: "Information we collect",
          copy: "We may collect account details, contact information, workspace configuration, billing records, support messages, and usage data needed to operate and improve the service.",
        },
        {
          title: "How we use information",
          copy: "We use information to provide the platform, secure accounts, support gym operations, process requests, communicate service updates, and improve product reliability.",
        },
        {
          title: "Sharing and processors",
          copy: "We do not sell personal information. We may share limited information with service providers that help with hosting, analytics, payments, security, and customer support.",
        },
        {
          title: "Retention",
          copy: "We keep information for as long as needed to provide the service, meet legal obligations, resolve disputes, and maintain accurate business records.",
        },
        {
          title: "Your choices",
          copy: "Account owners may request access, correction, export, or deletion of eligible information by contacting the Gerpy ERP team.",
        },
      ]}
    />
  );
}
