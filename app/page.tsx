import Hero from "@/components/Hero/index";
import ClassGrid from "@/components/ClassGrid";
import KineticTicker from "@/components/KineticTicker"; // Import the new ticker

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 overflow-hidden">
      {/* Section 1: Hero Reveal */}
      <Hero />
      
      {/* Section 2: Interactive Class Grid */}
      <section className="relative w-full py-24 px-4 max-w-7xl mx-auto">
        <div className="mb-12 px-4">
          <span className="text-amber-500 font-mono text-sm tracking-widest uppercase block mb-2">
            // CHOOSE YOUR DISCIPLINE
          </span>
          <h2 className="text-white text-5xl md:text-6xl font-black uppercase tracking-tighter">
            TRAINING ZONES
          </h2>
        </div>
        <ClassGrid />
      </section>

      {/* Section 3: The Kinetic Ticker */}
      <KineticTicker />

    </main>
  );
}