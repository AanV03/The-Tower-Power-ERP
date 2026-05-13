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
  radius: "0.5rem",
  palettes: {
    light: {
      orange: "#ffb423",
      surface: "#f4f4f4",
      yellow: "#ffd700",
      canvas: "#fcfcfc",
      red: "#e60a1a",
      green: "#00e699",
      ink: "#212529",
      navy: "#023047",
    },
    dark: {
      orange: "#fb8500",
      yellow: "#edc531",
      ink: "#f4f4f4",
      navy: "#023047",
      red: "#a60713",
      green: "#00bc7d",
      surface: "#2c3036",
      canvas: "#212529",
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

function toCssVariables(brand: BrandConfig, mode: BrandMode) {
  const palette = brand.palettes[mode];
  const isDark = mode === "dark";

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
    `--background: ${hexToHslTriplet(palette.canvas)};`,
    `--foreground: ${hexToHslTriplet(palette.ink)};`,
    `--card: ${isDark ? hexToHslTriplet("#2c3036") : hexToHslTriplet("#ffffff")};`,
    `--card-foreground: ${hexToHslTriplet(palette.ink)};`,
    `--popover: ${isDark ? hexToHslTriplet("#2c3036") : hexToHslTriplet("#ffffff")};`,
    `--popover-foreground: ${hexToHslTriplet(palette.ink)};`,
    `--primary: ${hexToHslTriplet(palette.orange)};`,
    `--primary-foreground: ${hexToHslTriplet("#212529")};`,
    `--secondary: ${hexToHslTriplet(palette.surface)};`,
    `--secondary-foreground: ${hexToHslTriplet(palette.ink)};`,
    `--muted: ${hexToHslTriplet(palette.surface)};`,
    `--muted-foreground: ${isDark ? "210 7% 72%" : "210 5% 42%"};`,
    `--accent: ${hexToHslTriplet(palette.green)};`,
    `--accent-foreground: ${hexToHslTriplet(isDark ? "#212529" : "#ffffff")};`,
    `--destructive: ${hexToHslTriplet(palette.red)};`,
    `--destructive-foreground: ${hexToHslTriplet("#ffffff")};`,
    `--border: ${isDark ? "210 8% 28%" : "210 9% 88%"};`,
    `--input: ${isDark ? "210 8% 28%" : "210 9% 88%"};`,
    `--ring: ${hexToHslTriplet(palette.orange)};`,
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
