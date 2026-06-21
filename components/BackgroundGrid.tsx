"use client";

import { useEffect, useRef } from "react";

export default function BackgroundGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let dots: HTMLElement[] = [];
    let dotCenters: Array<{ x: number; y: number }> = [];
    let cleanupMouseMove: (() => void) | null = null;
    let resizeTimer: number | undefined;
    let frame: number | undefined;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const createGrid = () => {
      cleanupMouseMove?.();
      cleanupMouseMove = null;
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
        frame = undefined;
      }

      const spacing = window.innerWidth < 640 ? 72 : 56;
      const columns = Math.max(6, Math.ceil(window.innerWidth / spacing));
      const rows = Math.max(8, Math.ceil(window.innerHeight / spacing));
      const total = columns * rows;

      container.innerHTML = "";

      container.style.setProperty("--columns", columns.toString());
      container.style.setProperty("--rows", rows.toString());

      for (let i = 0; i < total; i++) {
        const dot = document.createElement("div");
        dot.classList.add("grid-dot");
        container.appendChild(dot);
      }

      dots = Array.from(container.querySelectorAll(".grid-dot")) as HTMLElement[];
      dotCenters = dots.map((_, index) => ({
        x: ((index % columns) + 0.5) * (window.innerWidth / columns),
        y: (Math.floor(index / columns) + 0.5) * (window.innerHeight / rows),
      }));

      if (!canHover || prefersReducedMotion) return;

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;

        if (frame !== undefined) window.cancelAnimationFrame(frame);

        frame = window.requestAnimationFrame(() => {
          dots.forEach((dot, index) => {
            const { x: dotX, y: dotY } = dotCenters[index];
            const dx = clientX - dotX;
            const dy = clientY - dotY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            const radius = 200;

            if (distance < radius) {
              const force = (radius - distance) / radius;

              const moveX = -dx * force * 0.15;
              const moveY = -dy * force * 0.15;

              dot.style.transform = `
              translate(${moveX}px, ${moveY}px)
              scale(${1 + force * 2})
            `;

              dot.style.opacity = `${0.3 + force * 0.7}`;
              dot.style.backgroundColor = "#fbbf24";
              dot.style.boxShadow = `0 0 ${20 * force}px #fbbf24`;
            } else {
              dot.style.transform = "translate(0px, 0px) scale(1)";
              dot.style.opacity = "0.15";
              dot.style.backgroundColor = "#f59e0b";
              dot.style.boxShadow = "none";
            }
          });
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      cleanupMouseMove = () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    };

    createGrid();

    const handleResize = () => {
      if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        createGrid();
      }, 120);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cleanupMouseMove?.();
      if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame: number | undefined;

    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const scrollY = window.scrollY;

      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!wrapperRef.current) return;
        wrapperRef.current.style.transform = `
        translate3d(
          ${Math.sin(scrollY * 0.001) * 20}px,
          ${scrollY * 0.15}px,
          0
        )
      `;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform"
    >
      <div
        ref={containerRef}
        className="grid h-full w-full"
        style={{
          gridTemplateColumns:
            "repeat(var(--columns), 1fr)",
          gridTemplateRows:
            "repeat(var(--rows), 1fr)",
        }}
      />
    </div>
  );
}
