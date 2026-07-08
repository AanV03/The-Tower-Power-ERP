import Hero from "@/components/Hero/index";
import ClassGrid from "@/components/ClassGrid";
import KineticTicker from "@/components/KineticTicker"; // Import the new ticker
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Fingerprint,
  Gauge,
  Laptop,
  Megaphone,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";

const appPills = [
  { label: "Memberships", icon: UsersRound },
  { label: "Billing", icon: CreditCard },
  { label: "Access", icon: Fingerprint },
  { label: "Classes", icon: CalendarDays },
  { label: "Inventory", icon: Boxes },
  { label: "Finance", icon: BadgeDollarSign },
  { label: "Marketing", icon: Megaphone },
  { label: "Maintenance", icon: Wrench },
  { label: "Analytics", icon: BarChart3 },
];

const workflowSteps = [
  ["Lead becomes member", "Plan, waiver, payment method, and home branch are created together."],
  ["Member checks in", "Access permissions, class attendance, and branch capacity update live."],
  ["Operations reconcile", "POS, billing, stock movements, and coach payroll stay in the same ledger."],
];

const platformFeatures = [
  {
    icon: Gauge,
    title: "Fast operator UI",
    copy: "Front desk, managers, coaches, and finance teams get dense screens built for repeated daily work.",
  },
  {
    icon: Laptop,
    title: "Every branch in sync",
    copy: "Transfers, access devices, classes, and revenue reports roll up without spreadsheet stitching.",
  },
  {
    icon: ShieldCheck,
    title: "Role-aware by default",
    copy: "Permissions, branch scope, audit trails, and admin workflows are part of the operating model.",
  },
  {
    icon: Sparkles,
    title: "Automation where it counts",
    copy: "Renewals, failed payments, low-stock alerts, payroll prep, and retention tasks move automatically.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-zinc-950">
      <LandingNavbar />
      <Hero />

      <section className="relative border-y border-white/10 bg-black">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <span className="block font-mono text-xs uppercase tracking-[0.24em] text-amber-500">
              {"// ONE-CLICK OPERATIONS"}
            </span>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-normal text-white sm:text-4xl sm:leading-none">
              Apps for every gym workflow
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {appPills.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#modules"
                className="group flex min-h-20 min-w-0 items-center gap-3 overflow-hidden border border-white/10 bg-zinc-900/60 px-3 py-3 transition-colors hover:border-amber-400/50 hover:bg-amber-400/10"
              >
                <Icon className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                <span className="min-w-0 text-xs font-black uppercase leading-snug tracking-[0.08em] text-zinc-200 [overflow-wrap:anywhere] group-hover:text-white sm:tracking-[0.1em]">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      
      <section id="modules" className="relative mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 grid gap-6 sm:mb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-amber-500">
              {"// BUILT FOR GYM OPERATIONS"}
            </span>
            <h2 className="text-[clamp(2.25rem,9vw,4.5rem)] font-black uppercase leading-none tracking-normal text-white">
              Choose the workflow. Gerpy connects the rest.
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg lg:justify-self-end">
            Inspired by broad ERP suites, Gerpy narrows the focus to fitness:
            every app is shaped around check-ins, memberships, classes,
            branch operations, inventory, and recurring revenue.
          </p>
        </div>
        <ClassGrid />
      </section>

      <KineticTicker />

      <section id="operations" className="relative mx-auto grid w-full max-w-7xl scroll-mt-24 gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
        <div>
          <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-amber-500">
            {"// MULTI-BRANCH CONTROL"}
          </span>
          <h2 className="text-[clamp(2rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-white">
            Know what is happening before it becomes a problem
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Branch performance", "Compare check-ins, sales, churn, and staffing across locations."],
            ["Automated finance", "Recurring billing, invoices, payments, refunds, and accounting exports."],
            ["Staff operations", "Attendance, commissions, coach schedules, roles, and payroll-ready data."],
            ["Member lifecycle", "Lead capture, conversion, renewals, retention tasks, and win-back campaigns."],
          ].map(([title, copy]) => (
            <article key={title} className="border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-black/70">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <div>
            <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-amber-500">
              {"// IMAGINE WITHOUT GERPY"}
            </span>
            <h2 className="text-[clamp(2rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-white">
              Fewer tabs. Fewer handoffs. Cleaner decisions.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              Instead of stitching together billing software, door logs,
              spreadsheets, calendars, and inventory notes, teams work from one
              operational source of truth.
            </p>
          </div>

          <div className="border border-white/10 bg-zinc-950 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                  Workflow chain
                </p>
                <h3 className="mt-2 text-xl font-black uppercase text-white sm:text-2xl">
                  From signup to payout
                </h3>
              </div>
              <ClipboardList className="h-6 w-6 text-amber-400" aria-hidden="true" />
            </div>
            <div className="grid gap-3">
              {workflowSteps.map(([title, copy], index) => (
                <article
                  key={title}
                  className="grid gap-4 border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[auto_1fr]"
                >
                  <span className="grid size-10 place-items-center bg-amber-500 text-sm font-black text-black">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-black text-white">{title}</h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 max-w-4xl sm:mb-12">
          <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-amber-500">
            {"// ALL THE TECH IN ONE PLATFORM"}
          </span>
          <h2 className="text-[clamp(2rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-white">
            Built like command software, not a marketing dashboard
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {platformFeatures.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="grid gap-5 border border-zinc-800 bg-zinc-900/80 p-6 sm:grid-cols-[auto_1fr] sm:p-7"
            >
              <div className="grid size-12 place-items-center border border-amber-400/30 bg-amber-400/10 text-amber-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
                  {copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-amber-500 text-black">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em]">
              Trusted by ambitious gym operators
            </p>
            <h2 className="mt-3 max-w-4xl text-[clamp(2rem,8vw,4.5rem)] font-black uppercase leading-none tracking-normal">
              Join the teams replacing scattered tools with one operating system
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            {["No credit card", "Instant demo data", "Branch-ready"].map((item) => (
              <div key={item} className="flex min-w-0 items-center gap-2 border border-black/20 bg-black/10 px-4 py-3">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span className="min-w-0 text-sm font-black uppercase tracking-[0.08em] sm:tracking-[0.12em]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
