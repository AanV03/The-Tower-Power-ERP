"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { X } from "lucide-react";
import { toast } from "sonner";

export function NewCampaignModal({
  isOpen,
  onClose,
  initialSegment = "",
  translations,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialSegment?: string;
  translations: {
    title: string;
    subtitle: string;
    fields: {
      name: string;
      namePlaceholder: string;
      channel: string;
      segment: string;
      content: string;
      contentPlaceholder: string;
    };
    actions: {
      cancel: string;
      submit: string;
    };
    success: string;
  };
}) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("email");
  const [segment, setSegment] = useState(initialSegment);
  const [content, setContent] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sync initial segment from props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSegment(initialSegment);
      // Reset other states
      setName("");
      setContent("");
      // Focus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialSegment]);

  // Trap focus and handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }
    toast.success(translations.success);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-xl border border-foreground/10 bg-card p-6 shadow-lg relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-all"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <h2 id="campaign-modal-title" className="text-xl font-semibold text-foreground">
            {translations.title}
          </h2>
          <p className="text-xs text-muted-foreground">{translations.subtitle}</p>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="campaign-name" className="text-xs font-semibold text-foreground">
              {translations.fields.name} *
            </label>
            <Input
              id="campaign-name"
              ref={firstInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={translations.fields.namePlaceholder}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="campaign-channel" className="text-xs font-semibold text-foreground">
                {translations.fields.channel}
              </label>
              <NativeSelect
                id="campaign-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full"
              >
                <NativeSelectOption value="email">Email</NativeSelectOption>
                <NativeSelectOption value="sms">SMS</NativeSelectOption>
                <NativeSelectOption value="social">Social Media</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="campaign-segment" className="text-xs font-semibold text-foreground">
                {translations.fields.segment}
              </label>
              <Input
                id="campaign-segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Todos los usuarios"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="campaign-content" className="text-xs font-semibold text-foreground">
              {translations.fields.content} *
            </label>
            <textarea
              id="campaign-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={translations.fields.contentPlaceholder}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-foreground/5">
            <Button type="button" variant="outline" onClick={onClose}>
              {translations.actions.cancel}
            </Button>
            <Button type="submit">{translations.actions.submit}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
