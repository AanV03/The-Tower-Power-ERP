"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ConversionFunnel } from "./conversion-funnel";
import { CampaignsGrid } from "./campaigns-grid";
import { AudienceSegments } from "./audience-segments";
import { AutomationFlow } from "./automation-flow";
import { NewCampaignModal } from "./new-campaign-modal";

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
  translations: any; // Entire marketing translation namespace
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
      {/* Header section */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            {title}
          </h1>
          <Button onClick={() => handleOpenModal("")} className="h-9 gap-1">
            <Plus className="w-4 h-4" />
            <span>{primaryActionLabel}</span>
          </Button>
        </div>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* Metrics Grid */}
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

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Left Column: Funnel and Campaigns */}
        <div className="space-y-6 flex flex-col">
          <ConversionFunnel translations={translations.funnel} />
          <CampaignsGrid translations={translations.campaigns} />
        </div>

        {/* Right Column: Segments and Automation Flows */}
        <div className="space-y-6 flex flex-col">
          <AudienceSegments
            translations={translations.segments}
            onSendToSegment={handleOpenModal}
          />
          <AutomationFlow translations={translations.automations} />
        </div>
      </div>

      {/* New Campaign Modal Dialog */}
      <NewCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSegment={selectedSegment}
        translations={translations.modal}
      />
    </div>
  );
}
