"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function KineticTicker() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Calculate the travel distance
      const textElement = textRef.current;
      if (!textElement) return;

      const travelDistance = textElement.scrollWidth - window.innerWidth;

      gsap.to(textElement, {
        x: -travelDistance,
        ease: "none", // Linear movement, no easing applied to the scroll itself
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", // Animation starts when section top hits viewport bottom
          end: "bottom top",   // Animation ends when section bottom hits viewport top
          scrub: 1,            // The '1' adds a 1-second lag for a smoother, heavier feel
        },
      });
    }, sectionRef);

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-amber-500 py-12 md:py-24 flex items-center"
    >
      <div
        ref={textRef}
        className="whitespace-nowrap text-[12vw] md:text-[10vw] font-black uppercase tracking-tighter text-zinc-950 will-change-transform flex gap-8 md:gap-16 px-4"
      >
        {/* Repeat the text enough times so it never runs out of runway */}
        <span>No Pain. No Gain.</span>
        <span className="text-transparent" style={{ WebkitTextStroke: "2px #09090b" }}>No Pain. No Gain.</span>
        <span>No Pain. No Gain.</span>
        <span className="text-transparent" style={{ WebkitTextStroke: "2px #09090b" }}>No Pain. No Gain.</span>
        <span>No Pain. No Gain.</span>
      </div>
    </section>
  );
}