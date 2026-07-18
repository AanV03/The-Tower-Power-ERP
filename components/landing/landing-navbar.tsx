"use client";

import Link from "next/link";
import type { Route } from "next";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Dumbbell } from "lucide-react";
import { LandingMegaMenu } from "@/components/landing/mega-menu";
import { MobilePublicMenu } from "@/components/landing/mobile-public-menu";
import { useLandingRouteTransition } from "@/components/landing/landing-route-transition";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedHome, localizedPath } from "@/lib/localized-routing";

export function LandingNavbar({ locale = "es" }: { locale?: Locale }) {
  const { startRouteTransition } = useLandingRouteTransition();
  const dictionary = getDictionary(locale);
  const registerHref = localizedPath(locale, "register");
  const navLinks = [
    { label: dictionary.landing.navbar.operations, href: localizedPath(locale, "operations") },
    { label: dictionary.landing.navbar.contact, href: localizedPath(locale, "contact") },
  ];

  const handleRouteClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: Route
  ) => {
    event.preventDefault();
    startRouteTransition(href);
  };

  return (
    <header className="relative z-50 border-b border-[color:var(--landing-border)] bg-[var(--landing-bg)]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-px w-[78vw] max-w-6xl origin-center -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--landing-accent-strong)] to-transparent shadow-[0_0_18px_rgba(45,212,191,0.45)] sm:w-[82vw] lg:w-[86vw]"
        animate={{ opacity: [0.22, 0.82, 0.22], scaleX: [0.92, 1, 0.92] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-3px] z-10 size-1.5 -translate-x-1/2 rounded-full bg-[var(--landing-accent-strong)] shadow-[0_0_16px_rgba(45,212,191,0.65)]"
        animate={{ opacity: [0.35, 0.95, 0.35], scale: [0.85, 1.25, 0.85] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <nav
        aria-label="Main navigation"
        className="grid w-full grid-cols-[1fr_auto] items-stretch lg:grid-cols-[minmax(260px,0.9fr)_auto_minmax(260px,0.9fr)]"
      >
        <Link
          href={localizedHome(locale)}
          className="group inline-flex min-w-0 items-center gap-3  px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent-strong)] sm:px-6 lg:px-8"
          aria-label="The Tower Power home"
        >
          <span className="grid size-9 shrink-0 place-items-center bg-[var(--landing-primary)] text-white">
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-black uppercase tracking-normal text-[var(--landing-text)] sm:text-sm">
              The Tower Power
            </span>
            <span
              className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--landing-muted)] sm:block"
            >
              Gym operating system
            </span>
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-3 px-6 lg:flex xl:gap-4 xl:px-12">
          <LandingMegaMenu locale={locale} mode="desktop" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) => handleRouteClick(event, link.href)}
              className="group relative inline-flex min-h-10 min-w-32 items-center justify-center border border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] px-4 text-xs font-black uppercase tracking-[0.22em] text-[var(--landing-copy)] transition-colors hover:border-[color:var(--landing-accent-strong)] hover:bg-[var(--landing-panel-hover)] hover:text-[var(--landing-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent-strong)]"
            >
              <span
                aria-hidden="true"
                className="absolute -left-px -top-px size-2 border-l border-t border-[color:var(--landing-accent-strong)]/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute -right-px -top-px size-2 border-r border-t border-[color:var(--landing-accent-strong)]/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -left-px size-2 border-b border-l border-[color:var(--landing-accent-strong)]/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px size-2 border-b border-r border-[color:var(--landing-accent-strong)]/60 opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-[var(--landing-accent-strong)] transition-transform group-hover:scale-x-100"
              />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 lg:px-8">
          <ThemeToggle locale={locale} appearance="landing" />
          <LocaleSwitcher locale={locale} inHeader={true} />
          <LandingMegaMenu locale={locale} mode="mobile" />
          <MobilePublicMenu locale={locale} />
          <Link
            href={registerHref}
            onClick={(event) => handleRouteClick(event, registerHref)}
            className="inline-flex min-h-10 items-center justify-center gap-2 bg-[var(--landing-primary)] px-4 text-xs font-black uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[var(--landing-primary-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-accent-strong)] sm:px-5 lg:min-h-11 lg:px-7"
          >
            <span className="hidden sm:inline">{dictionary.landing.navbar.startSetup}</span>
            <span className="sm:hidden">{dictionary.landing.navbar.start}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
