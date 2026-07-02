"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function OnboardingNavButton({
  children,
  href,
  variant = "default",
  className,
}: {
  children: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => router.push(href as any)}
    >
      {children}
      <ArrowRight aria-hidden="true" />
    </Button>
  );
}
