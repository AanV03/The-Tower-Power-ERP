"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function KineticTicker({ locale = "es" }: { locale?: Locale }) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dictionary = getDictionary(locale);

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
      className="relative flex w-full items-center overflow-hidden bg-[var(--landing-primary)] py-12 md:py-24"
    >
      <div
        ref={textRef}
        className="flex gap-8 whitespace-nowrap px-4 text-[14vw] font-black uppercase tracking-normal text-white will-change-transform sm:text-[12vw] md:gap-16 md:text-[10vw]"
      >
        <span>{dictionary.landing.ticker.primary}</span>
        <span
          className="text-transparent"
          style={{ WebkitTextStroke: "2px rgba(255,255,255,0.85)" }}
        >
          {dictionary.landing.ticker.outline}
        </span>
        <span>{dictionary.landing.ticker.primary}</span>
        <span
          className="text-transparent"
          style={{ WebkitTextStroke: "2px rgba(255,255,255,0.85)" }}
        >
          {dictionary.landing.ticker.outline}
        </span>
        <span>{dictionary.landing.ticker.primary}</span>
      </div>
    </section>
  );
}
