"use client";

import Link from "next/link";
import type { Route } from "next";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useLandingRouteTransition } from "./landing-route-transition";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/localized-routing";

export function MobilePublicMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { startRouteTransition } = useLandingRouteTransition();
  const dictionary = getDictionary(locale);
  const links = [
    { label: dictionary.landing.navbar.operations, href: localizedPath(locale, "operations") },
    { label: dictionary.landing.navbar.contact, href: localizedPath(locale, "contact") },
  ];

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const go = (event: MouseEvent<HTMLAnchorElement>, href: Route) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(false);
    startRouteTransition(href);
  };

  return <div ref={rootRef} className="relative lg:hidden"><button ref={triggerRef} type="button" aria-expanded={open} aria-controls="mobile-public-navigation" aria-label={dictionary.common.primaryNavigation} onClick={() => setOpen(!open)} className="grid size-10 place-items-center border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)]">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>{open ? <nav id="mobile-public-navigation" aria-label={dictionary.common.primaryNavigation} className="absolute right-0 top-12 z-50 grid min-w-48 gap-1 border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-2 shadow-xl">{links.map((link) => <Link key={link.label} href={link.href} onClick={(event) => go(event, link.href)} className="px-3 py-3 text-sm font-black uppercase text-[var(--landing-copy)] hover:bg-[var(--landing-panel-hover)]">{link.label}</Link>)}</nav> : null}</div>;
}
