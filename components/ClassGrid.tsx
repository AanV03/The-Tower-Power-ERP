import {
  BadgeDollarSign,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  Fingerprint,
  UsersRound,
} from "lucide-react";

const modules = [
  {
    icon: UsersRound,
    title: "Membership CRM",
    desc: "Plans, renewals, freezes, family accounts, waivers, and branch-level member history.",
    metric: "3,842 members",
  },
  {
    icon: BadgeDollarSign,
    title: "POS & Billing",
    desc: "Retail sales, invoices, failed payments, recurring charges, refunds, and register control.",
    metric: "$84.6k MRR",
  },
  {
    icon: Fingerprint,
    title: "Access Control",
    desc: "Door devices, check-ins, plan permissions, guest passes, and attendance exceptions.",
    metric: "716 check-ins",
  },
  {
    icon: CalendarDays,
    title: "Classes & Coaches",
    desc: "Capacity, waitlists, trainer calendars, room allocation, payroll links, and attendance.",
    metric: "91% occupancy",
  },
  {
    icon: Boxes,
    title: "Inventory",
    desc: "Supplements, apparel, stock transfers, purchase orders, warehouse counts, and low-stock alerts.",
    metric: "18 alerts",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Finance Analytics",
    desc: "Branch P&L, churn, cohort value, payroll cost, product margins, and executive reporting.",
    metric: "+18% growth",
  },
];

export default function ClassGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 bg-[var(--landing-bg)] sm:grid-cols-2 lg:grid-cols-3">
      {modules.map(({ icon: Icon, ...item }) => (
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
      ))}
    </div>
  );
}
