import Hero from "@/components/Hero/index";
import ClassGrid from "@/components/ClassGrid";
import KineticTicker from "@/components/KineticTicker";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-hidden">
      <Hero />
      
      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-8 sm:mb-12">
          <span className="text-amber-500 font-mono text-sm tracking-widest uppercase block mb-2">
            {"// CHOOSE YOUR DISCIPLINE"}
          </span>
          <h2 className="text-[clamp(2.5rem,10vw,4.5rem)] font-black uppercase leading-none tracking-normal text-white">
            TRAINING ZONES
          </h2>
        </div>
        <ClassGrid />
      </section>

      <KineticTicker />

    </main>
  );
}
