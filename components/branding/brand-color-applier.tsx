"use client";

import { useEffect } from "react";

/** localStorage key for persisting tenant brand colors */
export const BRAND_STORAGE_KEY = "gerpy-brand-colors";

/**
 * Brand color tokens exposed to the admin panel.
 *
 * sidebarText and radius remain in the type for future use but are
 * intentionally excluded from the UI panel (not standard color pickers).
 */
export type BrandColors = {
  sidebarBg: string;
  topbarBg: string;
  primaryColor: string; // --brand-orange, --primary (HSL), --sidebar-accent-active, charts
  accentColor: string;  // --brand-yellow — warning badges, secondary highlights
  sidebarText: string;  // rgba — kept for future UI
  radius: string;       // rem  — kept for future UI
};

export const DEFAULT_BRAND_COLORS: BrandColors = {
  sidebarBg: "#023047",
  topbarBg: "#023047",
  primaryColor: "#fb8500",
  accentColor: "#edc531",
  sidebarText: "rgba(255,255,255,0.8)",
  radius: "0.625rem",
};

export function normalizeBrandColors(colors: Partial<BrandColors> | null | undefined): BrandColors {
  return { ...DEFAULT_BRAND_COLORS, ...(colors ?? {}) };
}

// ─── Internal hex → HSL triplet (mirrors branding.ts, runs client-side) ──────

function hexToHslTriplet(hex: string): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return "35 96% 50%"; // fallback orange
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function getBrandTargets() {
  return [
    document.documentElement,
    ...document.querySelectorAll<HTMLElement>("[data-brand-id]"),
  ];
}

function setBrandProperty(name: string, value: string) {
  for (const target of getBrandTargets()) {
    target.style.setProperty(name, value);
  }
}

function removeBrandProperty(name: string) {
  for (const target of getBrandTargets()) {
    target.style.removeProperty(name);
  }
}

// ─── Apply / Reset ────────────────────────────────────────────────────────────

/**
 * Applies brand color tokens to the root and active brand scope as CSS custom properties.
 * primaryColor fans out to all orange/primary usages:
 *   --brand-orange     → charts (var(--brand-orange) in module-chart.tsx)
 *   --sidebar-accent-active → active nav item
 *   --primary          → shadcn buttons (hsl(var(--primary)))
 *   --ring             → focus ring
 */
export function applyBrandColors(colors: Partial<BrandColors>) {
  if (colors.sidebarBg !== undefined)
    setBrandProperty("--sidebar-bg", colors.sidebarBg);

  if (colors.topbarBg !== undefined)
    setBrandProperty("--topbar-bg", colors.topbarBg);

  if (colors.sidebarText !== undefined)
    setBrandProperty("--sidebar-text-primary", colors.sidebarText);

  if (colors.radius !== undefined)
    setBrandProperty("--radius", colors.radius);

  if (colors.accentColor !== undefined && colors.accentColor.startsWith("#")) {
    setBrandProperty("--brand-yellow", colors.accentColor);
  }

  if (colors.primaryColor !== undefined && colors.primaryColor.startsWith("#")) {
    const hex = colors.primaryColor;
    const hsl = hexToHslTriplet(hex);
    setBrandProperty("--brand-orange", hex);
    setBrandProperty("--sidebar-accent-active", hex);
    setBrandProperty("--primary", hsl);       // used by shadcn Button (hsl(var(--primary)))
    setBrandProperty("--ring", hsl);           // focus ring matches primary
  }
}

export function resetBrandColors() {
  const props = [
    "--sidebar-bg",
    "--topbar-bg",
    "--sidebar-text-primary",
    "--radius",
    "--brand-yellow",
    "--brand-orange",
    "--sidebar-accent-active",
    "--primary",
    "--ring",
  ];
  for (const p of props) removeBrandProperty(p);
}

// ─── Layout Component (mounts once in dashboard layout) ───────────────────────

export function BrandColorApplier() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BRAND_STORAGE_KEY);
      if (raw) {
        applyBrandColors(normalizeBrandColors(JSON.parse(raw) as Partial<BrandColors>));
      }
    } catch { /* ignore corrupt data */ }

    const onUpdate = (e: Event) => {
      if (e instanceof CustomEvent && e.detail)
        applyBrandColors(e.detail as Partial<BrandColors>);
    };
    const onReset = () => resetBrandColors();

    document.addEventListener("brand:update", onUpdate);
    document.addEventListener("brand:reset", onReset);
    return () => {
      document.removeEventListener("brand:update", onUpdate);
      document.removeEventListener("brand:reset", onReset);
    };
  }, []);

  return null;
}
