"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function VelocityTrack() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Animate a "pulse" of light along the track
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 3,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <svg viewBox="0 0 200 100" className="w-full drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
        {/* Background Track */}
        <path d="M10 80 C 40 10, 60 10, 80 80 S 120 80, 150 20 S 180 80, 190 80" 
              fill="none" stroke="#27272a" strokeWidth="4" />
        {/* Active Energy Line */}
        <path ref={pathRef} d="M10 80 C 40 10, 60 10, 80 80 S 120 80, 150 20 S 180 80, 190 80" 
              fill="none" stroke="#f59e0b" strokeWidth="4" 
              strokeDasharray="400" strokeDashoffset="400" />
      </svg>
      <div className="absolute bottom-0 text-center">
        <div className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Intensity Flow</div>
      </div>
    </div>
  );
}