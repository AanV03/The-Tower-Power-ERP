import { notFound } from "next/navigation";

import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function LocalePasswordRecoveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <PasswordRecoveryForm locale={locale as Locale} />;
}
