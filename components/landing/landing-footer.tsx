import Link from "next/link";
import type { Route } from "next";
import { Dumbbell, FileText, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const productLinks = [
  { label: "Dashboard", href: "/en/dashboard" as Route },
  { label: "Memberships", href: "/en/memberships" as Route },
  { label: "Inventory", href: "/en/inventory" as Route },
  { label: "Analytics", href: "/en/analytics" as Route },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Security", href: "/legal/security" },
];

const contactLinks = [
  { label: "hello@towerpower.example", href: "mailto:hello@towerpower.example", icon: Mail },
  { label: "+1 (555) 018-2046", href: "tel:+15550182046", icon: Phone },
  { label: "Austin, TX", href: "https://maps.example.com/tower_power", icon: MapPin },
];

export function LandingFooter() {
  return (
    <footer id="contact" className="relative border-t border-[color:var(--landing-border)] bg-[var(--landing-bg-deep)] text-[var(--landing-text)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8 lg:py-16">
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
            Fake-for-now operating hub for gym networks, billing desks,
            coaches, access devices, inventory rooms, and the teams keeping
            every branch moving.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://www.linkedin.example/tower_power"
              className="text-sm font-bold text-[var(--landing-copy)] underline-offset-4 hover:text-[var(--landing-accent-strong)] hover:underline"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.example/tower_power"
              className="text-sm font-bold text-[var(--landing-copy)] underline-offset-4 hover:text-[var(--landing-accent-strong)] hover:underline"
            >
              Instagram
            </a>
            <a
              href="https://status.example.com/tower_power"
              className="text-sm font-bold text-[var(--landing-copy)] underline-offset-4 hover:text-[var(--landing-accent-strong)] hover:underline"
            >
              Status
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[var(--landing-accent-strong)]">
            Product
          </h2>
          <ul className="mt-5 space-y-3">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-semibold text-[var(--landing-copy)] transition-colors hover:text-[var(--landing-text)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
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
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--landing-copy)] transition-colors hover:text-[var(--landing-accent-strong)]"
              >
                {index === 0 ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FileText className="h-4 w-4" aria-hidden="true" />
                )}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
