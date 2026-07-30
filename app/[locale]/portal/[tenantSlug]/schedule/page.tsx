import ScheduleClient from "@/components/portal/schedule-client";
import { getPortalSchedule } from "@/lib/portal/service";

type PageProps = {
  params: Promise<{
    locale: string;
    tenantSlug: string;
  }>;
};

export default async function SchedulePage({ params }: PageProps) {
  const { locale, tenantSlug } = await params;
  const classes = await getPortalSchedule(tenantSlug);

  return (
    <ScheduleClient
      classes={classes}
      locale={locale}
      tenantSlug={tenantSlug}
    />
  );
}
