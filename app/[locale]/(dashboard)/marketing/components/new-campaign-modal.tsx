"use client";

import type { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { CampaignDraft, MarketingChannel, MarketingLabels, SelectOption } from "./types";

export function NewCampaignModal({
  isOpen,
  draft,
  labels,
  channelOptions,
  onDraftChange,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  draft: CampaignDraft;
  labels: MarketingLabels;
  channelOptions: SelectOption<MarketingChannel>[];
  onDraftChange: (draft: CampaignDraft) => void;
  onClose: () => void;
  onSubmit: (draft: CampaignDraft) => void;
}) {
  const updateDraft = (field: keyof CampaignDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.content.trim()) {
      toast.error(labels.formRequiredError);
      return;
    }

    onSubmit({
      ...draft,
      name: draft.name.trim(),
      segment: draft.segment.trim(),
      content: draft.content.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.modalTitle}</DialogTitle>
          <DialogDescription>{labels.modalDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="campaign-name" className="text-xs font-semibold text-foreground">
              {labels.modalFields.name} *
            </label>
            <Input
              id="campaign-name"
              value={draft.name}
              onChange={(event) => updateDraft("name", event.target.value)}
              placeholder={labels.modalFields.namePlaceholder}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="campaign-channel" className="text-xs font-semibold text-foreground">
                {labels.modalFields.channel}
              </label>
              <NativeSelect
                id="campaign-channel"
                value={draft.channel}
                onChange={(event) => updateDraft("channel", event.target.value as MarketingChannel)}
              >
                {channelOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="campaign-segment" className="text-xs font-semibold text-foreground">
                {labels.modalFields.segment}
              </label>
              <Input
                id="campaign-segment"
                value={draft.segment}
                onChange={(event) => updateDraft("segment", event.target.value)}
                placeholder={labels.modalFields.segmentPlaceholder}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="campaign-content" className="text-xs font-semibold text-foreground">
              {labels.modalFields.content} *
            </label>
            <textarea
              id="campaign-content"
              rows={4}
              value={draft.content}
              onChange={(event) => updateDraft("content", event.target.value)}
              placeholder={labels.modalFields.contentPlaceholder}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              required
            />
          </div>

          <DialogFooter className="border-t border-border/60 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {labels.modalActions.cancel}
            </Button>
            <Button type="submit">{labels.modalActions.submit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
