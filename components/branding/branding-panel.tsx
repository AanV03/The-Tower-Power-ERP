"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImagePlus, RotateCcw, Upload } from "lucide-react";

import {
  applyBrandColors,
  resetBrandColors,
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND_COLORS,
  normalizeBrandColors,
  type BrandColors,
} from "@/components/branding/brand-color-applier";
import {
  DEFAULT_BRAND_IDENTITY,
  loadBrandIdentity,
  persistBrandIdentity,
  resetBrandIdentity,
  type BrandIdentity,
} from "@/components/branding/brand-identity";
import { defaultLocale, formatMessage, getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";

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
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [colors, setColors] = useState<BrandColors>(loadSaved);
  const [identity, setIdentity] = useState<BrandIdentity>(DEFAULT_BRAND_IDENTITY);
  const [logoError, setLogoError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    setColors(saved);
    applyBrandColors(saved);
    setIdentity(loadBrandIdentity());
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

  const handleIdentityChange = useCallback((key: keyof BrandIdentity, value: string) => {
    setIdentity((prev) => {
      const next = { ...prev, [key]: value };
      try {
        persistBrandIdentity(next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleLogoUpload = useCallback((file: File | undefined) => {
    setLogoError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError(l === "es" ? "Sube un archivo de imagen." : "Upload an image file.");
      return;
    }

    if (file.size > 350 * 1024) {
      setLogoError(l === "es" ? "Usa un logo menor a 350 KB." : "Use a logo under 350 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const logoDataUrl = typeof reader.result === "string" ? reader.result : "";
      setIdentity((prev) => {
        const next = { ...prev, logoDataUrl };
        try {
          persistBrandIdentity(next);
        } catch {
          setLogoError(l === "es" ? "No se pudo guardar el logo." : "Could not save the logo.");
        }
        return next;
      });
    };
    reader.readAsDataURL(file);
  }, [l]);

  const clearLogo = useCallback(() => {
    setIdentity((prev) => {
      const next = { ...prev, logoDataUrl: undefined };
      try {
        persistBrandIdentity(next);
      } catch { /* ignore */ }
      return next;
    });
    if (logoInputRef.current) logoInputRef.current.value = "";
  }, []);

  const handleSave = () => {
    try {
      persistColors(colors);
      applyBrandColors(colors);
      persistBrandIdentity(identity);
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
    resetBrandIdentity();
    setIdentity(DEFAULT_BRAND_IDENTITY);
    setLogoError("");
    if (logoInputRef.current) logoInputRef.current.value = "";
    document.dispatchEvent(new CustomEvent("brand:reset"));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("El logo no debe superar los 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setColors((prev) => {
        const next = { ...prev, logoUrl: base64 };
        try {
          persistColors(next);
          document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
        } catch { /* ignore */ }
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setColors((prev) => {
      const next = { ...prev, logoUrl: "" };
      try {
        persistColors(next);
        document.dispatchEvent(new CustomEvent("brand:update", { detail: next }));
      } catch { /* ignore */ }
      return next;
    });
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

      <div className="grid gap-4 border-b border-border p-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border text-lg font-black shadow-sm"
              style={{ backgroundColor: "var(--brand-yellow)", color: "var(--brand-ink)" }}
            >
              {identity.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={identity.logoDataUrl} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : (
                <span>{identity.logoText.slice(0, 3).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-card-foreground">
                {l === "es" ? "Logo del cliente" : l === "en" ? "Client logo" : "Logo client"}
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {l === "es"
                  ? "Se muestra en el sidebar y navbar. Usa PNG, JPG o WebP ligero."
                  : l === "en"
                    ? "Shown in the sidebar and navbar. Use a lightweight PNG, JPG, or WebP."
                    : "Affiche dans le sidebar et la barre superieure."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(event) => handleLogoUpload(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Upload className="size-4" aria-hidden="true" />
              {l === "es" ? "Subir logo" : l === "en" ? "Upload logo" : "Importer"}
            </button>
            <button
              type="button"
              onClick={clearLogo}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {l === "es" ? "Usar iniciales" : l === "en" ? "Use initials" : "Initiales"}
            </button>
          </div>

          {logoError && (
            <p className="mt-3 text-xs font-medium text-destructive">{logoError}</p>
          )}
        </div>

        <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {l === "es" ? "Nombre visible" : l === "en" ? "Display name" : "Nom affiche"}
            </span>
            <input
              value={identity.name}
              onChange={(event) => handleIdentityChange("name", event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)]"
              maxLength={36}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {l === "es" ? "Iniciales" : l === "en" ? "Initials" : "Initiales"}
            </span>
            <input
              value={identity.logoText}
              onChange={(event) => handleIdentityChange("logoText", event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)]"
              maxLength={3}
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {l === "es" ? "Subtitulo del sidebar" : l === "en" ? "Sidebar subtitle" : "Sous-titre"}
            </span>
            <input
              value={identity.subtitle}
              onChange={(event) => handleIdentityChange("subtitle", event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)]"
              maxLength={48}
            />
          </label>
        </div>
      </div>

      {/* ── Grid 2×2 en desktop, 1 col en mobile ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
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

      {/* ── Logo Upload ── */}
      <div className="border-t border-border bg-card px-6 py-5">
        <label htmlFor="logo-upload" className="text-sm font-semibold leading-none text-card-foreground block mb-3">
          Logotipo de la Empresa
        </label>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/20 overflow-hidden group">
            {colors.logoUrl ? (
              <>
                <img src={colors.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleRemoveLogo} className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-105 transition-transform">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                <ImageIcon className="w-6 h-6 opacity-50" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Vacio</span>
              </div>
            )}
          </div>
          <div className="space-y-2 flex-1">
            <p className="text-xs text-muted-foreground max-w-sm">
              Sube el logo corporativo del tenant. Este reemplazará al texto &quot;GE&quot; en la barra lateral.
              Se recomiendan imágenes cuadradas o transparentes (PNG/SVG) menores a 2MB.
            </p>
            <div className="relative">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button type="button" className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                Subir Imagen
              </button>
            </div>
          </div>
        </div>
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
