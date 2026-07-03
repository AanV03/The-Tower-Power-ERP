"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function OnboardingNavButton({
  children,
  href,
  variant = "default",
  className,
  direction = "right",
}: {
  children: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  direction?: "left" | "right";
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => router.push(href as any)}
    >
      {direction === "left" && <ArrowLeft aria-hidden="true" />}

      {children}

      {direction === "right" && <ArrowRight aria-hidden="true" />}
    </Button>
  );
}