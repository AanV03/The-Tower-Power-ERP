import TeamsClient from "@/components/portal/teams-client";
import { getPortalSocial } from "@/lib/portal/service";

type PageProps = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

export default async function TeamsPage({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const social = await getPortalSocial(tenantSlug);

  return (
    <TeamsClient
      available={social.available}
      initialLeaderboard={social.leaderboard}
      initialTeams={social.teams}
      locale={locale}
      tenantSlug={tenantSlug}
    />
  );
}
