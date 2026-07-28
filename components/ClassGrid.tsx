import {
  BadgeDollarSign,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  Fingerprint,
  UsersRound,
} from "lucide-react";

import { getDictionary, type Locale } from "@/lib/i18n";

const moduleIcons = [
  UsersRound,
  BadgeDollarSign,
  Fingerprint,
  CalendarDays,
  Boxes,
  ChartNoAxesCombined,
];

export default function ClassGrid({ locale = "es" }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <div className="grid grid-cols-1 gap-4 bg-[var(--landing-bg)] sm:grid-cols-2 lg:grid-cols-3">
      {dictionary.landing.classGrid.map((item, index) => {
        const Icon = moduleIcons[index] ?? UsersRound;

        return (
          <article
            key={item.title}
            className="group flex min-h-72 min-w-0 flex-col justify-between border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-5 transition-transform duration-300 hover:-translate-y-2 hover:border-[color:var(--landing-accent-strong)] sm:min-h-80 sm:p-6 lg:min-h-[420px] lg:p-8"
          >
            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center border border-[color:var(--landing-border)] bg-[var(--landing-icon-bg)] text-[var(--landing-accent-strong)]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[var(--landing-text)] transition-colors group-hover:text-[var(--landing-accent-strong)] sm:text-3xl">
                {item.title}
              </h3>
              <p className="text-sm leading-6 text-[var(--landing-copy)] sm:text-base">
                {item.desc}
              </p>
            </div>
            <div className="mt-8 border-t border-[color:var(--landing-border)] pt-5 text-sm font-black uppercase tracking-[0.18em] text-[var(--landing-muted)] group-hover:text-[var(--landing-accent-strong)]">
              {item.metric}
            </div>
          </article>
        );
      })}
    </div>
  );
}
