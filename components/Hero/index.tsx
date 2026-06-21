"use client";

import { useEffect, useRef } from "react";
import BackgroundGrid from "../BackgroundGrid";
import AuroraBackground from "../AuroraBackground";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let active = true;

    import("gsap").then(({ gsap }) => {
      if (!active || !containerRef.current) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".char",
          {
            yPercent: 120,
            skewY: 8,
            opacity: 0,
          },
          {
            yPercent: 0,
            skewY: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.03,
            ease: "power4.out",
          }
        );
      }, containerRef);

      cleanup = () => ctx.revert();
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8"
    >
      <BackgroundGrid />
      <AuroraBackground />

      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 z-[2]" />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center">
        <h1
          ref={titleRef}
          className="flex flex-wrap justify-center gap-x-3 overflow-hidden px-1 text-center text-[clamp(3rem,17vw,8rem)] font-black uppercase leading-[0.9] tracking-normal text-white sm:gap-x-4 md:text-[clamp(5rem,11vw,9rem)]"
        >
          {"FORGE YOUR LEGACY".split(" ").map((word, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden py-1 sm:py-2"
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

        <p className="mt-6 max-w-2xl px-2 text-center text-base leading-7 text-zinc-300 sm:text-lg md:text-xl">
          Push beyond your limits. Build strength, confidence,
          and a legacy that lasts.
        </p>

        <button className="mt-10 min-h-12 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors duration-300 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:px-8 sm:py-4">
          Start Training
        </button>
      </div>
    </section>
  );
}
