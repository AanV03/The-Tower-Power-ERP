"use client";
import { useEffect, useRef } from "react";

export default function KineticTicker() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let active = true;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (!active || !sectionRef.current || !textRef.current) return;

        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          const textElement = textRef.current;
          if (!textElement) return;

          gsap.to(textElement, {
            x: () => -Math.max(0, textElement.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              invalidateOnRefresh: true,
              scrub: 1,
            },
          });
        }, sectionRef);

        cleanup = () => ctx.revert();
      }
    );

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full items-center overflow-hidden bg-amber-500 py-10 sm:py-14 md:py-24"
    >
      <div
        ref={textRef}
        className="flex gap-8 whitespace-nowrap px-4 text-[clamp(3.5rem,12vw,9rem)] font-black uppercase tracking-normal text-zinc-950 will-change-transform md:gap-16"
      >
        <span>No Pain. No Gain.</span>
        <span
          className="text-transparent"
          style={{ WebkitTextStroke: "2px #09090b" }}
        >
          No Pain. No Gain.
        </span>
        <span>No Pain. No Gain.</span>
        <span
          className="text-transparent"
          style={{ WebkitTextStroke: "2px #09090b" }}
        >
          No Pain. No Gain.
        </span>
        <span>No Pain. No Gain.</span>
      </div>
    </section>
  );
}
