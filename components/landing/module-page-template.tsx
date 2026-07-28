import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ModuleScreenshot } from "@/components/landing/module-screenshot";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ModuleItem } from "@/lib/modules";

type ModulePageTemplateProps = {
  module: ModuleItem;
  locale: Locale;
};

export function ModulePageTemplate({ module, locale }: ModulePageTemplateProps) {
  const dictionary = getDictionary(locale);
  const pageCopy = dictionary.landing.modulePage;

  return (
    <main className="landing-palette min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <LandingNavbar locale={locale} />

      <section className="relative overflow-hidden border-b border-[color:var(--landing-border)] bg-[var(--landing-hero-bg)]">
        <div className="landing-dot-grid absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <Link
              href={`/${locale}` as Route}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--landing-accent-strong)] transition-colors hover:text-[var(--landing-text)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {pageCopy.back}
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

          <div className="mt-10 border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-2 shadow-2xl shadow-slate-950/10 dark:shadow-black/40 sm:p-3">
            <ModuleScreenshot module={module} expandLabel={pageCopy.expandScreenshot} closeLabel={pageCopy.closeScreenshot} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--landing-accent-strong)]">
            {pageCopy.featuresEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-5xl">
            {pageCopy.featuresTitle}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {module.features.map((feature) => (
            <article key={feature.title} className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-5">
              <Sparkles className="h-5 w-5 text-[var(--landing-accent-strong)]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black text-[var(--landing-text)]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-copy)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[color:var(--landing-border)] bg-[var(--landing-cta)] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em]">{pageCopy.bannerEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-none sm:text-5xl">
              {pageCopy.bannerTitle}
            </h2>
          </div>
        </div>
      </section>

      <LandingFooter locale={locale} />
    </main>
  );
}
