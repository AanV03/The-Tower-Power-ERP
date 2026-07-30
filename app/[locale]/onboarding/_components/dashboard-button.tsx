"use client";

import { LayoutDashboard } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { localizedPath } from "@/lib/localized-routing";

export function DashboardButton() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  return (
    <Button
      type="button"
      onClick={() => router.push(localizedPath(locale, "dashboard"))}
    >
      Ir al Dashboard
      <LayoutDashboard aria-hidden="true" />
    </Button>
  );
}
