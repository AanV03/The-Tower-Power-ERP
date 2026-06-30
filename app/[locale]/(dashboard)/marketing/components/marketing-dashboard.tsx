"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  LayoutDashboard,
  Megaphone,
  Users,
  Workflow,
} from "lucide-react";
import { ConversionFunnel } from "./conversion-funnel";
import { CampaignsGrid } from "./campaigns-grid";
import { AudienceSegments } from "./audience-segments";
import { AutomationFlow } from "./automation-flow";
import { NewCampaignModal } from "./new-campaign-modal";
import { CampaignPerformanceChart } from "./campaign-performance-chart";
import { ChurnInterventionsPanel } from "./churn-interventions-panel";

type MarketingDashboardProps = {
  locale: Locale;
  metrics: {
    label: string;
    value: string;
    change: string;
    tone: "default" | "success" | "warning" | "danger";
  }[];
  title: string;
  subtitle: string;
  primaryActionLabel: string;
  translations: any;
};

export function MarketingDashboard({
  locale,
  metrics,
  title,
  subtitle,
  primaryActionLabel,
  translations,
}: MarketingDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("");

  const handleOpenModal = (segmentName = "") => {
    setSelectedSegment(segmentName);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Megaphone className="size-7 text-primary" aria-hidden="true" />
            {title}
          </h1>
          <Button onClick={() => handleOpenModal("")} className={cn(headerPrimaryActionClass, "h-9 gap-1")}>
            <Plus className="w-4 h-4" />
            <span>{primaryActionLabel}</span>
          </Button>
        </div>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* KPI Cards — visible en todas las pestañas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            tone={metric.tone}
            locale={locale}
          />
        ))}
      </div>

      {/* Tabs con las secciones del módulo */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 !h-auto sm:!h-10 bg-muted/60 p-1 rounded-lg border gap-1 sm:gap-0">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer">
            <LayoutDashboard className="size-4 shrink-0" />
            <span>Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer">
            <Megaphone className="size-4 shrink-0" />
            <span>Campañas</span>
          </TabsTrigger>
          <TabsTrigger value="audiences" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer">
            <Users className="size-4 shrink-0" />
            <span>Audiencias</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer">
            <Workflow className="size-4 shrink-0" />
            <span>Automatización</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1 — Resumen: Performance chart + Funnel */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <CampaignPerformanceChart />
          <ConversionFunnel translations={translations.funnel} />
        </TabsContent>

        {/* TAB 2 — Campañas: Grid de campañas */}
        <TabsContent value="campaigns" className="mt-0">
          <CampaignsGrid translations={translations.campaigns} />
        </TabsContent>

        {/* TAB 3 — Audiencias: Churn + Segmentos */}
        <TabsContent value="audiences" className="space-y-6 mt-0">
          <ChurnInterventionsPanel />
          <AudienceSegments
            translations={translations.segments}
            onSendToSegment={handleOpenModal}
          />
        </TabsContent>

        {/* TAB 4 — Automatización: Flujo de automatización */}
        <TabsContent value="automation" className="mt-0 flex justify-center">
          <div className="w-full max-w-lg">
            <AutomationFlow translations={translations.automations} />
          </div>
        </TabsContent>
      </Tabs>

      {/* New Campaign Modal */}
      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSegment={selectedSegment}
        translations={translations.modal}
      />
    </div>
  );
}
