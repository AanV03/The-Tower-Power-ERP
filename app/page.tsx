import Hero from "@/components/Hero/index";
import ClassGrid from "@/components/ClassGrid";
import KineticTicker from "@/components/KineticTicker"; // Import the new ticker
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-hidden">
      <Hero />
      
      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 sm:mb-12">
          <span className="text-amber-500 font-mono text-sm tracking-widest uppercase block mb-2">
            {"// BUILT FOR GYM OPERATIONS"}
          </span>
          <h2 className="text-[clamp(2.5rem,10vw,4.5rem)] font-black uppercase leading-none tracking-normal text-white">
            ERP MODULES
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
            A professional back office for fitness businesses: front desk,
            finance, memberships, staff, inventory, access, and analytics in
            one connected workflow.
          </p>
        </div>
        <ClassGrid />
      </section>

        {/* Section 3: The Kinetic Ticker */}
        <KineticTicker />

      <section className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
        <div>
          <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-amber-500">
            {"// MULTI-BRANCH CONTROL"}
          </span>
          <h2 className="text-[clamp(2.25rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-white">
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

    </main>
  );
}