import { redirect } from "next/navigation";

import { localizedPath } from "@/lib/localized-routing";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localizedPath(locale, "onboarding/plans"));
}
