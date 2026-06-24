"use client";

import { useState, useCallback, useEffect } from "react";

import {
  applyBrandColors,
  resetBrandColors,
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND_COLORS,
  normalizeBrandColors,
  type BrandColors,
} from "@/components/branding/brand-color-applier";
import { defaultLocale, formatMessage, getDictionary, isLocale, type Locale } from "@/lib/i18n";

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadSaved(): BrandColors {
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (raw) return normalizeBrandColors(JSON.parse(raw) as Partial<BrandColors>);
  } catch { /* ignore */ }
  return { ...DEFAULT_BRAND_COLORS };
}

function toColorInputValue(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : "#023047";
}

function hasCompletePalette(colors: BrandColors) {
  return (
    !!colors.sidebarBg &&
    !!colors.topbarBg &&
    !!colors.primaryColor &&
    !!colors.accentColor
  );
}

function persistColors(colors: BrandColors) {
  if (!hasCompletePalette(colors)) return;
  localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(colors));
}

// ─── Color Card ───────────────────────────────────────────────────────────────

interface ColorCardProps {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  colorPickerLabel: string;
  colorHexLabel: string;
  changeColorTitle: string;
}

function ColorCard({
  id,
  label,
  description,
  value,
  onChange,
  colorPickerLabel,
  colorHexLabel,
  changeColorTitle,
}: ColorCardProps) {
  const pickerHex = toColorInputValue(value);

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:border-[var(--sidebar-accent-active)]/40 hover:shadow-md">
      {/* Swatch grande — overflow-hidden aquí para que los bordes superiores sean redondeados */}
      <div className="relative h-28 overflow-hidden rounded-t-xl">
        <input
          key={`${id}-picker-${pickerHex}`}
          id={`${id}-picker`}
          type="color"
          value={pickerHex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          autoComplete="off"
          aria-label={colorPickerLabel}
        />
        <div
          className="block w-full h-full transition-opacity group-hover:opacity-90"
          style={{ backgroundColor: pickerHex }}
          title={changeColorTitle}
          aria-hidden="true"
        >
          {/* Overlay hover */}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white drop-shadow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.94.52l-3.414.853.853-3.414a2 2 0 01.52-.94z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Info + input hex */}
      <div className="flex flex-col gap-2 p-4">
        <label
          htmlFor={id}
          className="text-sm font-semibold leading-none text-card-foreground"
        >
          {label}
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Input hex */}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)] transition-colors"
          spellCheck={false}
          aria-label={colorHexLabel}
        />
      </div>
    </div>
  );
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const COLOR_FIELDS: {
  key: "sidebarBg" | "topbarBg" | "primaryColor" | "accentColor";
}[] = [
  {
    key: "sidebarBg",
  },
  {
    key: "topbarBg",
  },
  {
    key: "primaryColor",
  },
  {
    key: "accentColor",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface BrandingPanelProps {
  locale: string;
}

export function BrandingPanel({ locale }: BrandingPanelProps) {
  const l: Locale = isLocale(locale) ? locale : defaultLocale;
  const t = getDictionary(l).branding;

  const [colors, setColors] = useState<BrandColors>(loadSaved);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    setColors(saved);
    applyBrandColors(saved);
  }, []);

  // Live preview: apply brand colors to :root whenever the user changes any value
  useEffect(() => {
    applyBrandColors(colors);
    try {
      persistColors(colors);
    } catch { /* ignore */ }
  }, [colors]);

  const handleChange = useCallback((key: keyof BrandColors, value: string) => {
    setColors((prev) => {
      const next = { ...prev, [key]: value };
      try {
        persistColors(next);
        document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleContrastChange = (contrast: "normal" | "medium" | "high") => {
    setColors((prev) => {
      const next = { ...prev, contrast };
      try {
        persistColors(next);
        document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleFontChange = (font: "default" | "serif" | "mono" | "elegant") => {
    setColors((prev) => {
      const next = { ...prev, font };
      try {
        persistColors(next);
        document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleSave = () => {
    try {
      persistColors(colors);
      applyBrandColors(colors);
      document.dispatchEvent(new CustomEvent("brand:update", { detail: colors }));
    } catch { /* ignore */ }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleReset = () => {
    const defaults = { ...DEFAULT_BRAND_COLORS };
    setColors(defaults);
    try {
      localStorage.removeItem(BRAND_STORAGE_KEY);
    } catch { /* ignore */ }
    resetBrandColors();
    document.dispatchEvent(new CustomEvent("brand:reset"));
  };

  return (
    <section
      aria-label={t.title}
      className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm w-full"
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-6 py-5">
        <div className="flex items-center gap-3">
          {/* Swatches animados */}
          <div className="flex gap-1.5">
            {[colors.sidebarBg, colors.topbarBg, colors.primaryColor, colors.accentColor].map((c, i) => (
              <span
                key={i}
                className="block w-5 h-5 rounded-full border border-gray-300 shadow-sm transition-all duration-500 dark:border-white/20"
                style={{ backgroundColor: toColorInputValue(c) }}
              />
            ))}
          </div>
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              {t.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.previewDesc}
            </p>
          </div>
        </div>

        {/* Badge live preview — usa --brand-yellow como fondo para que el color secundario tenga preview visible */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: "var(--brand-yellow)",
            color: "#212529",
            border: "1px solid transparent",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          {t.preview}
        </span>
      </div>

      {/* ── Grid 1 col en mobile, 2 en sm, 4 en lg ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 w-full">
        {COLOR_FIELDS.map((f) => (
          <ColorCard
            key={f.key}
            id={`brand-${f.key}`}
            label={t.fields[f.key].label}
            description={t.fields[f.key].description}
            value={colors[f.key]}
            onChange={(v) => handleChange(f.key, v)}
            colorPickerLabel={formatMessage(t.colorPicker, { label: t.fields[f.key].label })}
            colorHexLabel={formatMessage(t.colorHex, { label: t.fields[f.key].label })}
            changeColorTitle={t.changeColorTitle}
          />
        ))}
      </div>

      {/* ── Contraste y Fuentes ── */}
      <div className="border-t border-border bg-muted/20 px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold leading-none text-card-foreground block">
            {t.contrastLabel}
          </label>
          <div className="flex gap-2">
            {[
              { id: "normal", label: t.contrastNormal },
              { id: "medium", label: t.contrastMedium },
              { id: "high", label: t.contrastHigh },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleContrastChange(opt.id as any)}
                className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  colors.contrast === opt.id
                    ? "border-[var(--sidebar-accent-active)] bg-[var(--sidebar-accent-active)]/5 text-foreground"
                    : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold leading-none text-card-foreground block">
            {t.fontLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "default", label: t.fontDefault },
              { id: "serif", label: t.fontSerif },
              { id: "mono", label: t.fontMono },
              { id: "elegant", label: t.fontElegant },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleFontChange(opt.id as any)}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  colors.font === opt.id
                    ? "border-[var(--sidebar-accent-active)] bg-[var(--sidebar-accent-active)]/5 text-foreground"
                    : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-4">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          id="brand-reset-btn"
        >
          {t.reset}
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="relative overflow-hidden rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-accent-active)]/50 active:scale-95"
          style={{ backgroundColor: "var(--sidebar-accent-active)" }}
          id="brand-save-btn"
        >
          <span
            className={`block transition-all duration-300 ${
              savedFlash ? "opacity-0 scale-90" : "opacity-100 scale-100"
            }`}
          >
            {t.save}
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              savedFlash ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
          >
            ✓ {t.saved}
          </span>
        </button>
      </div>
    </section>
  );
}
