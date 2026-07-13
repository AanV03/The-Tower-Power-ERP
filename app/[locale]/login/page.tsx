import { notFound } from "next/navigation";

import LoginPage from "@/app/login/page";
import { isLocale } from "@/lib/i18n";

export default async function LocaleLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LoginPage />;
}
