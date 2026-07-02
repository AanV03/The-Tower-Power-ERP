"use client";

import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DashboardButton() {
  const router = useRouter();

  return (
    <Button type="button" onClick={() => router.push("/dashboard")}>
      Ir al Dashboard
      <LayoutDashboard aria-hidden="true" />
    </Button>
  );
}
