import { EmailValidationPlaceholder } from "@/components/auth/email-validation-placeholder";

export default async function LocaleEmailValidationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <EmailValidationPlaceholder locale={locale} />;
}
