import { buildBrandCss, type BrandConfig } from "@/lib/branding";
import type { Locale } from "@/lib/i18n";
import type { BrandColors } from "./brand-color-applier";
import { BrandSync } from "./brand-sync";

export function BrandStyleProvider({
  brand,
  locale,
  serverColors,
  serverIdentity,
  children,
}: {
  brand: BrandConfig;
  locale: Locale;
  serverColors?: Partial<BrandColors> | null;
  serverIdentity?: any | null;
  children: React.ReactNode;
}) {
  const dynamicCss = buildServerDynamicCss(serverColors);
  return (
    <div
      data-brand-id={brand.id}
      data-locale={locale}
      className="min-h-screen bg-background text-foreground"
      {...(serverColors?.contrast ? { "data-contrast": serverColors.contrast } : {})}
      {...(serverColors?.font ? { "data-font": serverColors.font } : {})}
    >
      <style dangerouslySetInnerHTML={{ __html: buildBrandCss(brand) }} />
      {dynamicCss && <style id="dynamic-brand-colors" dangerouslySetInnerHTML={{ __html: dynamicCss }} />}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              ${serverColors?.contrast ? `document.documentElement.setAttribute('data-contrast', '${serverColors.contrast}');` : `document.documentElement.removeAttribute('data-contrast');`}
              ${serverColors?.font ? `document.documentElement.setAttribute('data-font', '${serverColors.font}');` : `document.documentElement.removeAttribute('data-font');`}
            } catch(e) {}
          `,
        }}
      />
      <BrandSync serverColors={serverColors} serverIdentity={serverIdentity} />
      {children}
    </div>
  );
}

function hexToHslTriplet(hex: string): string {
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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function isLightColor(hex: string): boolean {
  const normalized = String(hex || "").replace("#", "");
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

function buildServerDynamicCss(colors?: Partial<BrandColors> | null) {
  if (!colors) return null;
  let css = "";
  
  if (colors.sidebarBg && colors.sidebarBg.startsWith("#")) {
    css += `--sidebar-bg: ${colors.sidebarBg};\n`;
    css += `.glass-sidebar { background: ${colors.sidebarBg} !important; }\n`;
    css += `.dark .glass-sidebar { background: ${colors.sidebarBg} !important; }\n`;
    const isLight = isLightColor(colors.sidebarBg);
    css += `--sidebar-text-primary: ${isLight ? "#0f172a" : "#f8fafc"};\n`;
    css += `--sidebar-text-secondary: ${isLight ? "rgba(15, 23, 42, 0.7)" : "rgba(248, 250, 252, 0.7)"};\n`;
    css += `--sidebar-border-color: ${isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)"};\n`;
  }
  if (colors.topbarBg && colors.topbarBg.startsWith("#")) {
    css += `--topbar-bg: ${colors.topbarBg};\n`;
    css += `.glass-topbar { background: ${colors.topbarBg} !important; }\n`;
    css += `.dark .glass-topbar { background: ${colors.topbarBg} !important; }\n`;
    const isLight = isLightColor(colors.topbarBg);
    css += `--topbar-foreground: ${isLight ? "#0f172a" : "#f8fafc"};\n`;
    css += `--topbar-foreground-secondary: ${isLight ? "rgba(15, 23, 42, 0.68)" : "rgba(248, 250, 252, 0.65)"};\n`;
    css += `--topbar-border-color: ${isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)"};\n`;
  }
  if (colors.radius) {
    css += `--radius: ${colors.radius};\n`;
  }
  if (colors.accentColor && colors.accentColor.startsWith("#")) {
    css += `--brand-yellow: ${colors.accentColor};\n`;
  }
  if (colors.primaryColor && colors.primaryColor.startsWith("#")) {
    const hsl = hexToHslTriplet(colors.primaryColor);
    css += `--brand-orange: ${colors.primaryColor};\n`;
    css += `--sidebar-accent-active: ${colors.primaryColor};\n`;
    css += `--primary: ${hsl};\n`;
    css += `--ring: ${hsl};\n`;
  }
  if (colors.font) {
    if (colors.font === "serif") {
      css += `--font-family-override: Georgia, Cambria, serif;\n`;
    } else if (colors.font === "mono") {
      css += `--font-family-override: ui-monospace, Consolas, monospace;\n`;
    } else if (colors.font === "elegant") {
      css += `--font-family-override: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n`;
    }
  }
  if (!css) return null;
  return `:root, [data-brand-id] { ${css} }`;
}
