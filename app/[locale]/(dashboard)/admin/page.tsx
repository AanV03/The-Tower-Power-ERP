import { AdminPanelClient } from "./components/admin-panel-client";
import type { Locale } from "@/lib/i18n";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;

  return <AdminPanelClient locale={l} />;
}
