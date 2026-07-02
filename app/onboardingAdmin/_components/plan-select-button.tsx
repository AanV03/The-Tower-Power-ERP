"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PlanSelectButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      className="w-full"
      onClick={() => router.push("/onboardingAdmin/finish" as any)}
    >
      Seleccionar
    </Button>
  );
}
