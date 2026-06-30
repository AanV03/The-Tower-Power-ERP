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
  contrast?: "normal" | "medium" | "high";
  font?: "default" | "serif" | "mono" | "elegant";
  logoUrl?: string;     // base64 encoded logo image
};

export const DEFAULT_BRAND_COLORS: BrandColors = {
  sidebarBg: "#023047",
  topbarBg: "#ffffff",
  primaryColor: "#fb8500",
  accentColor: "#edc531",
  sidebarText: "rgba(255,255,255,0.8)",
  radius: "0.625rem",
  contrast: "normal",
  font: "default",
  logoUrl: "",
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

function isLightColor(hex: string, isDarkMode: boolean = false): boolean {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return false;
  let r = parseInt(normalized.slice(0, 2), 16);
  let g = parseInt(normalized.slice(2, 4), 16);
  let b = parseInt(normalized.slice(4, 6), 16);

  if (isDarkMode) {
    r = r * 0.5 + 13 * 0.5;
    g = g * 0.5 + 15 * 0.5;
    b = b * 0.5 + 24 * 0.5;
  } else {
    r = r * 0.85 + 255 * 0.15;
    g = g * 0.85 + 255 * 0.15;
    b = b * 0.85 + 255 * 0.15;
  }

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
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
 *   --primary          → shadcn buttons (var(--primary))
 *   --ring             → focus ring
 */
export function applyBrandColors(colors: Partial<BrandColors>) {
  let isDarkMode = false;
  if (typeof document !== "undefined") {
    isDarkMode = document.documentElement.classList.contains("dark");
  }

  if (colors.sidebarBg !== undefined && colors.sidebarBg.startsWith("#")) {
    setBrandProperty("--sidebar-bg", colors.sidebarBg);
    const isLight = isLightColor(colors.sidebarBg, isDarkMode);
    const textPrimary = isLight ? "#0f172a" : "#f8fafc";
    const textSecondary = isLight ? "rgba(15, 23, 42, 0.7)" : "rgba(248, 250, 252, 0.7)";
    const borderColor = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)";
    
    setBrandProperty("--sidebar-text-primary", textPrimary);
    setBrandProperty("--sidebar-text-secondary", textSecondary);
    setBrandProperty("--sidebar-border-color", borderColor);
    
    // Also update shell variables
    setBrandProperty("--shell-sidebar-foreground", textPrimary);
    setBrandProperty("--shell-sidebar-foreground-secondary", textSecondary);
    setBrandProperty("--shell-sidebar-border-color", borderColor);
  }

  if (colors.topbarBg !== undefined && colors.topbarBg.startsWith("#")) {
    setBrandProperty("--topbar-bg", colors.topbarBg);
    const isLight = isLightColor(colors.topbarBg, isDarkMode);
    const textPrimary = isLight ? "#0f172a" : "#f8fafc";
    const textSecondary = isLight ? "rgba(15, 23, 42, 0.68)" : "rgba(248, 250, 252, 0.65)";
    const borderColor = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)";
    
    setBrandProperty("--topbar-foreground", textPrimary);
    setBrandProperty("--topbar-foreground-secondary", textSecondary);
    setBrandProperty("--topbar-border-color", borderColor);
    
    // Also update shell variables
    setBrandProperty("--shell-topbar-foreground", textPrimary);
    setBrandProperty("--shell-topbar-foreground-secondary", textSecondary);
    setBrandProperty("--shell-topbar-border-color", borderColor);
  }

  if (colors.radius !== undefined)
    setBrandProperty("--radius", colors.radius);

  if (colors.accentColor !== undefined && colors.accentColor.startsWith("#")) {
    setBrandProperty("--brand-yellow", colors.accentColor);
  }

  if (colors.primaryColor !== undefined && colors.primaryColor.startsWith("#")) {
    const hex = colors.primaryColor;
    const hsl = hexToHslTriplet(hex);
    
    // Evaluate if the primary color is light to determine the appropriate foreground
    const isLight = isLightColor(hex, false);
    const primaryForegroundHex = isLight ? "#0f172a" : "#ffffff";
    const primaryForegroundHsl = hexToHslTriplet(primaryForegroundHex);

    setBrandProperty("--brand-orange", hex);
    setBrandProperty("--sidebar-accent-active", hex);
    setBrandProperty("--sidebar-accent-active-foreground", primaryForegroundHex);
    setBrandProperty("--primary", hsl);       // used by shadcn Button (hsl(var(--primary)))
    setBrandProperty("--primary-foreground", primaryForegroundHsl);
    setBrandProperty("--ring", hsl);           // focus ring matches primary
  }

  if (typeof document !== "undefined") {
    // Dynamic style injection is removed to allow globals.css gradients to function properly.

    if (colors.contrast !== undefined) {
      document.documentElement.setAttribute("data-contrast", colors.contrast);
    }
    if (colors.font !== undefined) {
      document.documentElement.setAttribute("data-font", colors.font);
      if (colors.font === "default") {
        document.documentElement.style.removeProperty("--font-family-override");
      } else if (colors.font === "serif") {
        document.documentElement.style.setProperty("--font-family-override", "Georgia, Cambria, serif");
      } else if (colors.font === "mono") {
        document.documentElement.style.setProperty("--font-family-override", "ui-monospace, Consolas, monospace");
      } else if (colors.font === "elegant") {
        document.documentElement.style.setProperty("--font-family-override", "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
      }
    }
  }
}

export function resetBrandColors() {
  const props = [
    "--sidebar-bg",
    "--topbar-bg",
    "--topbar-foreground",
    "--topbar-foreground-secondary",
    "--topbar-border-color",
    "--sidebar-text-primary",
    "--sidebar-text-secondary",
    "--sidebar-border-color",
    "--shell-sidebar-foreground",
    "--shell-sidebar-foreground-secondary",
    "--shell-sidebar-border-color",
    "--shell-topbar-foreground",
    "--shell-topbar-foreground-secondary",
    "--shell-topbar-border-color",
    "--radius",
    "--brand-yellow",
    "--brand-orange",
    "--sidebar-accent-active",
    "--sidebar-accent-active-foreground",
    "--primary",
    "--primary-foreground",
    "--ring",
  ];
  for (const p of props) removeBrandProperty(p);

  if (typeof document !== "undefined") {
    const styleEl = document.getElementById("dynamic-brand-colors");
    if (styleEl) styleEl.remove();

    document.documentElement.removeAttribute("data-contrast");
    document.documentElement.removeAttribute("data-font");
    document.documentElement.style.removeProperty("--font-family-override");
  }
}

// ─── Layout Component (mounts once in dashboard layout) ───────────────────────

export function BrandColorApplier() {
  useEffect(() => {
    // Hide scrollbars on body/html for dashboard layout view
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";

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

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          try {
            const currentRaw = localStorage.getItem(BRAND_STORAGE_KEY);
            if (currentRaw) {
               applyBrandColors(normalizeBrandColors(JSON.parse(currentRaw) as Partial<BrandColors>));
            } else {
               applyBrandColors(DEFAULT_BRAND_COLORS);
            }
          } catch { /* ignore */ }
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    document.addEventListener("brand:update", onUpdate);
    document.addEventListener("brand:reset", onReset);
    return () => {
      document.removeEventListener("brand:update", onUpdate);
      document.removeEventListener("brand:reset", onReset);
      observer.disconnect();
      // Restore scrollbars on unmount
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
    };
  }, []);

  return null;
}
