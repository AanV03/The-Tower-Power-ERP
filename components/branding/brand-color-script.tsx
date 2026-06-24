import { BRAND_STORAGE_KEY, DEFAULT_BRAND_COLORS } from "@/components/branding/brand-color-applier";

const script = `
(() => {
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

    setProperty("--sidebar-bg", colors.sidebarBg);
    setProperty("--topbar-bg", colors.topbarBg);
    setProperty("--sidebar-text-primary", colors.sidebarText);
    setProperty("--radius", colors.radius);

    if (colors.accentColor && colors.accentColor.startsWith("#")) {
      setProperty("--brand-yellow", colors.accentColor);
    }

    if (colors.primaryColor && colors.primaryColor.startsWith("#")) {
      const hsl = hexToHslTriplet(colors.primaryColor);
      setProperty("--brand-orange", colors.primaryColor);
      setProperty("--sidebar-accent-active", colors.primaryColor);
      setProperty("--primary", hsl);
      setProperty("--ring", hsl);
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
