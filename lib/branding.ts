export type BrandMode = "light" | "dark";

export type BrandPalette = {
  canvas: string;
  surface: string;
  ink: string;
  navy: string;
  orange: string;
  yellow: string;
  red: string;
  green: string;
};

export type BrandConfig = {
  id: string;
  name: string;
  logoText: string;
  radius: string;
  palettes: Record<BrandMode, BrandPalette>;
};

export const defaultBrand: BrandConfig = {
  id: "gerpy",
  name: "Gerpy ERP",
  logoText: "GE",
  radius: "0.75rem",
  palettes: {
    light: {
      orange: "#fb8500",
      surface: "#f1f5f9",
      yellow: "#edc531",
      canvas: "#f8fafc",
      red: "#ef4444",
      green: "#10b981",
      ink: "#0f172a",
      navy: "#0a1128",
    },
    dark: {
      orange: "#fb8500",
      yellow: "#edc531",
      ink: "#f8fafc",
      navy: "#0a1128",
      red: "#ef4444",
      green: "#10b981",
      surface: "#1e293b",
      canvas: "#0b0f19",
    },
  },
};

export function buildBrandCss(brand: BrandConfig) {
  const light = toCssVariables(brand, "light");
  const dark = toCssVariables(brand, "dark");

  return `
    [data-brand-id="${brand.id}"] { ${light} }
    .dark [data-brand-id="${brand.id}"] { ${dark} }
  `;
}

function isLightColor(hex: string): boolean {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

function toCssVariables(brand: BrandConfig, mode: BrandMode) {
  const palette = brand.palettes[mode];
  const isDark = mode === "dark";
  const sidebarBg = palette.navy;
  const topbarBg = palette.navy;
  const isSidebarLight = isLightColor(sidebarBg);
  const isTopbarLight = isLightColor(topbarBg);

  return [
    `--brand-orange: ${palette.orange};`,
    `--brand-yellow: ${palette.yellow};`,
    `--brand-ink: ${palette.ink};`,
    `--brand-navy: ${palette.navy};`,
    `--brand-red: ${palette.red};`,
    `--brand-green: ${palette.green};`,
    `--brand-surface: ${palette.surface};`,
    `--brand-canvas: ${palette.canvas};`,
    `--radius: ${brand.radius};`,
    `--sidebar-bg: ${sidebarBg};`,
    `--topbar-bg: ${topbarBg};`,
    `--sidebar-text-primary: ${isSidebarLight ? "#0f172a" : "#f8fafc"};`,
    `--sidebar-text-secondary: ${isSidebarLight ? "rgba(15, 23, 42, 0.7)" : "rgba(248, 250, 252, 0.7)"};`,
    `--sidebar-border-color: ${isSidebarLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)"};`,
    `--topbar-foreground: ${isTopbarLight ? "#0f172a" : "#f8fafc"};`,
    `--topbar-border-color: ${isTopbarLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.09)"};`,
    `--background: ${palette.canvas};`,
    `--foreground: ${palette.ink};`,
    `--card: ${isDark ? "rgba(22, 28, 45, 0.6)" : "rgba(255, 255, 255, 0.65)"};`,
    `--card-foreground: ${palette.ink};`,
    `--popover: ${isDark ? "rgba(22, 28, 45, 0.85)" : "rgba(255, 255, 255, 0.85)"};`,
    `--popover-foreground: ${palette.ink};`,
    `--primary: ${palette.orange};`,
    `--primary-foreground: #ffffff;`,
    `--secondary: ${palette.surface};`,
    `--secondary-foreground: ${palette.ink};`,
    `--muted: ${palette.surface};`,
    `--muted-foreground: ${isDark ? "#94a3b8" : "#64748b"};`,
    `--accent: ${palette.surface};`,
    `--accent-foreground: ${palette.ink};`,
    `--destructive: ${palette.red};`,
    `--destructive-foreground: #ffffff;`,
    `--border: ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"};`,
    `--input: ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"};`,
    `--ring: ${palette.orange};`,
  ].join(" ");
}

function hexToHslTriplet(hex: string) {
  const normalized = hex.replace("#", "");
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

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
