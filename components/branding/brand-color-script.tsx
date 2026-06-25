import { BRAND_STORAGE_KEY, DEFAULT_BRAND_COLORS } from "@/components/branding/brand-color-applier";

const script = `
(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
  }
  const storageKey = ${JSON.stringify(BRAND_STORAGE_KEY)};
  const defaults = ${JSON.stringify(DEFAULT_BRAND_COLORS)};
  const hexToHslTriplet = (hex) => {
    const normalized = String(hex || "").replace("#", "");
    if (normalized.length !== 6) return "35 96% 50%";
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
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return Math.round(h * 360) + " " + Math.round(s * 100) + "% " + Math.round(l * 100) + "%";
  };
  const isLightColor = (hex) => {
    const normalized = String(hex || "").replace("#", "");
    if (normalized.length !== 6) return false;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128;
  };
  const currentScript = document.currentScript;
  const brandScope = currentScript ? currentScript.closest("[data-brand-id]") : null;
  const setProperty = (name, value) => {
    document.documentElement.style.setProperty(name, value);
    if (brandScope) brandScope.style.setProperty(name, value);
  };

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const colors = { ...defaults, ...JSON.parse(raw) };

    if (colors.sidebarBg && colors.sidebarBg.startsWith("#")) {
      setProperty("--sidebar-bg", colors.sidebarBg);
      const isLight = isLightColor(colors.sidebarBg);
      setProperty("--sidebar-text-primary", isLight ? "#0f172a" : "#f8fafc");
      setProperty("--sidebar-text-secondary", isLight ? "rgba(15, 23, 42, 0.7)" : "rgba(248, 250, 252, 0.7)");
      setProperty("--sidebar-border-color", isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)");
    }

    if (colors.topbarBg && colors.topbarBg.startsWith("#")) {
      setProperty("--topbar-bg", colors.topbarBg);
      const isLight = isLightColor(colors.topbarBg);
      setProperty("--topbar-foreground", isLight ? "#0f172a" : "#f8fafc");
      setProperty("--topbar-border-color", isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)");
    }

    setProperty("--radius", colors.radius);

    if (colors.accentColor && colors.accentColor.startsWith("#")) {
      setProperty("--brand-yellow", colors.accentColor);
    }

    if (colors.primaryColor && colors.primaryColor.startsWith("#")) {
      setProperty("--brand-orange", colors.primaryColor);
      setProperty("--sidebar-accent-active", colors.primaryColor);
      setProperty("--primary", colors.primaryColor);
      setProperty("--ring", colors.primaryColor);
    }

    if (colors.contrast) {
      document.documentElement.setAttribute("data-contrast", colors.contrast);
    }

    if (colors.font) {
      document.documentElement.setAttribute("data-font", colors.font);
      if (colors.font === "serif") {
        document.documentElement.style.setProperty("--font-family-override", "Georgia, Cambria, serif");
      } else if (colors.font === "mono") {
        document.documentElement.style.setProperty("--font-family-override", "ui-monospace, Consolas, monospace");
      } else if (colors.font === "elegant") {
        document.documentElement.style.setProperty("--font-family-override", "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
      }
    }
  } catch {
    // Ignore invalid localStorage payloads.
  }
})();
`;

export function BrandColorScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
