import Hero from "@/components/Hero/index";
import ClassGrid from "@/components/ClassGrid";
import KineticTicker from "@/components/KineticTicker"; // Import the new ticker
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { getDictionary, type Locale } from "@/lib/i18n";
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

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dictionary = getDictionary(locale as Locale);

  const appPills = [
    { label: dictionary.modules.memberships, icon: UsersRound },
    { label: dictionary.modules.finance, icon: CreditCard },
    { label: dictionary.modules.access, icon: Fingerprint },
    { label: dictionary.common.dashboard, icon: CalendarDays },
    { label: dictionary.modules.inventory, icon: Boxes },
    { label: dictionary.modules.pos, icon: BadgeDollarSign },
    { label: dictionary.modules.marketing, icon: Megaphone },
    { label: dictionary.modules.specialists, icon: Wrench },
    { label: dictionary.modules.dashboard, icon: BarChart3 },
  ];

  const workflowSteps = [
    [dictionary.landing.steps.step1Title, dictionary.landing.steps.step1Desc],
    [dictionary.landing.steps.step2Title, dictionary.landing.steps.step2Desc],
    [dictionary.landing.steps.step3Title, dictionary.landing.steps.step3Desc],
  ];

  const platformFeatures = [
    {
      icon: Gauge,
      title: dictionary.landing.fastOperatorUi,
      copy: dictionary.landing.fastOperatorUiDesc,
    },
    {
      icon: Laptop,
      title: dictionary.landing.everyBranchInSync,
      copy: dictionary.landing.everyBranchInSyncDesc,
    },
    {
      icon: ShieldCheck,
      title: dictionary.landing.roleAwareByDefault,
      copy: dictionary.landing.roleAwareByDefaultDesc,
    },
    {
      icon: Sparkles,
      title: dictionary.landing.automationWhereCounts,
      copy: dictionary.landing.automationWhereCountsDesc,
    },
  ];

  return (
    <main className="landing-palette relative min-h-screen w-full overflow-hidden bg-[var(--landing-bg)]">
      <LandingNavbar locale={locale as Locale} />
      <Hero locale={locale as Locale} />

      <section className="relative border-y border-[color:var(--landing-border)] bg-[var(--landing-bg-deep)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.55fr_1.45fr] lg:px-8">
          <div>
            <span className="block font-mono text-xs uppercase tracking-[0.24em] text-[var(--landing-accent-strong)]">
              {dictionary.landing.oneClickOps}
            </span>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-normal text-[var(--landing-text)] sm:text-4xl sm:leading-none">
              {dictionary.landing.gymWorkflowTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
            {appPills.map(({ label, icon: Icon }) => (
              <article
                key={label}
                className="flex min-h-20 min-w-0 items-center gap-4 border border-[color:var(--landing-border)] bg-[var(--landing-panel)] px-5 py-4"
              >
                <Icon className="h-5 w-5 shrink-0 text-[var(--landing-accent-strong)]" aria-hidden="true" />
                <span className="min-w-0 break-words text-xs font-black uppercase leading-snug tracking-[0.08em] text-[var(--landing-copy)] sm:tracking-[0.1em]">
                  {label}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      <section id="modules" className="relative mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 grid gap-6 sm:mb-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-[var(--landing-accent-strong)]">
              {dictionary.landing.builtForGyms}
            </span>
            <h2 className="max-w-[12ch] text-balance text-[clamp(2.25rem,6vw,4rem)] font-black uppercase leading-[0.98] tracking-normal text-[var(--landing-text)] lg:text-[clamp(3rem,4.5vw,4.25rem)]">
              {dictionary.landing.chooseWorkflowTitle}
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-7 text-[var(--landing-copy)] sm:text-lg lg:justify-self-end">
            {dictionary.landing.chooseWorkflowDesc}
          </p>
        </div>
        <ClassGrid locale={locale as Locale} />
      </section>

      <KineticTicker locale={locale as Locale} />

      <section id="operations" className="relative mx-auto grid w-full max-w-7xl scroll-mt-24 gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
        <div>
          <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-[var(--landing-accent-strong)]">
            {dictionary.landing.multiBranchControl}
          </span>
          <h2 className="text-[clamp(2rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-[var(--landing-text)]">
            {dictionary.landing.knowBeforeProblem}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [dictionary.landing.branchPerformance, dictionary.landing.branchPerformanceDesc],
            [dictionary.landing.automatedFinance, dictionary.landing.automatedFinanceDesc],
            [dictionary.landing.staffOps, dictionary.landing.staffOpsDesc],
            [dictionary.landing.memberLifecycle, dictionary.landing.memberLifecycleDesc],
          ].map(([title, copy]) => (
            <article key={title} className="border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-6">
              <h3 className="text-xl font-bold text-[var(--landing-text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-copy)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-y border-[color:var(--landing-border)] bg-[var(--landing-section-overlay)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <div>
            <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-[var(--landing-accent-strong)]">
              {dictionary.landing.imagineWithout}
            </span>
            <h2 className="text-[clamp(2rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-[var(--landing-text)]">
              {dictionary.landing.fewerTabs}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--landing-copy)] sm:text-lg">
              {dictionary.landing.fewerTabsDesc}
            </p>
          </div>

          <div className="border border-[color:var(--landing-border)] bg-[var(--landing-panel-strong)] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[color:var(--landing-border)] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--landing-accent-strong)]">
                  {dictionary.landing.workflowChain}
                </p>
                <h3 className="mt-2 text-xl font-black uppercase text-[var(--landing-text)] sm:text-2xl">
                  {dictionary.landing.fromSignupToPayout}
                </h3>
              </div>
              <ClipboardList className="h-6 w-6 text-[var(--landing-accent-strong)]" aria-hidden="true" />
            </div>
            <div className="grid gap-3">
              {workflowSteps.map(([title, copy], index) => (
                <article
                  key={title}
                  className="grid gap-4 border border-[color:var(--landing-border)] bg-white/[0.04] p-4 sm:grid-cols-[auto_1fr]"
                >
                  <span className="grid size-10 place-items-center bg-[var(--landing-accent)] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-black text-[var(--landing-text)]">{title}</h4>
                    <p className="mt-1 text-sm leading-6 text-[var(--landing-copy)]">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 max-w-4xl sm:mb-12">
          <span className="mb-2 block font-mono text-sm uppercase tracking-widest text-[var(--landing-accent-strong)]">
            {dictionary.landing.allTechInOne}
          </span>
          <h2 className="text-[clamp(2rem,8vw,4.25rem)] font-black uppercase leading-none tracking-normal text-[var(--landing-text)]">
            {dictionary.landing.builtLikeCommand}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {platformFeatures.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="grid gap-5 border border-[color:var(--landing-border)] bg-[var(--landing-panel)] p-6 sm:grid-cols-[auto_1fr] sm:p-7"
            >
              <div className="grid size-12 place-items-center border border-[color:var(--landing-border)] bg-[var(--landing-icon-bg)] text-[var(--landing-accent-strong)]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[var(--landing-text)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--landing-copy)] sm:text-base">
                  {copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-y border-[color:var(--landing-border)] bg-[var(--landing-cta)] text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em]">
              {dictionary.landing.trustedByOperators}
            </p>
            <h2 className="mt-3 max-w-4xl text-[clamp(2rem,8vw,4.5rem)] font-black uppercase leading-none tracking-normal">
              {dictionary.landing.joinTeamsReplacing}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            {[dictionary.landing.noCreditCard, dictionary.landing.instantDemo, dictionary.landing.branchReady].map((item) => (
              <div key={item} className="flex min-w-0 items-center gap-2 border border-white/20 bg-white/10 px-4 py-3">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span className="min-w-0 text-sm font-black uppercase tracking-[0.08em] sm:tracking-[0.12em]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter locale={locale as Locale} />
    </main>
  );
}
