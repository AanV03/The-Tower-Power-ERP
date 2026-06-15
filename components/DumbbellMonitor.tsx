"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Dumbbell } from "lucide-react"; // Using a professional icon

export default function DumbbellMonitor() {
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(orbitRef.current, {
      rotate: 360,
      duration: 20,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Orbit Ring */}
      <div 
        ref={orbitRef} 
        className="absolute inset-0 border border-cyan-500/30 rounded-full border-dashed" 
      />
      
      {/* Central Icon container with glow */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-cyan-500/20 blur-2xl rounded-full" />
        <Dumbbell 
          size={64} 
          className="text-cyan-400" 
          strokeWidth={1.5} 
          style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))" }}
        />
        
        {/* Added "Cross" lines from your screenshot for the techy aesthetic */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/20 rotate-45" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/20 -rotate-45" />
        </div>
      </div>
    </div>
  );
}