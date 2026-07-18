"use client";

import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ModuleItem } from "@/lib/modules";

type Props = {
  module: Pick<ModuleItem, "label" | "imageSrc" | "imageAlt" | "imageWidth" | "imageHeight">;
  expandLabel: string;
  closeLabel: string;
};

export function ModuleScreenshot({ module, expandLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="group relative block w-full overflow-hidden bg-[var(--landing-panel-muted)] text-left" aria-label={expandLabel}>
        <Image src={module.imageSrc} alt={module.imageAlt} width={module.imageWidth} height={module.imageHeight} sizes="(min-width: 1280px) 1280px, 100vw" className="h-auto w-full" priority />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 bg-[var(--landing-primary)] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg"><Maximize2 className="h-4 w-4" />{expandLabel}</span>
      </button>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label={module.label} className="fixed inset-0 z-[200] grid place-items-center bg-black/90 p-3 sm:p-6">
          <button type="button" onClick={() => setOpen(false)} className="absolute inset-0 cursor-default" aria-label={closeLabel} />
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 bg-white px-3 py-2 text-xs font-black uppercase text-slate-950"><X className="h-4 w-4" />{closeLabel}</button>
          <Image src={module.imageSrc} alt={module.imageAlt} width={module.imageWidth} height={module.imageHeight} sizes="100vw" className="relative max-h-[calc(100svh-6rem)] w-auto max-w-full object-contain" priority />
        </div>
      ) : null}
    </>
  );
}
