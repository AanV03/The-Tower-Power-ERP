import { notFound } from "next/navigation";

import RegisterPage from "@/app/register/page";
import { isLocale } from "@/lib/i18n";

export default async function LocaleRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <RegisterPage />;
}
