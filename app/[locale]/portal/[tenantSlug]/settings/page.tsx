import SettingsClient from "@/components/portal/settings-client";
import { getPortalSettings } from "@/lib/portal/service";

type PageProps = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

export default async function SettingsPage({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const settings = await getPortalSettings(tenantSlug);

  return (
    <SettingsClient
      initialSettings={settings}
      locale={locale}
      tenantSlug={tenantSlug}
    />
  );
}
