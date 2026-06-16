"use client";

import { useEffect, useRef } from "react";

export default function BackgroundGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let dots: HTMLElement[] = [];
    let cleanupMouseMove: (() => void) | null = null;

    const createGrid = () => {
      cleanupMouseMove?.();

      const columns = Math.floor(window.innerWidth / 50);
      const rows = Math.floor(window.innerHeight / 50);
      const total = columns * rows;

      container.innerHTML = "";

      container.style.setProperty("--columns", columns.toString());
      container.style.setProperty("--rows", rows.toString());

      for (let i = 0; i < total; i++) {
        const dot = document.createElement("div");
        dot.classList.add("grid-dot");
        container.appendChild(dot);
      }

      dots = Array.from(
        container.querySelectorAll(".grid-dot")
      ) as HTMLElement[];

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;

        dots.forEach((dot) => {
          const rect = dot.getBoundingClientRect();

          const dotX = rect.left + rect.width / 2;
          const dotY = rect.top + rect.height / 2;

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
      };

      window.addEventListener("mousemove", handleMouseMove);

      cleanupMouseMove = () => {
        window.removeEventListener(
          "mousemove",
          handleMouseMove
        );
      };
    };

    createGrid();

    const handleResize = () => {
      createGrid();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cleanupMouseMove?.();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const scrollY = window.scrollY;

      wrapperRef.current.style.transform = `
        translate3d(
          ${Math.sin(scrollY * 0.001) * 20}px,
          ${scrollY * 0.15}px,
          0
        )
      `;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform"
    >
      <div
        ref={containerRef}
        className="w-full h-full grid"
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