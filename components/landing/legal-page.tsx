import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import type { Locale } from "@/lib/i18n";

type LegalSection = {
  title: string;
  copy: string;
};

export type LegalDocument = {
  title: string;
  eyebrow: string;
  updatedAt: string;
  metadataDescription: string;
  intro: string;
  sections: readonly LegalSection[];
};

type LegalPageProps = {
  document: LegalDocument;
  lastUpdatedLabel: string;
  locale: Locale;
};

export function LegalPage({
  document,
  lastUpdatedLabel,
  locale,
}: LegalPageProps) {
  return (
    <main className="landing-palette min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <LandingNavbar locale={locale} />

      <section className="border-b border-[color:var(--landing-border)] bg-[var(--landing-hero-bg)]">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[var(--landing-accent-strong)]">
            {document.eyebrow}
          </p>
          <h1 className="mt-4 text-[clamp(3rem,10vw,6.5rem)] font-black uppercase leading-none tracking-normal">
            {document.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--landing-copy)] sm:text-lg">
            {document.intro}
          </p>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-[var(--landing-muted)]">
            {lastUpdatedLabel}: {document.updatedAt}
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {document.sections.map((section) => (
          <article
            key={section.title}
            className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-5 sm:p-6"
          >
            <h2 className="text-xl font-black uppercase tracking-normal text-[var(--landing-text)]">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--landing-copy)] sm:text-base">
              {section.copy}
            </p>
          </article>
        ))}
      </section>

      <LandingFooter locale={locale} />
    </main>
  );
}
