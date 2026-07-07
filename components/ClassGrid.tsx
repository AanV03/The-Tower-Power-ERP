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
    <div className="grid grid-cols-1 gap-4 bg-zinc-950 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map(({ icon: Icon, ...item }) => (
        <article
          key={item.title}
          className="group flex min-h-72 min-w-0 flex-col justify-between border border-zinc-800 bg-zinc-900 p-5 transition-transform duration-300 hover:-translate-y-2 hover:border-amber-500/45 sm:min-h-80 sm:p-6 lg:min-h-[420px] lg:p-8"
        >
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center border border-amber-400/30 bg-amber-400/10 text-amber-400">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white transition-colors group-hover:text-amber-400 sm:text-3xl">
              {item.title}
            </h3>
            <p className="text-sm leading-6 text-zinc-400 sm:text-base">
              {item.desc}
            </p>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-5 text-sm font-black uppercase tracking-[0.18em] text-zinc-500 group-hover:text-amber-400">
            {item.metric}
          </div>
        </article>
      ))}
    </div>
  );
}
