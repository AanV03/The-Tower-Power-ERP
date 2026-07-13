import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, ImageIcon, Sparkles } from "lucide-react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import type { Locale } from "@/lib/i18n";
import type { ModuleItem } from "@/lib/modules";

type ModulePageTemplateProps = {
  module: ModuleItem;
  locale: Locale;
};

export function ModulePageTemplate({ module, locale }: ModulePageTemplateProps) {
  return (
    <main className="landing-palette min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <LandingNavbar locale={locale} />

      <section className="relative overflow-hidden border-b border-[color:var(--landing-border)] bg-[var(--landing-hero-bg)]">
        <div className="landing-dot-grid absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div>
            <Link
              href={"/" as Route}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--landing-accent-strong)] transition-colors hover:text-[var(--landing-text)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.24em] text-[var(--landing-accent-strong)]">
              {module.category}
            </p>
            <h1 className="mt-4 text-[clamp(3rem,11vw,7rem)] font-black uppercase leading-none tracking-normal">
              {module.label}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--landing-copy)] sm:text-lg">
              {module.description}
            </p>
          </div>

          <div className="border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-4 shadow-2xl shadow-slate-950/10 dark:shadow-black/40">
            <div className="grid min-h-[24rem] place-items-center border border-dashed border-[color:var(--landing-border)] bg-[var(--landing-panel-muted)] p-6 text-center">
              <div>
                <div className="mx-auto grid size-14 place-items-center border border-[color:var(--landing-border)] bg-[var(--landing-icon-bg)] text-[var(--landing-accent-strong)]">
                  <ImageIcon className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="mt-5 text-sm font-black uppercase tracking-[0.18em]">
                  Screenshot preview coming soon
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--landing-copy)]">
                  This area is ready for product screenshots, workflow captures, or short module previews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--landing-accent-strong)]">
            Key features
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-5xl">
            What this module highlights
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {module.features.map((feature) => (
            <article key={feature} className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-5">
              <Sparkles className="h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black text-[var(--landing-text)]">{feature}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-copy)]">
                Public preview copy for this capability. Replace it with product screenshots or richer module details when ready.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[color:var(--landing-border)] bg-[var(--landing-cta)] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em]">Ready for the next step</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-none sm:text-5xl">
              Explore The Tower Power with your team
            </h2>
          </div>
          <Link
            href={"/register" as Route}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 bg-white px-5 text-xs font-black uppercase tracking-[0.16em] text-[var(--landing-cta)] transition-colors hover:bg-white/90"
          >
            Create account
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <LandingFooter locale={locale} />
    </main>
  );
}
