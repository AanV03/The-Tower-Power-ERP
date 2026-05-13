import { redirect } from "next/navigation";

import type { Locale } from "@/lib/i18n";

export default async function RhAliasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  redirect(`/${locale}/hr`);
}
