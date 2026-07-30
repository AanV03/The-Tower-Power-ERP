import WorkoutsClient from "@/components/portal/workouts-client";
import { getPortalWorkouts } from "@/lib/portal/service";

type PageProps = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

export default async function WorkoutsPage({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const workouts = await getPortalWorkouts(tenantSlug);

  return (
    <WorkoutsClient
      locale={locale}
      tenantSlug={tenantSlug}
      workouts={workouts}
    />
  );
}
