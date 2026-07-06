import type { ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Dumbbell,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function OnboardingLayout({
  currentStep,
  children,
}: {
  currentStep: number;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,133,0,0.16),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(0,188,125,0.14),transparent_22rem),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        {children}
      </div>
    </main>
  );
}

export function OnboardingPanel({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <Card className="overflow-hidden border-white/10 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur">
        <div className="h-1 bg-[linear-gradient(90deg,var(--brand-orange),var(--brand-green))]" />
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Paso guiado
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
          </div>
          {children}
        </CardContent>
      </Card>

      {aside ? (
        <aside className="lg:sticky lg:top-8">{aside}</aside>
      ) : null}
    </section>
  );
}
