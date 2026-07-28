import { redirect } from "next/navigation";

import { AdminPanelClient } from "./components/admin-panel-client";
import { requireAdminContext } from "@/lib/api/context";
import { ApiError } from "@/lib/api/response";
import type { Locale } from "@/lib/i18n";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  let isAuthorized = true;

  try {
    await requireAdminContext();
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      isAuthorized = false;
    } else {
      throw error;
    }
  }

  if (!isAuthorized) {
    redirect(`/${l}/dashboard?error=forbidden`);
  }

  return <AdminPanelClient locale={l} />;
}
