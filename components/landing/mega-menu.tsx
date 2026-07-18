"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ChevronDown, Layers3 } from "lucide-react";

import { useLandingRouteTransition } from "@/components/landing/landing-route-transition";
import { getMegaMenuSections } from "@/lib/modules";
import { getDictionary } from "@/lib/i18n";
import { normalizeLocale } from "@/lib/localized-routing";
import { cn } from "@/lib/utils";

type LandingMegaMenuProps = {
  locale?: string;
  mode: "desktop" | "mobile";
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 28,
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14 } },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24, staggerChildren: 0.035 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function moduleHref(locale: string, slug: string) {
  return `/${locale}/modules/${slug}` as Route;
}

export function LandingMegaMenu({ locale = "es", mode }: LandingMegaMenuProps) {
  const { startRouteTransition } = useLandingRouteTransition();
  const safeLocale = normalizeLocale(locale);
  const dictionary = getDictionary(safeLocale);
  const localizedSections = useMemo(
    () => getMegaMenuSections(safeLocale),
    [safeLocale],
  );
  const firstSectionTitle = localizedSections[0]?.title ?? "";
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string>(firstSectionTitle);

  useEffect(() => {
    setOpenSection(firstSectionTitle);
  }, [firstSectionTitle]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleRouteClick(event: MouseEvent<HTMLAnchorElement>, href: Route) {
    event.preventDefault();
    setIsOpen(false);
    startRouteTransition(href);
  }

  if (mode === "mobile") {
    return (
      <div ref={rootRef} className="relative lg:hidden">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="landing-mobile-module-menu"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] px-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--landing-copy)] transition-colors hover:border-[color:var(--landing-accent-strong)] hover:text-[var(--landing-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent-strong)]"
        >
          <Layers3 className="h-4 w-4" aria-hidden="true" />
          {dictionary.common.moduleMenu}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              id="landing-mobile-module-menu"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-2 top-[calc(3.75rem+0.75rem)] z-50 mx-auto max-h-[calc(100svh-5rem)] w-[calc(100vw-1rem)] max-w-xl overflow-y-auto border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-3 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:shadow-black/45 sm:inset-x-4 sm:w-[calc(100vw-2rem)]"
            >
              <div className="grid gap-2">
                {localizedSections.map((section) => {
                  const expanded = openSection === section.title;

                  return (
                    <div key={section.title} className="border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)]">
                      <button
                        type="button"
                        onClick={() => setOpenSection(expanded ? "" : section.title)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-xs font-black uppercase tracking-[0.18em] text-[var(--landing-text)]"
                      >
                        {section.title}
                        <ChevronDown className={cn("h-4 w-4 text-[var(--landing-accent-strong)] transition-transform", expanded && "rotate-180")} aria-hidden="true" />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-1 border-t border-[color:var(--landing-border)] p-2">
                              {section.items.map((item) => {
                                const href = moduleHref(safeLocale, item.slug);

                                return (
                                  <Link
                                    key={item.slug}
                                    href={href}
                                    onClick={(event) => handleRouteClick(event, href)}
                                    className="block px-3 py-2 text-sm font-bold text-[var(--landing-copy)] transition-colors hover:bg-[var(--landing-panel-hover)] hover:text-[var(--landing-accent-strong)]"
                                  >
                                    {item.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative hidden lg:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="landing-desktop-module-menu"
        className="group relative inline-flex min-h-10 min-w-32 items-center justify-center gap-2 border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] px-4 text-xs font-black uppercase tracking-[0.22em] text-[var(--landing-copy)] transition-colors hover:border-[color:var(--landing-accent-strong)] hover:bg-[var(--landing-panel-hover)] hover:text-[var(--landing-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent-strong)]"
      >
        {dictionary.landing.megaMenu.button}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
        <AnimatePresence>
          {isOpen ? (
            <motion.span
              layoutId="landing-nav-active-indicator"
              className="absolute inset-x-3 bottom-1 h-px bg-[var(--landing-accent-strong)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          ) : null}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id="landing-desktop-module-menu"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-2 top-[calc(3.75rem+0.75rem)] z-50 mx-auto max-h-[calc(100svh-5rem)] w-[calc(100vw-1rem)] max-w-6xl overflow-y-auto border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-4 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:shadow-black/50 xl:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-5 border-b border-[color:var(--landing-border)] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--landing-accent-strong)]">
                  {dictionary.landing.megaMenu.eyebrow}
                </p>
                <p className="mt-1 max-w-2xl text-sm text-[var(--landing-copy)]">
                  {dictionary.landing.megaMenu.description}
                </p>
              </div>
              <Layers3 className="h-6 w-6 shrink-0 text-[var(--landing-accent-strong)]" aria-hidden="true" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {localizedSections.map((section) => (
                <motion.div key={section.title} variants={columnVariants} className="min-w-0">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--landing-text)]">
                    {section.title}
                  </h3>
                  <div className="mt-2 h-px w-full bg-[var(--landing-border)]" />
                  <div className="mt-3 grid gap-1.5">
                    {section.items.map((item) => {
                      const href = moduleHref(safeLocale, item.slug);

                      return (
                        <motion.div key={item.slug} variants={itemVariants}>
                          <Link
                            href={href}
                            onClick={(event) => handleRouteClick(event, href)}
                            className="group/link block border border-transparent px-3 py-2.5 transition-colors hover:border-[color:var(--landing-border)] hover:bg-[var(--landing-panel-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent-strong)]"
                          >
                            <span className="block text-sm font-black text-[var(--landing-text)] group-hover/link:text-[var(--landing-accent-strong)]">
                              {item.label}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
