"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import Link from "next/link";
import BackgroundGrid from "../BackgroundGrid";
import AuroraBackground from "../AuroraBackground";


export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text reveal
      gsap.fromTo(
        ".char",
        {
          y: 200,
          skewY: 10,
          opacity: 0,
        },
        {
          y: 0,
          skewY: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.03,
          ease: "power4.out",
        }
      );

      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-zinc-950 flex items-center justify-center"
    >
      {/* Layer 1 */}
      <BackgroundGrid />
      <AuroraBackground />
      {/* Layer 2 */}
     

      {/* Layer 3 */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 z-[2]" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1
          ref={titleRef}
          className="text-white text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-center uppercase overflow-hidden flex flex-wrap justify-center gap-x-4 px-4"
        >
          {"FORGE YOUR LEGACY".split(" ").map((word, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden py-2"
            >
              {word.split("").map((char, j) => (
                <span
                  key={j}
                  className="char inline-block will-change-transform"
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="mt-6 text-zinc-400 text-lg md:text-xl max-w-2xl text-center px-6">
          Push beyond your limits. Build strength, confidence,
          and a legacy that lasts.
        </p>

        <Link
          href="/register"
<<<<<<< HEAD
          className="mt-10 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition-all duration-300 rounded-lg"
=======
          className="mt-10 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition-all duration-300 rounded-lg inline-block text-center"
>>>>>>> dbc9da7f35b34c39a7ebe01a3918bc8940aa20ac
        >
          Start Training
        </Link>
      </div>
    </section>
  );
}
