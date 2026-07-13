import { notFound } from "next/navigation";

import { EmailValidationPlaceholder } from "@/components/auth/email-validation-placeholder";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function LocaleEmailValidationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <EmailValidationPlaceholder locale={locale as Locale} />;
}
