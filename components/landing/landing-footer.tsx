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
  { label: "hello@gerpy.example", href: "mailto:hello@gerpy.example", icon: Mail },
  { label: "+1 (555) 018-2046", href: "tel:+15550182046", icon: Phone },
  { label: "Austin, TX", href: "https://maps.example.com/gerpy", icon: MapPin },
];

export function LandingFooter() {
  return (
    <footer id="contact" className="relative border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center border border-amber-400/40 bg-amber-400 text-black">
              <Dumbbell className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-black uppercase tracking-normal">Gerpy ERP</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                System logo
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-zinc-400">
            Fake-for-now operating hub for gym networks, billing desks,
            coaches, access devices, inventory rooms, and the teams keeping
            every branch moving.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://www.linkedin.example/gerpy"
              className="text-sm font-bold text-zinc-300 underline-offset-4 hover:text-amber-300 hover:underline"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.example/gerpy"
              className="text-sm font-bold text-zinc-300 underline-offset-4 hover:text-amber-300 hover:underline"
            >
              Instagram
            </a>
            <a
              href="https://status.example.com/gerpy"
              className="text-sm font-bold text-zinc-300 underline-offset-4 hover:text-amber-300 hover:underline"
            >
              Status
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-amber-400">
            Product
          </h2>
          <ul className="mt-5 space-y-3">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-amber-400">
            Contact
          </h2>
          <ul className="mt-5 space-y-3">
            {contactLinks.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
                >
                  <Icon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-sm text-zinc-500">
            Copyright 2026 Gerpy Systems, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-amber-300"
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
