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
  
  if (colors.brandBg && colors.brandBg.startsWith("#")) {
    css += `--sidebar-bg: ${colors.brandBg};\n`;
    css += `--topbar-bg: ${colors.brandBg};\n`;
    css += `.glass-sidebar { background: ${colors.brandBg} !important; }\n`;
    css += `.dark .glass-sidebar { background: ${colors.brandBg} !important; }\n`;
    css += `.glass-topbar { background: ${colors.brandBg} !important; }\n`;
    css += `.dark .glass-topbar { background: ${colors.brandBg} !important; }\n`;
    
    const isLight = isLightColor(colors.brandBg);
    const borderColor = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)";
    
    css += `--sidebar-border-color: ${borderColor};\n`;
    css += `--shell-sidebar-border-color: ${borderColor};\n`;
    css += `--topbar-border-color: ${borderColor};\n`;
    css += `--shell-topbar-border-color: ${borderColor};\n`;
  }
  if (colors.brandText && colors.brandText.startsWith("#")) {
    css += `--sidebar-text-primary: ${colors.brandText};\n`;
    css += `--shell-sidebar-foreground: ${colors.brandText};\n`;
    css += `--topbar-foreground: ${colors.brandText};\n`;
    css += `--shell-topbar-foreground: ${colors.brandText};\n`;
    
    const isLightText = isLightColor(colors.brandText);
    const secondaryColor = isLightText ? "rgba(255, 255, 255, 0.7)" : "rgba(15, 23, 42, 0.7)";
    
    css += `--sidebar-text-secondary: ${secondaryColor};\n`;
    css += `--shell-sidebar-foreground-secondary: ${secondaryColor};\n`;
    css += `--topbar-foreground-secondary: ${secondaryColor};\n`;
    css += `--shell-topbar-foreground-secondary: ${secondaryColor};\n`;
  }
  if (colors.radius) {
    css += `--radius: ${colors.radius};\n`;
  }
  if (colors.brandAccent && colors.brandAccent.startsWith("#")) {
    const hsl = hexToHslTriplet(colors.brandAccent);
    const isLight = isLightColor(colors.brandAccent);
    const primaryForegroundHex = isLight ? "#0f172a" : "#ffffff";
    const primaryForegroundHsl = hexToHslTriplet(primaryForegroundHex);
    const hoverColor = isLight ? "rgba(15, 23, 42, 0.06)" : "rgba(255, 255, 255, 0.08)";
    
    css += `--brand-orange: ${colors.brandAccent};\n`;
    css += `--brand-yellow: ${colors.brandAccent};\n`;
    css += `--sidebar-accent-active: ${colors.brandAccent};\n`;
    css += `--sidebar-accent-active-foreground: ${primaryForegroundHex};\n`;
    css += `--sidebar-accent-hover: ${hoverColor};\n`;
    css += `--sidebar-accent: ${hoverColor};\n`;
    css += `--primary: ${hsl};\n`;
    css += `--primary-foreground: ${primaryForegroundHsl};\n`;
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
