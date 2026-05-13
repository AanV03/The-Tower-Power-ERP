import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Locale } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <DashboardShell locale={locale as Locale}>{children}</DashboardShell>;
}
