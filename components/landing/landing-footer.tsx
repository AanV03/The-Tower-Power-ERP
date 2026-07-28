import Link from "next/link";
import { Dumbbell, FileText, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/localized-routing";

const legalLinks = [
  { labelKey: "privacy", path: "legal/privacy" },
  { labelKey: "terms", path: "legal/terms" },
  { labelKey: "security", path: "legal/security" },
] as const;

const contactLinks = [
  { label: "hello@towerpower.example", href: "mailto:hello@towerpower.example", icon: Mail },
  { label: "+1 (555) 018-2046", href: "tel:+15550182046", icon: Phone },
  { label: "Austin, TX", href: "https://maps.example.com/tower_power", icon: MapPin },
];

export function LandingFooter({ locale = "es" }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <footer id="contact" className="relative border-t border-[color:var(--landing-border)] bg-[var(--landing-bg-deep)] text-[var(--landing-text)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center border border-[color:var(--landing-border)] bg-[var(--landing-primary)] text-white">
              <Dumbbell className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-black uppercase tracking-normal">The Tower Power</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                System logo
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-[var(--landing-copy)]">
            {dictionary.landing.footerDesc}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[var(--landing-accent-strong)]">
            Contact
          </h2>
          <ul className="mt-5 space-y-3">
            {contactLinks.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-copy)] transition-colors hover:text-[var(--landing-text)]"
                >
                  <Icon className="h-4 w-4 text-[var(--landing-muted)]" aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--landing-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-sm text-[var(--landing-muted)]">
            Copyright 2026 The Tower Power Systems, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((link, index) => (
              <Link
                key={link.path}
                href={localizedPath(locale, link.path)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--landing-copy)] transition-colors hover:text-[var(--landing-accent-strong)]"
              >
                {index === 0 ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FileText className="h-4 w-4" aria-hidden="true" />
                )}
                {dictionary.landing.legal[link.labelKey]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
